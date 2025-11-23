import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

// Add this block - Declare Deno types for Deno runtime environment
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req?.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Stripe with secret key
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Initialize Supabase client with service role key for admin operations
    const supabaseClient = createClient(
      Deno?.env?.get('SUPABASE_URL') ?? '',
      Deno?.env?.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req?.method === 'POST') {
      const { orderData, customerInfo } = await req?.json()

      // Validate required data
      if (!orderData || !orderData?.items || orderData?.items?.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Order data is required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // German/European compliance validation
      if (!customerInfo?.firstName || !customerInfo?.lastName) {
        return new Response(
          JSON.stringify({ error: 'Customer name is required for European regulations' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (!customerInfo?.billing?.address_line_1 || !customerInfo?.billing?.city) {
        return new Response(
          JSON.stringify({ error: 'Billing address is required for European regulations' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Calculate total amount in cents
      const totalAmount = Math.round(orderData?.total * 100)

      // Generate order number
      const orderNumber = `CR-${new Date()?.getFullYear()}-${Math.random()?.toString()?.substr(2, 8)}`

      // Create or get Stripe customer
      let stripeCustomer
      const customerData = {
        name: `${customerInfo?.firstName} ${customerInfo?.lastName}`,
        email: customerInfo?.email,
        phone: customerInfo?.phone,
        address: {
          line1: customerInfo?.billing?.address_line_1,
          line2: customerInfo?.billing?.address_line_2,
          city: customerInfo?.billing?.city,
          state: customerInfo?.billing?.state,
          postal_code: customerInfo?.billing?.postal_code,
          country: customerInfo?.billing?.country || 'DE'
        }
      }

      if (customerInfo?.stripeCustomerId) {
        // Update existing customer
        stripeCustomer = await stripe?.customers?.update(customerInfo?.stripeCustomerId, customerData)
      } else {
        // Create new customer
        stripeCustomer = await stripe?.customers?.create(customerData)
        
        // Update user profile with Stripe customer ID
        await supabaseClient?.from('user_profiles')?.update({ stripe_customer_id: stripeCustomer?.id })?.eq('id', customerInfo?.userId)
      }

      // Create payment intent data for credit purchase
      const paymentIntentData = {
        amount: totalAmount,
        currency: orderData?.currency || 'eur',
        customer: stripeCustomer?.id,
        description: `AdRuby Credits - ${orderData?.items?.map(item => item?.name)?.join(', ')}`,
        metadata: {
          order_number: orderNumber,
          customer_name: customerData?.name,
          customer_email: customerInfo?.email,
          product_type: 'credits',
          user_id: customerInfo?.userId
        },
        automatic_payment_methods: {
          enabled: true,
        },
        receipt_email: customerInfo?.email
      }

      // Create payment intent
      const paymentIntent = await stripe?.paymentIntents?.create(paymentIntentData)

      return new Response(
        JSON.stringify({
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          orderNumber: orderNumber,
          amount: totalAmount,
          currency: paymentIntent.currency
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Credit payment intent creation error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})