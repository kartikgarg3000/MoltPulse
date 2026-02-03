
import fs from 'fs';
import dotenv from 'dotenv';
if (fs.existsSync('.env.local')) {
    dotenv.config({ path: '.env.local' });
}
import { createClient } from '@supabase/supabase-js';

// Define the Agent interface matching Supabase table
interface Agent {
    id?: number;
    name: string;
    repo: string;
    description: string | null;
    stars: number;
    last_update: string; // ISO date
    trend: string;
    category?: string;
}

const SEED_AGENTS = [
    "Significant-Gravitas/AutoGPT",
    "reworkd/AgentGPT",
    "yoheinakajima/babyagi",
    "geekan/MetaGPT",
    "OpenInterpreter/open-interpreter",
    "microsoft/autogen"
];

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fetchRepoData(repoName: string): Promise<Partial<Agent> | null> {
    const url = `https://api.github.com/repos/${repoName}`;
    const headers: HeadersInit = {
        'User-Agent': 'MoltPulse-Script',
        'Accept': 'application/vnd.github.v3+json'
    };

    if (GITHUB_TOKEN) {
        headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    try {
        const res = await fetch(url, { headers });
        if (!res.ok) {
            console.error(`Failed to fetch ${repoName}: ${res.status} ${res.statusText}`);
            return null;
        }

        const data = await res.json();
        return {
            name: data.name,
            repo: data.full_name,
            description: data.description,
            stars: data.stargazers_count,
            last_update: data.pushed_at,
        };
    } catch (error) {
        console.error(`Error fetching ${repoName}:`, error);
        return null;
    }
}

async function main() {
    console.log('--- Starting Data Collection (Supabase) ---');

    // 1. Fetch existing agents from DB to:
    //    a) Calculate trends (diff from previous stars)
    //    b) Ensure we update everyone

    // We want a Map of repo -> Agent
    const existingAgentsMap = new Map<string, Agent>();

    const { data: dbAgents, error } = await supabase
        .from('agents')
        .select('*');

    if (error) {
        console.error('Error fetching from Supabase:', error);
        // We continue, treating it as if DB is empty
    } else if (dbAgents) {
        dbAgents.forEach((a: any) => {
            existingAgentsMap.set(a.repo, a);
        });
    }

    // 2. Build list of repos to update
    //    Combine DB repos + Seed repos
    const reposToUpdate = new Set<string>(existingAgentsMap.keys());
    SEED_AGENTS.forEach(r => reposToUpdate.add(r));

    console.log(`Targeting ${reposToUpdate.size} agents for update...`);

    const updates: Agent[] = [];

    for (const repo of reposToUpdate) {
        console.log(`Updating ${repo}...`);
        const githubData = await fetchRepoData(repo);

        if (githubData) {
            // Calculate trend
            const oldAgent = existingAgentsMap.get(githubData.repo!);
            let trend = "New";

            if (oldAgent) {
                const diff = (githubData.stars || 0) - oldAgent.stars;
                if (oldAgent.stars > 0) {
                    const percent = ((diff / oldAgent.stars) * 100).toFixed(1);
                    trend = diff >= 0 ? `+${percent}%` : `${percent}%`;
                } else if (oldAgent.stars === 0 && (githubData.stars || 0) > 0) {
                    trend = "+100%";
                } else if (diff === 0) {
                    trend = "0.0%"; // Explicitly show 0 change
                }
            }

            // Prepare record
            // We use the 'name' from DB if it exists (to preserve custom names like "Sisu_Chi" from scraper), 
            // otherwise use GitHub name.
            // Actually, scraper puts custom name in DB. GitHub fetch returns repo name (e.g. "Web-SISU-Chinese").
            // If we blindly overwrite 'name' with githubData.name, we lose the MoltBook name.
            // So: Use DB name if exists, else GitHub name.

            const displayName = oldAgent ? oldAgent.name : (githubData.name || "Unknown");

            updates.push({
                repo: githubData.repo!,
                name: displayName,
                description: githubData.description || "",
                stars: githubData.stars || 0,
                last_update: githubData.last_update!,
                trend: trend,
                category: oldAgent ? oldAgent.category : "Uncategorized"
            });
        }
    }

    // 3. Upsert to Supabase
    if (updates.length > 0) {
        const { error: upsertError } = await supabase
            .from('agents')
            .upsert(updates, { onConflict: 'repo' });

        if (upsertError) {
            console.error('Error upserting to Supabase:', upsertError);
        } else {
            console.log(`Successfully updated ${updates.length} agents in Supabase.`);
        }
    } else {
        console.log('No updates to save.');
    }
}

main();
