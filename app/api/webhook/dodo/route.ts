import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const eventType = rawBody.type || rawBody.event;
    const data = rawBody.data || {};

    // Dodo Payments webhook event for successful payments
    if (eventType === 'payment.succeeded' || eventType === 'checkout.completed') {
      const metadata = data.metadata || {};
      const { submissionId, plan, productName } = metadata;
      const paymentId = data.payment_id || data.id || 'N/A';

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey && submissionId) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase
          .from('submissions')
          .update({
            notes: `PAID: Plan [${(plan || 'PRIORITY').toUpperCase()}] | Dodo Payment ID: ${paymentId}`,
            status: 'pending',
          })
          .eq('id', submissionId);
      }

      console.log(`[Dodo Webhook] Payment confirmed for ${productName || 'Submission'} (ID: ${paymentId})`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Dodo webhook processing error:', err.message);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}
