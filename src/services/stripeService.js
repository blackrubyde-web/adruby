import { supabase } from '../lib/supabase';

export const stripeService = {
  // Create payment order for credit purchase
  async createCreditPurchaseOrder(userId, creditPackageId) {
    try {
      // Get credit package details
      const { data: creditPackage, error: packageError } = await supabase?.from('credit_packages')?.select('*')?.eq('id', creditPackageId)?.eq('is_active', true)?.single();

      if (packageError) throw packageError;
      if (!creditPackage) throw new Error('Credit package not found');

      // Create payment order
      const { data: order, error: orderError } = await supabase?.from('payment_orders')?.insert({
          user_id: userId,
          credit_package_id: creditPackageId,
          amount_cents: creditPackage?.price_cents,
          currency: creditPackage?.currency,
          credits_amount: creditPackage?.credits,
          status: 'pending',
          payment_status: 'pending'
        })?.select()?.single();

      if (orderError) throw orderError;

      return {
        orderId: order?.id,
        orderNumber: order?.order_number,
        amount: creditPackage?.price_cents,
        currency: creditPackage?.currency,
        credits: creditPackage?.credits,
        packageName: creditPackage?.name
      };
    } catch (error) {
      console.error('Error creating credit purchase order:', error);
      throw error;
    }
  },

  // Create Stripe payment intent for credit purchase
  async createPaymentIntent(orderId, customerInfo) {
    try {
      // Get order details
      const { data: order, error: orderError } = await supabase?.from('payment_orders')?.select(`
          *,
          credit_packages (
            name,
            credits
          )
        `)?.eq('id', orderId)?.single();

      if (orderError) throw orderError;
      if (!order) throw new Error('Order not found');

      // Prepare order data for Stripe
      const orderData = {
        items: [{
          id: order?.credit_package_id,
          name: `${order?.credit_packages?.name} - ${order?.credits_amount} Credits`,
          price: order?.amount_cents / 100,
          quantity: 1
        }],
        total: order?.amount_cents / 100,
        currency: order?.currency?.toLowerCase(),
        subtotal: order?.amount_cents / 100,
        tax: 0,
        shipping_cost: 0,
        discount: 0
      };

      // Create payment intent via Supabase Edge Function - FIXED: Use correct function name
      const { data, error } = await supabase?.functions?.invoke('create-credit-payment-intent', {
        body: {
          orderData,
          customerInfo: {
            ...customerInfo,
            userId: order?.user_id
          }
        }
      });

      if (error) throw error;

      // Update order with Stripe payment intent ID
      await supabase?.from('payment_orders')?.update({
          stripe_payment_intent_id: data?.paymentIntentId,
          status: 'processing'
        })?.eq('id', orderId);

      return {
        clientSecret: data?.clientSecret,
        paymentIntentId: data?.paymentIntentId,
        orderId: order?.id,
        orderNumber: order?.order_number,
        amount: data?.amount,
        currency: data?.currency
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  // Confirm payment and add credits to user
  async confirmPayment(paymentIntentId) {
    try {
      // Confirm payment via Supabase Edge Function - FIXED: Use correct function name
      const { data, error } = await supabase?.functions?.invoke('confirm-credit-payment', {
        body: { 
          paymentIntentId 
        }
      });

      if (error) throw error;

      // Get order details
      const { data: order, error: orderError } = await supabase?.from('payment_orders')?.select('*')?.eq('stripe_payment_intent_id', paymentIntentId)?.single();

      if (orderError) throw orderError;
      if (!order) throw new Error('Order not found');

      // If payment succeeded, add credits to user
      if (data?.payment_intent?.status === 'succeeded') {
        // Add credits using the database function
        const { data: creditResult, error: creditError } = await supabase?.rpc('add_credits', {
          p_user_id: order?.user_id,
          p_credits_to_add: order?.credits_amount,
          p_description: `Credit purchase - ${order?.order_number}`
        });

        if (creditError) {
          console.error('Error adding credits:', creditError);
          // Payment succeeded but credit addition failed - log for admin review
        }

        // Update order status
        await supabase?.from('payment_orders')?.update({
            status: 'completed',
            payment_status: 'succeeded'
          })?.eq('id', order?.id);

        return {
          success: true,
          order: {
            ...order,
            status: 'completed',
            payment_status: 'succeeded'
          },
          credits_added: order?.credits_amount,
          payment_intent: data?.payment_intent
        };
      } else {
        // Payment not successful
        await supabase?.from('payment_orders')?.update({
            status: 'failed',
            payment_status: 'failed'
          })?.eq('id', order?.id);

        return {
          success: false,
          order: {
            ...order,
            status: 'failed', 
            payment_status: 'failed'
          },
          payment_intent: data?.payment_intent
        };
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  },

  // Get payment history for user
  async getPaymentHistory(userId, limit = 20) {
    try {
      const { data, error } = await supabase?.from('payment_orders')?.select(`
          *,
          credit_packages (
            name,
            credits
          )
        `)?.eq('user_id', userId)?.order('created_at', { ascending: false })?.limit(limit);

      if (error) throw error;

      return data?.map(order => ({
        id: order?.id,
        orderNumber: order?.order_number,
        packageName: order?.credit_packages?.name || 'Unknown Package',
        creditsAmount: order?.credits_amount,
        amountFormatted: this.formatPrice(order?.amount_cents, order?.currency),
        status: order?.status,
        paymentStatus: order?.payment_status,
        createdAt: order?.created_at
      }));
    } catch (error) {
      console.error('Error getting payment history:', error);
      throw error;
    }
  },

  // Format price helper
  formatPrice(priceCents, currency = 'EUR') {
    const price = priceCents / 100;
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency
    })?.format(price);
  }
};