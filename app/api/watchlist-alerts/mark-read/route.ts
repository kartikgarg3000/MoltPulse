import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

/**
 * POST /api/watchlist-alerts/mark-read
 * Marks all unread alerts as read for the current user.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'));
  }

  // Rate limit: 5 requests per minute per user
  const rl = checkRateLimit('mark-read', user.id, 5, 60_000);
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before marking alerts as read again.' },
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

  await supabase
    .from('watchlist_alerts')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null);

  // Redirect back to watchlist
  return NextResponse.redirect(
    new URL('/watchlist', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000')
  );
}
