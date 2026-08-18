import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// --- Pulse Score Calculation (mirrors update-pulse.ts logic) ---

interface AgentMetrics {
    repo: string;
    stars: number;
    forks: number;
    watchers: number;
    open_issues: number;
    contributors_count: number;
    last_commit_date: string;
    created_at: string;
    stars_7d: number;
    forks_7d: number;
    contributors_30d: number;
    commits_30d: number;
    recent_commit_score: number;
    upvotes: number;
    downvotes: number;
    watchlist_adds: number;
}

function calculateGrowth(metrics: AgentMetrics): number {
    const score = (metrics.stars_7d * 0.5) + (metrics.forks_7d * 0.3) + (metrics.contributors_30d * 0.2);
    return Math.min(30, score);
}

function calculateActivity(metrics: AgentMetrics): number {
    const issuePenalty = metrics.open_issues > 50 ? 5 : 0;
    let recencyScore = 0;
    const daysSinceCommit = (new Date().getTime() - new Date(metrics.last_commit_date).getTime()) / (1000 * 3600 * 24);

    if (daysSinceCommit < 7) recencyScore = 10;
    else if (daysSinceCommit < 30) recencyScore = 7;
    else if (daysSinceCommit < 90) recencyScore = 3;

    const rawScore = (metrics.commits_30d * 0.5) + (recencyScore * 0.3) - (issuePenalty * 0.2);
    return Math.min(25, Math.max(0, rawScore));
}

function calculatePopularity(metrics: AgentMetrics): number {
    const starScore = Math.log(metrics.stars + 1) * 2.5;
    const watcherScore = metrics.watchers * 0.05;
    return Math.min(25, (starScore * 0.7) + (watcherScore * 0.3));
}

function calculateTrust(metrics: AgentMetrics): number {
    const score = (metrics.upvotes * 1.0) + (metrics.watchlist_adds * 0.5) - (metrics.downvotes * 1.5);
    return Math.min(20, Math.max(0, score));
}

// --- Quality Score (mirrors lib/quality-gate.ts) ---

const AGENT_KEYWORDS = [
    'agent', 'autonomous', 'llm', 'gpt', 'ai', 'langchain', 'autogen',
    'tool-use', 'rag', 'multi-agent', 'framework', 'copilot', 'assistant',
    'chatbot', 'openai', 'anthropic', 'gemini', 'claude', 'reasoning',
    'agentic', 'self-improving', 'orchestration', 'workflow', 'automation',
    'nlp', 'natural-language', 'machine-learning', 'deep-learning',
    'transformer', 'inference', 'fine-tuning', 'embedding', 'vector',
    'retrieval', 'generative', 'prompt', 'chain-of-thought',
];

const NOISE_PATTERNS = [
    /^my-/i, /dotfiles/i, /config.*profile/i, /^\.github$/i,
    /homework/i, /assignment/i, /college/i, /university/i,
    /course-?work/i, /tutorial/i, /^test-/i, /^demo-/i,
    /^hello-?world/i, /^awesome-/i, /^personal/i, /resume/i,
    /portfolio-?website/i, /blog-?template/i,
];

function computeQualityScore(data: {
    stars: number; description: string | null; repoName: string;
    topics: string[]; readmeLength: number; hasReleases: boolean;
    license: string | null; language: string | null; lastPushDate: string;
}) {
    // Stars: 0-25
    const starsScore = data.stars <= 0 ? 0 : Math.min(25, Math.log2(data.stars + 1) * 3);
    // README: 0-20
    const readmeScore = data.readmeLength <= 0 ? 0 : data.readmeLength < 500 ? 5 : data.readmeLength < 2000 ? 12 : 20;
    // Relevance: 0-30
    const searchText = [...(data.topics || []), data.description || '', data.repoName].join(' ').toLowerCase();
    let keywordMatches = 0;
    for (const kw of AGENT_KEYWORDS) { if (searchText.includes(kw.toLowerCase())) keywordMatches++; }
    const repoBaseName = data.repoName.split('/').pop() || '';
    let isNoise = false;
    for (const p of NOISE_PATTERNS) { if (p.test(repoBaseName) || p.test(data.description || '')) { isNoise = true; break; } }
    const noDescription = !data.description || data.description.trim().length < 10;
    let relevanceScore = keywordMatches >= 5 ? 30 : keywordMatches >= 3 ? 22 : keywordMatches >= 2 ? 15 : keywordMatches >= 1 ? 8 : 0;
    if (isNoise) relevanceScore = Math.max(0, relevanceScore - 20);
    if (noDescription) relevanceScore = Math.max(0, relevanceScore - 10);
    // Activity: 0-15
    const daysSincePush = (Date.now() - new Date(data.lastPushDate).getTime()) / (1000 * 3600 * 24);
    const activityScore = daysSincePush < 30 ? 15 : daysSincePush < 90 ? 10 : daysSincePush < 365 ? 5 : 0;
    // Infra: 0-10
    const infraScore = (data.license ? 5 : 0) + (data.hasReleases ? 5 : 0);
    const qualityScore = Math.min(100, Math.max(0, starsScore + readmeScore + relevanceScore + activityScore + infraScore));
    return qualityScore;
}

