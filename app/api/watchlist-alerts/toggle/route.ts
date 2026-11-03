import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

/**
 * POST /api/watchlist-alerts/toggle
 * Toggles alert_on_surge for a specific watchlist row owned by the current user.
 * Body: { watchlistId: string, enabled: 'true' | 'false' }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'));
  }

  // Rate limit: 10 requests per minute per user
  const rl = checkRateLimit('watchlist-toggle', user.id, 10, 60_000);
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before toggling again.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rl.reset - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(rl.limit),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  const formData = await request.formData();
  const watchlistId = formData.get('watchlistId') as string;
  const enabledStr = formData.get('enabled') as string;

  if (!watchlistId) {
    return NextResponse.json({ error: 'Missing watchlistId' }, { status: 400 });
  }

  const enabled = enabledStr === 'true';

  // Security: only update rows owned by this user
  await supabase
    .from('watchlist')
    .update({ alert_on_surge: enabled })
    .eq('id', watchlistId)
    .eq('user_id', user.id);

  return NextResponse.redirect(
    new URL('/watchlist', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000')
  );
}
