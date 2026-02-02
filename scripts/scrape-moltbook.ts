
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';

interface Agent {
    id?: number;
    name: string;
    repo: string;
    description: string | null;
    stars: number;
    last_update: string;
    trend: string;
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function searchGithubRepo(query: string): Promise<any | null> {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}+in:name&sort=stars&order=desc&per_page=1`;
    const headers: HeadersInit = {
        'User-Agent': 'MoltPulse-Scraper',
        'Accept': 'application/vnd.github.v3+json'
    };

    if (GITHUB_TOKEN) {
        headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    try {
        // Sleep to avoid rate limits (1 sec)
        await new Promise(r => setTimeout(r, 1000));

        const res = await fetch(url, { headers });
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

async function main() {
    console.log('--- Starting MoltBook Scraper (Supabase) ---');

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

    // 2. Discover & Update
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

    // Limit to checking top 10 to be safe with rate limits
    const toCheck = scrapedNames.slice(0, 10);

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

            console.log(`MATCH: ${name} -> ${repo.full_name} (${repo.stargazers_count} stars)`);

            newAgents.push({
                name: name, // Use MoltBook name 
                repo: repo.full_name,
                description: repo.description,
                stars: repo.stargazers_count,
                last_update: repo.pushed_at,
                trend: "New"
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
            console.log(`Done. Added ${newCount} new agents to DB.`);
        }
    } else {
        console.log('No new agents to add.');
    }
}

main();
