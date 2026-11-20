import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plan, productName, repo, demoUrl, submissionId, email } = body;

    if (!plan || (plan !== 'priority' && plan !== 'featured')) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.headers.get('origin') || 'https://www.molt-pulse.com';

    // 1. Check for Direct Dodo Payment Links (Test or Live)
    const directUrl = plan === 'priority'
      ? (process.env.NEXT_PUBLIC_DODO_PRIORITY_URL || process.env.DODO_PRIORITY_URL || process.env.NEXT_PUBLIC_STRIPE_PRIORITY_URL)
      : (process.env.NEXT_PUBLIC_DODO_FEATURED_URL || process.env.DODO_FEATURED_URL || process.env.NEXT_PUBLIC_STRIPE_FEATURED_URL);

    if (directUrl) {
      // Append return URL and metadata query params if supported
      const checkoutUrl = new URL(directUrl);
      checkoutUrl.searchParams.set('redirect_url', `${siteUrl}/submit?payment=success&plan=${plan}&product=${encodeURIComponent(productName || '')}`);
      if (submissionId) checkoutUrl.searchParams.set('client_reference_id', submissionId);
      return NextResponse.json({ url: checkoutUrl.toString() });
    }

    // 2. Check for Dodo Payments API Key
    const apiKey = process.env.DODO_PAYMENTS_API_KEY;

    if (apiKey) {
      const isTest = apiKey.startsWith('test_') || process.env.DODO_PAYMENTS_ENV === 'test';
      const baseUrl = isTest ? 'https://test.dodopayments.com' : 'https://live.dodopayments.com';

      const productId = plan === 'priority'
        ? process.env.DODO_PRODUCT_PRIORITY_ID
        : process.env.DODO_PRODUCT_FEATURED_ID;

      if (!productId) {
        return NextResponse.json(
          {
            error: `Missing product ID for ${plan} plan. Please set DODO_PRODUCT_${plan.toUpperCase()}_ID or NEXT_PUBLIC_DODO_${plan.toUpperCase()}_URL in environment variables.`,
          },
          { status: 500 }
        );
      }

      const dodoRes = await fetch(`${baseUrl}/checkouts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billing: {
            country: 'US',
          },
          customer: {
            email: email || 'customer@example.com',
            name: productName || 'AI Builder',
          },
          product_cart: [
            {
              product_id: productId,
              quantity: 1,
            },
          ],
          return_url: `${siteUrl}/submit?payment=success&plan=${plan}&product=${encodeURIComponent(productName || '')}`,
          metadata: {
            submissionId: submissionId || '',
            productName: productName || '',
            repo: repo || '',
            demoUrl: demoUrl || '',
            plan,
          },
        }),
      });

      const dodoData = await dodoRes.json();

      if (!dodoRes.ok || !dodoData.checkout_url) {
        console.error('Dodo API error response:', dodoData);
        return NextResponse.json(
          { error: dodoData.message || 'Failed to create Dodo checkout session' },
          { status: 500 }
        );
      }

      return NextResponse.json({ url: dodoData.checkout_url });
    }

    return NextResponse.json(
      {
        error: 'Dodo Payments is not configured yet. Please set NEXT_PUBLIC_DODO_PRIORITY_URL and NEXT_PUBLIC_DODO_FEATURED_URL (or DODO_PAYMENTS_API_KEY) in environment variables.',
      },
      { status: 500 }
    );
  } catch (err: any) {
    console.error('Dodo checkout error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to initialize payment checkout' },
      { status: 500 }
    );
  }
}
