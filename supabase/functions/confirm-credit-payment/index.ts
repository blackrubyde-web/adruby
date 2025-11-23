import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req?.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req?.method === 'POST') {
      const { paymentIntentId } = await req?.json()

      if (!paymentIntentId) {
        return new Response(
          JSON.stringify({ error: 'Payment Intent ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Retrieve payment intent from Stripe
      const paymentIntent = await stripe?.paymentIntents?.retrieve(paymentIntentId)

      // Find corresponding payment order
      const { data: order, error: orderError } = await supabaseClient?.from('payment_orders')?.select('*')?.eq('stripe_payment_intent_id', paymentIntentId)?.single()

      if (orderError || !order) {
        return new Response(
          JSON.stringify({ error: 'Payment order not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Update order status based on payment status
      let orderStatus = 'pending'
      let paymentStatus = 'pending'

      switch (paymentIntent?.status) {
        case 'succeeded':
          orderStatus = 'completed'
          paymentStatus = 'succeeded'
          
          // Add credits to user account
          const { data: creditResult, error: creditError } = await supabaseClient?.rpc('add_credits', {
            p_user_id: order?.user_id,
            p_credits_to_add: order?.credits_amount,
            p_description: `Credit purchase - Order ${order?.order_number}`
          })
          
          if (creditError) {
            console.error('Error adding credits:', creditError)
            // Payment succeeded but credit addition failed - needs manual review
            orderStatus = 'processing'
          }
          
          break
        case 'requires_payment_method':
        case 'requires_confirmation':
        case 'requires_action':
          orderStatus = 'pending'
          paymentStatus = 'pending'
          break
        case 'canceled':
          orderStatus = 'cancelled'
          paymentStatus = 'cancelled'
          break
        default:
          orderStatus = 'failed'
          paymentStatus = 'failed'
      }

      // Update payment order in database
      const { error: updateError } = await supabaseClient?.from('payment_orders')?.update({
          status: orderStatus,
          payment_status: paymentStatus,
          updated_at: new Date()?.toISOString()
        })?.eq('id', order?.id)

      if (updateError) {
        console.error('Order update error:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update payment order' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          success: paymentIntent.status === 'succeeded',
          order: {
            ...order,
            status: orderStatus,
            payment_status: paymentStatus
          },
          payment_intent: paymentIntent,
          credits_added: paymentIntent.status === 'succeeded' ? order.credits_amount : 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Credit payment confirmation error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})