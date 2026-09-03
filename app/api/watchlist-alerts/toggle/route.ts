import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

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
