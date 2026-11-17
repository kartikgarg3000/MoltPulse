import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const PLAN_PRICES = {
  priority: {
    name: 'MoltPulse ⚡ Priority Queue Review',
    description: 'Guaranteed 24-hour review and indexing with real-time Pulse Score calculation.',
    amount: 1000, // $10.00 in cents
  },
  featured: {
    name: 'MoltPulse 🔥 48-Hour Featured Spotlight',
    description: 'Guaranteed 24-hour review + Pinned at the top of Homepage & Directory for 48 hours.',
    amount: 2100, // $21.00 in cents
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plan, productName, repo, demoUrl, submissionId } = body;

    if (!plan || (plan !== 'priority' && plan !== 'featured')) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.headers.get('origin') || 'https://www.molt-pulse.com';

    // Fallback: If Stripe secret key isn't configured yet, check for direct Payment Links
    if (!stripeKey) {
      const fallbackUrl = plan === 'priority'
        ? process.env.NEXT_PUBLIC_STRIPE_PRIORITY_URL
        : process.env.NEXT_PUBLIC_STRIPE_FEATURED_URL;

      if (fallbackUrl) {
        return NextResponse.json({ url: fallbackUrl });
      }

      return NextResponse.json(
        {
          error: 'Stripe is not configured yet. Please add STRIPE_SECRET_KEY to your environment variables.',
        },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeKey);
    const planConfig = PLAN_PRICES[plan as keyof typeof PLAN_PRICES];

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${planConfig.name} — ${productName || 'AI Product'}`,
              description: planConfig.description,
            },
            unit_amount: planConfig.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${siteUrl}/submit?payment=success&plan=${plan}&product=${encodeURIComponent(productName || '')}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/submit?payment=canceled`,
      metadata: {
        submissionId: submissionId || '',
        productName: productName || '',
        repo: repo || '',
        demoUrl: demoUrl || '',
        plan,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
