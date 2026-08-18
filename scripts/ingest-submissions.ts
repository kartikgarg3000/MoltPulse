import fs from 'fs';
import dotenv from 'dotenv';
import { resolve } from 'path';
if (fs.existsSync('.env.local')) {
    dotenv.config({ path: '.env.local' });
} else if (fs.existsSync(resolve(process.cwd(), '.env.local'))) {
    dotenv.config({ path: resolve(process.cwd(), '.env.local') });
}

import { createClient } from '@supabase/supabase-js';
import { computeQualityScore, type RepoQualityData } from '../lib/quality-gate';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing Supabase credentials in environment.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function githubHeaders(): HeadersInit {
    const headers: HeadersInit = {
        'User-Agent': 'MoltPulse-Submission-Ingester',
        'Accept': 'application/vnd.github.v3+json'
    };
    if (GITHUB_TOKEN) {
        headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }
    return headers;
}

async function fetchGithub(url: string): Promise<Response | null> {
    try {
        let res = await fetch(url, { headers: githubHeaders() });
        if (res.status === 401) {
            console.warn(`[GitHub API] 401 Unauthorized with token for ${url}. Retrying without token...`);
            res = await fetch(url, {
                headers: {
                    'User-Agent': 'MoltPulse-Submission-Ingester',
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
        }
        return res;
    } catch (e) {
        console.error(`Fetch error for ${url}:`, e);
        return null;
    }
}

async function fetchRepoData(repoName: string): Promise<any | null> {
    const url = `https://api.github.com/repos/${repoName}`;
    const res = await fetchGithub(url);
    if (!res || !res.ok) {
        if (res) console.error(`Failed to fetch ${repoName}: ${res.status} ${res.statusText}`);
        return null;
    }
    return await res.json();
}

async function fetchReadmeLength(repoFullName: string): Promise<number> {
    const url = `https://api.github.com/repos/${repoFullName}/readme`;
    const res = await fetchGithub(url);
    if (!res || !res.ok) return 0;
    try {
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

async function fetchHasReleases(repoFullName: string): Promise<boolean> {
    const url = `https://api.github.com/repos/${repoFullName}/releases?per_page=1`;
    const res = await fetchGithub(url);
    if (!res || !res.ok) return false;
    try {
        const data = await res.json();
        return Array.isArray(data) && data.length > 0;
    } catch {
        return false;
    }
}

function getCategory(desc: string): string {
    const d = desc.toLowerCase();
    if (d.includes("trade") || d.includes("trading") || d.includes("finance") || d.includes("market") || d.includes("exchange") || d.includes("arbitrage")) {
        return "Trading";
    }
    if (d.includes("code") || d.includes("dev") || d.includes("hack")) return "Coding";
    if (d.includes("chat") || d.includes("social") || d.includes("talk")) return "Assistant";
    if (d.includes("web") || d.includes("search") || d.includes("browse")) return "Web Browsing";
    if (d.includes("autonomous") || d.includes("auto") || d.includes("agent")) return "Autonomous";
    if (d.includes("crypto") || d.includes("chain") || d.includes("wallet")) return "Web3";
    return "General";
}

function getRepoPathFromUrl(url: string): string | null {
    let clean = url.trim().replace(/\/$/, "");
    
    // Check if it is already in owner/repo format and doesn't contain github.com
    if (!clean.includes("github.com")) {
        const parts = clean.split('/');
        if (parts.length === 2) {
            return clean;
        }
        // Handle single username/org (default to primary repo)
        if (parts.length === 1 && parts[0].length > 0) {
            return `${parts[0]}/${parts[0]}`;
        }
        return null;
    }
    
    try {
        if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
            clean = "https://" + clean;
        }
        const parsed = new URL(clean);
        if (parsed.hostname.includes("github.com")) {
            const pathname = parsed.pathname.replace(/^\//, "");
            const parts = pathname.split('/');
            if (parts.length >= 2) {
                return `${parts[0]}/${parts[1]}`;
            }
            if (parts.length === 1 && parts[0].length > 0) {
                return `${parts[0]}/${parts[0]}`;
            }
        }
    } catch (e) {
        // Fallback regex
        const match = clean.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (match) {
            return `${match[1]}/${match[2]}`;
        }
    }
    return null;
}

async function main() {
    // Get command line arguments (excluding node and script path)
    const args = process.argv.slice(2);
    let targetRepos: string[] = [];

    if (args.length > 0) {
        console.log("Using repositories provided via CLI arguments...");
        targetRepos = args;
    }

    const agentsToInsert = [];

    if (targetRepos.length > 0) {
        // Mode 1: Direct ingestion of repos passed via CLI
        console.log(`Ingesting ${targetRepos.length} repos directly...`);
        
        // Let's also try to mark them approved in submissions if they exist
        for (const repoUrl of targetRepos) {
            try {
                const { error } = await supabase
                    .from('submissions')
                    .update({ status: 'approved' })
                    .eq('repo', repoUrl);
                if (error) {
                    console.warn(`Could not update status to approved for ${repoUrl} (likely RLS restriction):`, error.message);
                }
            } catch (e) {
                // Ignore
            }
        }

        for (const repoUrl of targetRepos) {
            const repoPath = getRepoPathFromUrl(repoUrl);
            if (!repoPath) {
                console.error(`Invalid repository format: "${repoUrl}"`);
                continue;
            }

            console.log(`\nFetching GitHub data for: ${repoPath}...`);
            const githubData = await fetchRepoData(repoPath);
            if (!githubData) {
                console.error(`Could not fetch data for ${repoPath}. Skipping.`);
                continue;
            }

            const readmeLength = await fetchReadmeLength(repoPath);
            const hasReleases = await fetchHasReleases(repoPath);

            const topics = githubData.topics || [];
            const license = githubData.license?.spdx_id || githubData.license?.name || null;
            const language = githubData.language || null;

            const qualityData: RepoQualityData = {
                stars: githubData.stargazers_count,
                description: githubData.description || "",
                repoName: githubData.full_name,
                topics,
                readmeLength,
                hasReleases,
                license,
                language,
                lastPushDate: githubData.pushed_at
            };

            const quality = computeQualityScore(qualityData);
            console.log(`  Quality Score: ${quality.qualityScore.toFixed(1)}`);
            console.log(`  Auto Verify: ${quality.shouldAutoVerify}`);

            const description = githubData.description || "";
            const category = getCategory(description);

            agentsToInsert.push({
                repo: githubData.full_name,
                name: githubData.name || "Unknown",
                description: description,
                stars: githubData.stargazers_count,
                last_update: githubData.pushed_at,
                trend: "New",
                category: category,
                quality_score: quality.qualityScore,
                is_visible: true, 
                is_verified: quality.shouldAutoVerify,
                readme_length: readmeLength,
                has_releases: hasReleases,
                license,
                language,
                topics
            });
        }
    } else {
        // Mode 2: Ingest from 'submissions' table where status is 'approved'
        console.log("--- Starting Approved Submissions Ingestion ---");
        const { data: submissions, error: subError } = await supabase
            .from('submissions')
            .select('*')
            .eq('status', 'approved');

        if (subError) {
            console.error("Error fetching approved submissions:", subError.message);
            process.exit(1);
        }

        if (!submissions || submissions.length === 0) {
            console.log("No approved submissions found in the database. Exiting.");
            console.log("Tip: You can manually ingest by running: npm run ingest-submissions -- <repo-urls>");
            return;
        }

        console.log(`Found ${submissions.length} approved submissions to ingest.`);

        // Fetch existing agents to avoid duplicate work if possible
        const { data: existingAgents } = await supabase
            .from('agents')
            .select('repo');
        const existingRepos = new Set((existingAgents || []).map((a: any) => a.repo.toLowerCase()));

        for (const sub of submissions) {
            const repoPath = getRepoPathFromUrl(sub.repo);
            if (!repoPath) {
                console.error(`Invalid repository format in submission: "${sub.repo}"`);
                continue;
            }

            if (existingRepos.has(repoPath.toLowerCase())) {
                console.log(`Skipping ${repoPath} (already exists in agents directory).`);
                continue;
            }

            console.log(`\nFetching GitHub data for: ${repoPath}...`);
            const githubData = await fetchRepoData(repoPath);
            if (!githubData) {
                console.error(`Could not fetch data for ${repoPath}. Skipping.`);
                continue;
            }

            const readmeLength = await fetchReadmeLength(repoPath);
            const hasReleases = await fetchHasReleases(repoPath);

            const topics = githubData.topics || [];
            const license = githubData.license?.spdx_id || githubData.license?.name || null;
            const language = githubData.language || null;

            const qualityData: RepoQualityData = {
                stars: githubData.stargazers_count,
                description: githubData.description || "",
                repoName: githubData.full_name,
                topics,
                readmeLength,
                hasReleases,
                license,
                language,
                lastPushDate: githubData.pushed_at
            };

            const quality = computeQualityScore(qualityData);
            console.log(`  Quality Score: ${quality.qualityScore.toFixed(1)}`);
            console.log(`  Auto Verify: ${quality.shouldAutoVerify}`);

            const description = githubData.description || "";
            const category = getCategory(description);

            agentsToInsert.push({
                repo: githubData.full_name,
                name: githubData.name || "Unknown",
                description: description,
                stars: githubData.stargazers_count,
                last_update: githubData.pushed_at,
                trend: "New",
                category: category,
                quality_score: quality.qualityScore,
                is_visible: true, 
                is_verified: quality.shouldAutoVerify,
                readme_length: readmeLength,
                has_releases: hasReleases,
                license,
                language,
                topics
            });
        }
    }

    if (agentsToInsert.length > 0) {
        console.log(`\nUpserting ${agentsToInsert.length} agents to Supabase 'agents' table...`);
        const { error: upsertError } = await supabase
            .from('agents')
            .upsert(agentsToInsert, { onConflict: 'repo' });
        
        if (upsertError) {
            console.error("Failed to upsert agents:", upsertError.message);
        } else {
            console.log("Successfully ingested agents into 'agents' table!");
        }
    } else {
        console.log("No new agents to ingest.");
    }
}

main();
