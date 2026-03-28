import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const APP_URL = Deno.env.get('APP_URL') || 'https://youneek-pro-radar.base44.app';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }

  try {
    const { priceId, label } = await req.json().catch(() => ({}));

    if (!priceId) {
      return Response.json({ error: 'Missing priceId' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_URL}/Success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/Store`,
      metadata: { label: label || 'YouNeeK Pro Radar' },
    });

    return Response.json({ url: session.url }, { headers: { 'Access-Control-Allow-Origin': '*' } });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
