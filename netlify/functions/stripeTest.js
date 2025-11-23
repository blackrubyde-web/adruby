import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function handler(event, context) {
  // Only allow POST requests
  if (event?.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Handle preflight requests
  if (event?.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  }

  try {
    const { plan } = JSON.parse(event?.body);

    const prices = {
      starter: "price_1SS81iQNi2zXM9G6DrsaduKJ",
      pro: "price_1SS83BQNi2zXM9G6f2z1byYD",
    };

    if (!prices?.[plan]) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: "Invalid plan" })
      };
    }

    const session = await stripe?.checkout?.sessions?.create({
      mode: "subscription",
      line_items: [{ price: prices?.[plan], quantity: 1 }],
      success_url: "https://adruby.de/payment-verification?success=true",
      cancel_url: "https://adruby.de/payment-verification?canceled=true",
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ url: session?.url })
    };
  } catch (err) {
    console.error("Stripe error:", err?.message);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: err?.message })
    };
  }
}