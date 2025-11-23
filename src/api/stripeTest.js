import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  try {
    const { plan } = req?.body;

    const prices = {
      starter: "price_1SS81iQNi2zXM9G6DrsaduKJ",
      pro: "price_1SS83BQNi2zXM9G6f2z1byYD",
    };

    if (!prices?.[plan]) return res?.status(400)?.json({ error: "Invalid plan" });

    const session = await stripe?.checkout?.sessions?.create({
      mode: "subscription",
      line_items: [{ price: prices?.[plan], quantity: 1 }],
      success_url: "https://adruby.de/payment-verification?success=true",
      cancel_url: "https://adruby.de/payment-verification?canceled=true",
    });

    return res?.json({ url: session?.url });
  } catch (err) {
    console.error("Stripe error:", err?.message);
    return res?.status(500)?.json({ error: err?.message });
  }
}