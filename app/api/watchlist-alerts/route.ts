import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * POST /api/watchlist-alerts
 * 
 * Scans all watched agents, compares current pulse_score vs last_pulse,
 * inserts surge alerts for watchers whose threshold is met, and updates
 * the last_pulse snapshot on each watchlist row.
 *
 * Secured by ADMIN_EMAIL check — call from a cron job or admin dashboard.
 */
export async function POST(req: Request) {
    const authHeader = req.headers.get('authorization');
    const cronHeader = req.headers.get('x-cron-secret');
    const cronSecret = process.env.CRON_SECRET;
    const supabase = await createClient();

    let isAuthorized = false;

    if (cronSecret && (authHeader === `Bearer ${cronSecret}` || cronHeader === cronSecret)) {
        isAuthorized = true;
    } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email === process.env.ADMIN_EMAIL) {
            isAuthorized = true;
        }
    }

    if (!isAuthorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 1. Fetch all watchlist rows with current agent pulse scores
    const { data: rows, error: fetchErr } = await supabase
        .from('watchlist')
        .select(`
            id,
            user_id,
            agent_repo,
            alert_on_surge,
            surge_threshold,
            last_pulse,
            agents:agents!inner (
                pulse_score,
                name
            )
        `);

    if (fetchErr || !rows) {
        return NextResponse.json({ error: fetchErr?.message ?? 'fetch failed' }, { status: 500 });
    }

    let alertsCreated = 0;
    let snapshotsUpdated = 0;

    for (const row of rows as any[]) {
        const agent = row.agents;
        if (!agent) continue;

        const currentPulse = Math.round(agent.pulse_score ?? 0);
        const lastPulse: number | null = row.last_pulse;
        const threshold: number = row.surge_threshold ?? 10;
        const alertEnabled: boolean = row.alert_on_surge ?? true;

        // Compute delta — only meaningful once we have a baseline
        if (lastPulse !== null && alertEnabled) {
            const delta = currentPulse - lastPulse;
            if (delta >= threshold) {
                // Insert alert (ignore conflict if one already exists for same delta)
                const { error: alertErr } = await supabase
                    .from('watchlist_alerts')
                    .insert({
                        user_id: row.user_id,
                        agent_repo: row.agent_repo,
                        alert_type: 'surge',
                        message: `${agent.name} surged +${delta} pts to ${currentPulse}`,
                        old_pulse: lastPulse,
                        new_pulse: currentPulse,
                    });

                if (!alertErr) alertsCreated++;
            }
        }

        // Always update the pulse snapshot for next run
        const { error: updateErr } = await supabase
            .from('watchlist')
            .update({ last_pulse: currentPulse })
            .eq('id', row.id);

        if (!updateErr) snapshotsUpdated++;
    }

    return NextResponse.json({
        success: true,
        watched: rows.length,
        alertsCreated,
        snapshotsUpdated,
    });
}