// --- GitHub Helpers ---

async function fetchGithub(url: string): Promise<Response | null> {
    const headers: Record<string, string> = {
        'User-Agent': 'MoltPulse-Ingest',
        'Accept': 'application/vnd.github.v3+json'
    };
    const token = process.env.GITHUB_TOKEN;
    if (token) headers['Authorization'] = `token ${token}`;

    try {
        let res = await fetch(url, { headers });
        if (res.status === 401 && token) {
            // Retry without token
            delete headers['Authorization'];
            res = await fetch(url, { headers });
        }
        return res;
    } catch {
        return null;
    }
}

function getCategory(desc: string): string {
    const d = desc.toLowerCase();
    if (d.includes("trade") || d.includes("trading") || d.includes("finance") || d.includes("market")) return "Trading";
    if (d.includes("code") || d.includes("dev") || d.includes("hack")) return "Coding";
    if (d.includes("chat") || d.includes("social") || d.includes("talk")) return "Assistant";
    if (d.includes("web") || d.includes("search") || d.includes("browse")) return "Web Browsing";
    if (d.includes("autonomous") || d.includes("auto") || d.includes("agent")) return "Autonomous";
    if (d.includes("crypto") || d.includes("chain") || d.includes("wallet")) return "Web3";
    if (d.includes("job") || d.includes("application") || d.includes("hiring") || d.includes("recruit")) return "Autonomous";
    return "General";
}

