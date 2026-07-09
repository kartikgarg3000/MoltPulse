
import fs from 'fs';
import dotenv from 'dotenv';
if (fs.existsSync('.env.local')) {
    dotenv.config({ path: '.env.local' });
}
import { createClient } from '@supabase/supabase-js';
import { computeQualityScore, type RepoQualityData } from '../lib/quality-gate';

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
    // Quality gate fields
    quality_score?: number;
    is_visible?: boolean;
    is_verified?: boolean;
    readme_length?: number;
    has_releases?: boolean;
    license?: string | null;
    language?: string | null;
    topics?: string[];
}

const SEED_AGENTS = [
    "Significant-Gravitas/AutoGPT",
    "reworkd/AgentGPT",
    "yoheinakajima/babyagi",
    "geekan/MetaGPT",
    "OpenInterpreter/open-interpreter",
    "microsoft/autogen",
    "freqtrade/freqtrade",
    "hummingbot/hummingbot",
    "jesse-ai/jesse",
    "ccxt/ccxt"
];

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- GitHub API Helpers ---

function githubHeaders(): HeadersInit {
    const headers: HeadersInit = {
        'User-Agent': 'MoltPulse-Script',
        'Accept': 'application/vnd.github.v3+json'
    };
    if (GITHUB_TOKEN) {
        headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }
    return headers;
}

async function rateLimitSleep() {
    await new Promise(r => setTimeout(r, 500));
}

async function fetchRepoData(repoName: string): Promise<Partial<Agent> | null> {
    const url = `https://api.github.com/repos/${repoName}`;

    try {
        const res = await fetch(url, { headers: githubHeaders() });
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
            // Extended metadata for quality gate
            language: data.language || null,
            license: data.license?.spdx_id || data.license?.name || null,
            topics: data.topics || [],
        };
    } catch (error) {
        console.error(`Error fetching ${repoName}:`, error);
        return null;
    }
}

/**
 * Fetch the README length for a repo (character count).
 */
async function fetchReadmeLength(repoFullName: string): Promise<number> {
    try {
        await rateLimitSleep();
        const url = `https://api.github.com/repos/${repoFullName}/readme`;
        const res = await fetch(url, { headers: githubHeaders() });
        if (!res.ok) return 0;
        const data = await res.json();
        if (data.content) {
            const decoded = Buffer.from(data.content, 'base64').toString('utf-8');
            return decoded.length;
        }
        return data.size || 0;
    } catch {
        return 0;
    }
}

/**
 * Check if repo has any releases.
 */
async function fetchHasReleases(repoFullName: string): Promise<boolean> {
    try {
        await rateLimitSleep();
        const url = `https://api.github.com/repos/${repoFullName}/releases?per_page=1`;
        const res = await fetch(url, { headers: githubHeaders() });
        if (!res.ok) return false;
        const data = await res.json();
        return Array.isArray(data) && data.length > 0;
    } catch {
        return false;
    }
}

async function main() {
    console.log('--- Starting Data Collection (with Quality Gate) ---');

    // 1. Fetch existing agents from DB
    const existingAgentsMap = new Map<string, Agent>();

    const { data: dbAgents, error } = await supabase
        .from('agents')
        .select('*');

    if (error) {
        console.error('Error fetching from Supabase:', error);
    } else if (dbAgents) {
        dbAgents.forEach((a: any) => {
            existingAgentsMap.set(a.repo, a);
        });
    }

    // 2. Build list of repos to update (DB repos + Seed repos)
    const reposToUpdate = new Set<string>(existingAgentsMap.keys());
    SEED_AGENTS.forEach(r => reposToUpdate.add(r));

    console.log(`Targeting ${reposToUpdate.size} agents for update...`);

    const updates: Agent[] = [];
    let visibleCount = 0;
    let hiddenCount = 0;
    let verifiedCount = 0;

    for (const repo of reposToUpdate) {
        console.log(`Updating ${repo}...`);
        const githubData = await fetchRepoData(repo);

        if (githubData) {
            // Fetch extended metadata for quality gate
            const readmeLength = await fetchReadmeLength(githubData.repo!);
            const hasReleases = await fetchHasReleases(githubData.repo!);

            // Compute quality gate
            const qualityData: RepoQualityData = {
                stars: githubData.stars || 0,
                description: githubData.description || null,
                repoName: githubData.repo!,
                topics: githubData.topics || [],
                readmeLength,
                hasReleases,
                license: githubData.license || null,
                language: githubData.language || null,
                lastPushDate: githubData.last_update!,
            };

            const quality = computeQualityScore(qualityData);

            console.log(`  Quality: ${quality.qualityScore.toFixed(1)} | Visible: ${quality.shouldBeVisible} | Verified: ${quality.shouldAutoVerify}`);

            if (quality.shouldBeVisible) visibleCount++;
            else hiddenCount++;
            if (quality.shouldAutoVerify) verifiedCount++;

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
                    trend = "0.0%";
                }
            }

            // Preserve existing name and category, but update quality fields
            const displayName = oldAgent ? oldAgent.name : (githubData.name || "Unknown");

            // For is_verified: keep existing manual verification, or apply auto-verify
            const wasManuallyVerified = oldAgent?.is_verified === true;
            const shouldVerify = wasManuallyVerified || quality.shouldAutoVerify;

            updates.push({
                repo: githubData.repo!,
                name: displayName,
                description: githubData.description || "",
                stars: githubData.stars || 0,
                last_update: githubData.last_update!,
                trend: trend,
                category: oldAgent ? oldAgent.category : "Uncategorized",
                // Quality gate fields
                quality_score: quality.qualityScore,
                is_visible: quality.shouldBeVisible,
                is_verified: shouldVerify,
                readme_length: readmeLength,
                has_releases: hasReleases,
                license: githubData.license,
                language: githubData.language,
                topics: githubData.topics,
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
            console.log(`\n--- Results ---`);
            console.log(`Updated ${updates.length} agents in Supabase.`);
            console.log(`  Visible: ${visibleCount}`);
            console.log(`  Hidden (below quality threshold): ${hiddenCount}`);
            console.log(`  Auto-verified: ${verifiedCount}`);
        }
    } else {
        console.log('No updates to save.');
    }
}

main();
