import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * POST /api/watchlist-alerts/mark-read
 * Marks all unread alerts as read for the current user.
 */
export async function POST() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'));
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
