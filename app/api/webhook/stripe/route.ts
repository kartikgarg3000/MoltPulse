import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ received: true });
  }

  const stripe = new Stripe(stripeKey);
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 });
  }

  try {
    const rawBody = await req.text();
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata || {};
      const { submissionId, plan, productName } = metadata;

      // Update submission status in Supabase if service role key is configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey && submissionId) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase
          .from('submissions')
          .update({
            notes: `PAID: Plan [${plan.toUpperCase()}] | Stripe Session: ${session.id}`,
            status: 'pending', // Keeps it pending for admin review or priority ingest
          })
          .eq('id', submissionId);
      }

      console.log(`[Stripe Webhook] Payment confirmed for ${productName} (Plan: ${plan})`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Stripe webhook verification error:', err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }
}
