
import fs from 'fs';
import dotenv from 'dotenv';
if (fs.existsSync('.env.local')) {
    dotenv.config({ path: '.env.local' });
}
import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';
import { computeQualityScore, type RepoQualityData } from '../lib/quality-gate';

interface Agent {
    id?: number;
    name: string;
    repo: string;
    description: string | null;
    stars: number;
    last_update: string;
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
        'User-Agent': 'MoltPulse-Scraper',
        'Accept': 'application/vnd.github.v3+json'
    };
    if (GITHUB_TOKEN) {
        headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }
    return headers;
}

async function rateLimitSleep() {
    await new Promise(r => setTimeout(r, 1000));
}

async function searchGithubRepo(query: string): Promise<any | null> {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}+in:name&sort=stars&order=desc&per_page=1`;

    try {
        await rateLimitSleep();
        const res = await fetch(url, { headers: githubHeaders() });
        if (!res.ok) {
            if (res.status === 403) console.warn(`Rate limit hit for ${query}`);
            return null;
        }
        const data = await res.json();
        if (data.items && data.items.length > 0) {
            return data.items[0];
        }
        return null;
    } catch (e) {
        console.error(`Error searching GitHub for ${query}:`, e);
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
        // content is base64-encoded
        if (data.content) {
            const decoded = Buffer.from(data.content, 'base64').toString('utf-8');
            return decoded.length;
        }
        // If size is available, use that as approximation
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
    console.log('--- Starting MoltBook Scraper (with Quality Gate) ---');

    // 1. Scrape Names
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    const scrapedNames: string[] = [];

    try {
        console.log('Navigating to MoltBook...');
        await page.goto('https://www.moltbook.com/u', { waitUntil: 'networkidle0', timeout: 60000 });

        // Wait for the grid to load
        await page.waitForSelector('a[href^="/u/"]');

        // Extract names
        const names = await page.evaluate(() => {
            // Find all links that look like agent profiles in the grid
            const anchors = Array.from(document.querySelectorAll('a[href^="/u/"]'));
            return anchors.map(a => {
                // The structure is <a> ... <span class="...font-bold...">Name</span> ... </a>
                // We can filter by location or just grab all /u/ links that aren't navigation
                const nameEl = a.querySelector('.font-bold.truncate');
                return nameEl ? nameEl.textContent : null;
            }).filter(n => n && n !== 'Moltbook'); // Filter out nulls and potentially site name
        });

        // Dedupe
        const uniqueNames = Array.from(new Set(names));
        console.log(`Found ${uniqueNames.length} potential agents on MoltBook.`);
        scrapedNames.push(...(uniqueNames as string[]));

    } catch (e) {
        console.error('Scraping failed:', e);
    } finally {
        await browser.close();
    }

    // 2. Discover & Update with Quality Gate
    if (scrapedNames.length === 0) {
        console.log('No agents found. Exiting.');
        return;
    }

    // Fetch existing repos from Supabase
    const { data: dbAgents, error } = await supabase
        .from('agents')
        .select('name, repo');

    if (error) {
        console.error("Error fetching existing agents:", error);
    }

    // Create set of existing repos to avoid duplicates
    const existingRepos = new Set((dbAgents || []).map((a: any) => a.repo));
    const existingNames = new Set((dbAgents || []).map((a: any) => a.name.toLowerCase()));

    let newCount = 0;
    let hiddenCount = 0;

    // Limit to checking top 50 to get more data
    const toCheck = scrapedNames.slice(0, 50);

    console.log(`Checking GitHub for ${toCheck.length} agents...`);

    const newAgents: Agent[] = [];

    for (const name of toCheck) {
        // Check if we already have an agent with this name (approximate)
        if (existingNames.has(name.toLowerCase())) {
            console.log(`Skipping ${name} (already exists)`);
            continue;
        }

        const repo = await searchGithubRepo(name);
        if (repo) {
            if (existingRepos.has(repo.full_name)) {
                console.log(`Skipping ${name} -> ${repo.full_name} (repo already tracked)`);
                continue;
            }

            // --- Fetch extended metadata for quality gate ---
            console.log(`  Fetching metadata for ${repo.full_name}...`);
            const readmeLength = await fetchReadmeLength(repo.full_name);
            const hasReleases = await fetchHasReleases(repo.full_name);

            const topics: string[] = repo.topics || [];
            const license: string | null = repo.license?.spdx_id || repo.license?.name || null;
            const language: string | null = repo.language || null;

            // --- Compute Quality Gate ---
            const qualityData: RepoQualityData = {
                stars: repo.stargazers_count,
                description: repo.description,
                repoName: repo.full_name,
                topics,
                readmeLength,
                hasReleases,
                license,
                language,
                lastPushDate: repo.pushed_at,
            };

            const quality = computeQualityScore(qualityData);

            console.log(`  MATCH: ${name} -> ${repo.full_name} (★${repo.stargazers_count}) | Quality: ${quality.qualityScore.toFixed(1)} | Visible: ${quality.shouldBeVisible} | Verified: ${quality.shouldAutoVerify}`);

            if (!quality.shouldBeVisible) {
                console.log(`  ⚠ HIDDEN: Quality score ${quality.qualityScore.toFixed(1)} below threshold (noise: ${quality.isNoise}, agent: ${quality.isLikelyAgent})`);
                hiddenCount++;
            }

            // Simple categorization logic
            const desc = (repo.description || "").toLowerCase();
            const repoName = repo.full_name.toLowerCase();
            let category = "General";

            if (desc.includes("trade") || desc.includes("trading") || desc.includes("finance") || desc.includes("market") || desc.includes("exchange") || desc.includes("arbitrage")) {
                category = "Trading";
            }
            else if (desc.includes("code") || desc.includes("dev") || desc.includes("hack")) category = "Coding";
            else if (desc.includes("chat") || desc.includes("social") || desc.includes("talk")) category = "Assistant";
            else if (desc.includes("web") || desc.includes("search") || desc.includes("browse")) category = "Web Browsing";
            else if (desc.includes("autonomous") || desc.includes("auto") || desc.includes("agent")) category = "Autonomous";
            else if (desc.includes("crypto") || desc.includes("chain") || desc.includes("wallet")) category = "Web3";

            newAgents.push({
                name: name, // Use MoltBook name 
                repo: repo.full_name,
                description: repo.description,
                stars: repo.stargazers_count,
                last_update: repo.pushed_at,
                trend: "New",
                category: category as any,
                // Quality gate fields
                quality_score: quality.qualityScore,
                is_visible: quality.shouldBeVisible,
                is_verified: quality.shouldAutoVerify,
                readme_length: readmeLength,
                has_releases: hasReleases,
                license,
                language,
                topics,
            });

            existingRepos.add(repo.full_name);
            newCount++;
        } else {
            console.log(`No repo found for ${name}`);
        }
    }

    // Write to Supabase
    if (newAgents.length > 0) {
        const { error: insertError } = await supabase
            .from('agents')
            .upsert(newAgents, { onConflict: 'repo' });

        if (insertError) {
            console.error('Error inserting to Supabase:', insertError);
        } else {
            console.log(`\n--- Results ---`);
            console.log(`Added ${newCount} new agents to DB.`);
            console.log(`  Visible: ${newCount - hiddenCount}`);
            console.log(`  Hidden (below quality threshold): ${hiddenCount}`);
        }
    } else {
        console.log('No new agents to add.');
    }
}

main();
