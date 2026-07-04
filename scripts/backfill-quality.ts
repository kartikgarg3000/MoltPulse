/**
 * One-time Backfill Script
 * 
 * Recomputes quality_score, is_visible, and is_verified for ALL existing
 * agents in the database by fetching extended metadata from GitHub.
 * 
 * Usage: npx tsx scripts/backfill-quality.ts
 */

import fs from 'fs';
import dotenv from 'dotenv';
if (fs.existsSync('.env.local')) {
    dotenv.config({ path: '.env.local' });
}
import { createClient } from '@supabase/supabase-js';
import { computeQualityScore, type RepoQualityData } from '../lib/quality-gate';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function githubHeaders(): HeadersInit {
    const headers: HeadersInit = {
        'User-Agent': 'MoltPulse-Backfill',
        'Accept': 'application/vnd.github.v3+json'
    };
    if (GITHUB_TOKEN) {
        headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }
    return headers;
}

async function rateLimitSleep(ms = 800) {
    await new Promise(r => setTimeout(r, ms));
}

async function fetchRepoMetadata(repoFullName: string) {
    try {
        await rateLimitSleep();
        const res = await fetch(`https://api.github.com/repos/${repoFullName}`, { headers: githubHeaders() });
        if (!res.ok) return null;
        return await res.json();
    } catch { return null; }
}

async function fetchReadmeLength(repoFullName: string): Promise<number> {
    try {
        await rateLimitSleep(500);
        const res = await fetch(`https://api.github.com/repos/${repoFullName}/readme`, { headers: githubHeaders() });
        if (!res.ok) return 0;
        const data = await res.json();
        if (data.content) {
            return Buffer.from(data.content, 'base64').toString('utf-8').length;
        }
        return data.size || 0;
    } catch { return 0; }
}

async function fetchHasReleases(repoFullName: string): Promise<boolean> {
    try {
        await rateLimitSleep(500);
        const res = await fetch(`https://api.github.com/repos/${repoFullName}/releases?per_page=1`, { headers: githubHeaders() });
        if (!res.ok) return false;
        const data = await res.json();
        return Array.isArray(data) && data.length > 0;
    } catch { return false; }
}

async function main() {
    console.log('=== Quality Gate Backfill ===\n');

    // Fetch all agents
    const { data: agents, error } = await supabase.from('agents').select('*');
    if (error || !agents) {
        console.error('Error fetching agents:', error);
        return;
    }

    console.log(`Found ${agents.length} agents to backfill.\n`);

    let visible = 0;
    let hidden = 0;
    let verified = 0;
    let failed = 0;

    for (let i = 0; i < agents.length; i++) {
        const agent = agents[i];
        console.log(`[${i + 1}/${agents.length}] ${agent.repo}...`);

        const repoData = await fetchRepoMetadata(agent.repo);
        if (!repoData) {
            console.log(`  ✗ Failed to fetch from GitHub (may be deleted/renamed)`);
            // Mark as hidden since we can't verify it
            await supabase.from('agents').update({ is_visible: false, quality_score: 0 }).eq('repo', agent.repo);
            failed++;
            hidden++;
            continue;
        }

        const readmeLength = await fetchReadmeLength(agent.repo);
        const hasReleases = await fetchHasReleases(agent.repo);

        const qualityData: RepoQualityData = {
            stars: repoData.stargazers_count || 0,
            description: repoData.description,
            repoName: repoData.full_name,
            topics: repoData.topics || [],
            readmeLength,
            hasReleases,
            license: repoData.license?.spdx_id || repoData.license?.name || null,
            language: repoData.language || null,
            lastPushDate: repoData.pushed_at || agent.last_update || new Date().toISOString(),
        };

        const quality = computeQualityScore(qualityData);

        const updateData = {
            quality_score: quality.qualityScore,
            is_visible: quality.shouldBeVisible,
            is_verified: quality.shouldAutoVerify,
            readme_length: readmeLength,
            has_releases: hasReleases,
            license: qualityData.license,
            language: qualityData.language,
            topics: qualityData.topics,
            // Also update core fields from fresh GitHub data
            stars: repoData.stargazers_count,
            description: repoData.description,
            last_update: repoData.pushed_at,
        };

        const { error: updateError } = await supabase
            .from('agents')
            .update(updateData)
            .eq('repo', agent.repo);

        if (updateError) {
            console.log(`  ✗ DB update failed: ${updateError.message}`);
            failed++;
        } else {
            const status = quality.shouldBeVisible ? '✓' : '✗ HIDDEN';
            const verifiedLabel = quality.shouldAutoVerify ? ' [VERIFIED]' : '';
            console.log(`  ${status} Quality: ${quality.qualityScore.toFixed(1)} | Stars: ${repoData.stargazers_count} | README: ${readmeLength} chars${verifiedLabel}`);
        }

        if (quality.shouldBeVisible) visible++;
        else hidden++;
        if (quality.shouldAutoVerify) verified++;
    }

    console.log(`\n=== Backfill Complete ===`);
    console.log(`Total:    ${agents.length}`);
    console.log(`Visible:  ${visible}`);
    console.log(`Hidden:   ${hidden}`);
    console.log(`Verified: ${verified}`);
    console.log(`Failed:   ${failed}`);
}

main().catch(err => console.error("Fatal error:", err));
