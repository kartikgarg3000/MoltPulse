
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials.");
    process.exit(1);
}

// Diagnostic logging
console.log("Supabase URL:", supabaseUrl ? "Found" : "Missing");
console.log("Supabase Key:", supabaseKey ? (supabaseKey.length > 20 ? "Found (Valid length)" : "Found (Short/Suspect)") : "Missing");

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log("Testing connection...");
    // Use select count which is cheap
    const { count, error } = await supabase.from('agents').select('*', { count: 'exact', head: true });

    if (error) {
        console.error("Connection check failed:", error.message, error.details);
        return false;
    }
    console.log(`Connection successful. Table 'agents' exists. Row count: ${count}`);
    return true;
}

// --- Pulse Score Logic ---

// 1. Growth (30%) - 0 to 30
function calculateGrowth(metrics) {
    const score = (metrics.stars_7d * 0.5) + (metrics.forks_7d * 0.3) + (metrics.contributors_30d * 0.2);
    return Math.min(30, score); // Clamp to max 30
}

// 2. Activity (25%) - 0 to 25
function calculateActivity(metrics) {
    const issuePenalty = metrics.open_issues > 50 ? 5 : 0;

    let recencyScore = 0;
    const daysSinceCommit = (new Date().getTime() - new Date(metrics.last_commit_date).getTime()) / (1000 * 3600 * 24);

    if (daysSinceCommit < 7) recencyScore = 10;
    else if (daysSinceCommit < 30) recencyScore = 7;
    else if (daysSinceCommit < 90) recencyScore = 3;

    const rawScore = (metrics.commits_30d * 0.5) + (recencyScore * 0.3) - (issuePenalty * 0.2);
    return Math.min(25, Math.max(0, rawScore));
}

// 3. Popularity (25%) - 0 to 25
function calculatePopularity(metrics) {
    const starScore = Math.log(metrics.stars + 1) * 2.5;
    const watcherScore = metrics.watchers * 0.05;

    return Math.min(25, (starScore * 0.7) + (watcherScore * 0.3));
}

// 4. Trust (20%) - 0 to 20
function calculateTrust(metrics) {
    const score = (metrics.upvotes * 1.0) + (metrics.watchlist_adds * 0.5) - (metrics.downvotes * 1.5);
    return Math.min(20, Math.max(0, score));
}


async function updatePulseScores() {
    const isConnected = await testConnection();
    if (!isConnected) {
        console.error("Aborting update due to connection failure.");
        return;
    }

    console.log("Fetching agents...");
    const { data: agents, error } = await supabase.from('agents').select('*');

    if (error || !agents) {
        console.error("Error fetching agents:", error);
        return;
    }

    console.log(`Analyzing ${agents.length} agents...`);

    for (const agent of agents) {
        // Mocking Data
        const simulatedStars7d = Math.ceil(agent.stars * 0.01) + Math.floor(Math.random() * 5);
        const simulatedCommits30d = Math.floor(Math.random() * 20);
        const upvotes = Math.floor((agent.velocity || 0) * 10) + Math.floor(Math.random() * 10);

        const metrics = {
            repo: agent.repo,
            stars: agent.stars || 0,
            forks: agent.forks || Math.floor(agent.stars * 0.15),
            watchers: agent.watchers || Math.floor(agent.stars * 0.03),
            open_issues: agent.open_issues || Math.floor(Math.random() * 50),
            contributors_count: agent.contributors_count || Math.floor(Math.random() * 10),
            last_commit_date: agent.last_update || new Date().toISOString(),
            created_at: agent.created_at,
            stars_7d: simulatedStars7d,
            forks_7d: Math.floor(simulatedStars7d * 0.2),
            contributors_30d: Math.floor(Math.random() * 2),
            commits_30d: simulatedCommits30d,
            recent_commit_score: 10,
            upvotes: upvotes,
            downvotes: 0,
            watchlist_adds: Math.floor(Math.random() * 20)
        };

        // Calculate Pillars
        const growth = calculateGrowth(metrics);
        const activity = calculateActivity(metrics);
        const popularity = calculatePopularity(metrics);
        const trust = calculateTrust(metrics);

        const totalPulse = Math.min(100, Math.max(0, growth + activity + popularity + trust));

        console.log(`[${agent.name}] Pulse: ${totalPulse.toFixed(1)}`);

        // Update DB
        const { error: updateError } = await supabase
            .from('agents')
            .update({
                pulse_score: totalPulse,
                growth_score: growth,
                activity_score: activity,
                popularity_score: popularity,
                trust_score: trust,
                forks: metrics.forks,
                watchers: metrics.watchers,
                open_issues: metrics.open_issues,
                contributors_count: metrics.contributors_count,
                recent_commits: metrics.commits_30d
            })
            .eq('repo', agent.repo);

        if (updateError) {
            console.error(`[ERROR] Failed to update ${agent.name}:`, updateError.message);
        } else {
            console.log(`[SUCCESS] Updated ${agent.name}`);
        }
    }
}

updatePulseScores().catch(err => console.error("Fatal error:", err));
