import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("=== Watchlist Surge Alert Generator ===");

    // Fetch all watchlist rows with joined agent data
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

    if (fetchErr) {
        console.error("Error fetching watchlist rows:", fetchErr.message);
        return;
    }

    if (!rows || rows.length === 0) {
        console.log("No watchlist entries found.");
        return;
    }

    console.log(`Checking ${rows.length} watchlist entries...`);

    let alertsCreated = 0;
    let snapshotsUpdated = 0;

    for (const row of rows as any[]) {
        const agent = row.agents;
        if (!agent) continue;

        const currentPulse = Math.round(agent.pulse_score ?? 0);
        const lastPulse: number | null = row.last_pulse;
        const threshold: number = row.surge_threshold ?? 10;
        const alertEnabled: boolean = row.alert_on_surge ?? true;

        if (lastPulse !== null && alertEnabled) {
            const delta = currentPulse - lastPulse;
            if (delta >= threshold) {
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

                if (!alertErr) {
                    console.log(`  ✓ Alert created for user ${row.user_id}: ${agent.name} (+${delta} pts)`);
                    alertsCreated++;
                } else {
                    console.error(`  ✗ Failed to create alert:`, alertErr.message);
                }
            }
        }

        // Update baseline snapshot
        const { error: updateErr } = await supabase
            .from('watchlist')
            .update({ last_pulse: currentPulse })
            .eq('id', row.id);

        if (!updateErr) snapshotsUpdated++;
    }

    console.log(`\nDone! Alerts created: ${alertsCreated}, Snapshots updated: ${snapshotsUpdated}`);
}

main().catch(err => console.error("Fatal error in watchlist alerts:", err));