function extractRepoPath(url: string): string | null {
    let clean = url.trim().replace(/\/$/, "");
    if (!clean.includes("github.com")) {
        const parts = clean.split('/');
        if (parts.length === 2) return clean;
        if (parts.length === 1 && parts[0].length > 0) return `${parts[0]}/${parts[0]}`;
        return null;
    }
    try {
        if (!clean.startsWith("http")) clean = "https://" + clean;
        const parsed = new URL(clean);
        const pathname = parsed.pathname.replace(/^\//, "");
        const parts = pathname.split('/');
        if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
        if (parts.length === 1 && parts[0].length > 0) return `${parts[0]}/${parts[0]}`;
    } catch { /* ignore */ }
    return null;
}

// --- API Route ---

export async function POST(request: NextRequest) {
    // Auth check: only admin can call this
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { submissionId, repoUrl } = body;

    if (!repoUrl) {
        return NextResponse.json({ error: 'Missing repoUrl' }, { status: 400 });
    }

    // 1. Extract owner/repo path
    const repoPath = extractRepoPath(repoUrl);
    if (!repoPath) {
        return NextResponse.json({ error: `Invalid repo URL: ${repoUrl}` }, { status: 400 });
    }

    // 2. Fetch repo data from GitHub
    const repoRes = await fetchGithub(`https://api.github.com/repos/${repoPath}`);
    if (!repoRes || !repoRes.ok) {
        // Try with .github.io suffix for orgs
        const altPath = `${repoPath.split('/')[0]}/${repoPath.split('/')[0]}.github.io`;
        const altRes = await fetchGithub(`https://api.github.com/repos/${altPath}`);
        if (!altRes || !altRes.ok) {
            return NextResponse.json({ error: `Could not fetch repo from GitHub: ${repoPath}` }, { status: 404 });
        }
        // Use the alt path
        const githubData = await altRes.json();
        return await ingestAgent(supabase, githubData, submissionId);
    }

    const githubData = await repoRes.json();
    return await ingestAgent(supabase, githubData, submissionId);
}

async function ingestAgent(supabase: any, githubData: any, submissionId?: string) {
    const repoFullName = githubData.full_name;

    // 3. Fetch README length
    let readmeLength = 0;
    const readmeRes = await fetchGithub(`https://api.github.com/repos/${repoFullName}/readme`);
    if (readmeRes && readmeRes.ok) {
        try {
            const readmeData = await readmeRes.json();
            if (readmeData.content) {
                readmeLength = Buffer.from(readmeData.content, 'base64').toString('utf-8').length;
            } else {
                readmeLength = readmeData.size || 0;
            }
        } catch { /* ignore */ }
    }

    // 4. Check releases
    let hasReleases = false;
    const relRes = await fetchGithub(`https://api.github.com/repos/${repoFullName}/releases?per_page=1`);
    if (relRes && relRes.ok) {
        try {
            const relData = await relRes.json();
            hasReleases = Array.isArray(relData) && relData.length > 0;
        } catch { /* ignore */ }
    }

    // 5. Fetch recent commit activity for pulse score
    let commits30d = 0;
    const commitsRes = await fetchGithub(`https://api.github.com/repos/${repoFullName}/stats/commit_activity`);
    if (commitsRes && commitsRes.ok) {
        try {
            const weeks = await commitsRes.json();
            if (Array.isArray(weeks)) {
                // Sum last 4 weeks
                const recentWeeks = weeks.slice(-4);
                commits30d = recentWeeks.reduce((sum: number, w: any) => sum + (w.total || 0), 0);
            }
        } catch { /* ignore */ }
    }

    // 6. Fetch contributors count
    let contributorsCount = 0;
    const contribRes = await fetchGithub(`https://api.github.com/repos/${repoFullName}/contributors?per_page=1&anon=true`);
    if (contribRes && contribRes.ok) {
        // GitHub returns total in Link header
        const linkHeader = contribRes.headers.get('link');
        if (linkHeader) {
            const match = linkHeader.match(/page=(\d+)>; rel="last"/);
            if (match) contributorsCount = parseInt(match[1], 10);
        } else {
            try {
                const contribs = await contribRes.json();
                contributorsCount = Array.isArray(contribs) ? contribs.length : 0;
            } catch { /* ignore */ }
        }
    }

    const topics = githubData.topics || [];
    const license = githubData.license?.spdx_id || githubData.license?.name || null;
    const language = githubData.language || null;
    const description = githubData.description || "";

    // 7. Compute Quality Score
    const qualityScore = computeQualityScore({
        stars: githubData.stargazers_count,
        description,
        repoName: repoFullName,
        topics,
        readmeLength,
        hasReleases,
        license,
        language,
        lastPushDate: githubData.pushed_at,
    });

    // 8. Compute Pulse Score (matching update-pulse.ts logic)
    const stars = githubData.stargazers_count || 0;
    const forks = githubData.forks_count || 0;
    const watchers = githubData.subscribers_count || githubData.watchers_count || 0;
    const openIssues = githubData.open_issues_count || 0;
    const simulatedStars7d = Math.ceil(stars * 0.01) + Math.floor(Math.random() * 5);

    const metrics: AgentMetrics = {
        repo: repoFullName,
        stars,
        forks,
        watchers,
        open_issues: openIssues,
        contributors_count: contributorsCount,
        last_commit_date: githubData.pushed_at || new Date().toISOString(),
        created_at: githubData.created_at || new Date().toISOString(),
        stars_7d: simulatedStars7d,
        forks_7d: Math.floor(simulatedStars7d * 0.2),
        contributors_30d: Math.min(contributorsCount, 2),
        commits_30d: commits30d,
        recent_commit_score: 10,
        upvotes: 0,
        downvotes: 0,
        watchlist_adds: 0,
    };

    const growth = calculateGrowth(metrics);
    const activity = calculateActivity(metrics);
    const popularity = calculatePopularity(metrics);
    const trust = calculateTrust(metrics);
    const pulseScore = Math.min(100, Math.max(0, growth + activity + popularity + trust));

    const category = getCategory(description);

    // 9. Upsert into agents table
    const agentData = {
        repo: repoFullName,
        name: githubData.name || "Unknown",
        description,
        stars,
        last_update: githubData.pushed_at,
        trend: "New",
        category,
        quality_score: qualityScore,
        is_visible: true,
        is_verified: qualityScore >= 70 && stars >= 500,
        readme_length: readmeLength,
        has_releases: hasReleases,
        license,
        language,
        topics,
        // Pulse score fields
        pulse_score: pulseScore,
        growth_score: growth,
        activity_score: activity,
        popularity_score: popularity,
        trust_score: trust,
        forks,
        watchers,
        open_issues: openIssues,
        contributors_count: contributorsCount,
        recent_commits: commits30d,
    };

    const { error: upsertError } = await supabase
        .from('agents')
        .upsert(agentData, { onConflict: 'repo' });

    if (upsertError) {
        return NextResponse.json({ error: `Failed to upsert agent: ${upsertError.message}` }, { status: 500 });
    }

    // 10. Mark submission as approved if submissionId provided
    if (submissionId) {
        await supabase
            .from('submissions')
            .update({ status: 'approved' })
            .eq('id', submissionId);
    }

    return NextResponse.json({
        success: true,
        agent: {
            repo: repoFullName,
            name: githubData.name,
            pulse_score: Math.round(pulseScore),
            quality_score: Math.round(qualityScore),
            category,
        }
    });
}
