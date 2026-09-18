/**
 * emergency-export.ts
 * 
 * Fetches live data for all seed agents directly from GitHub API and writes
 * data/agents-static.json — a rich static fallback used while Supabase is restricted.
 * 
 * Run: npx tsx scripts/emergency-export.ts
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
if (fs.existsSync('.env.local')) dotenv.config({ path: '.env.local' });

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const SEED_REPOS = [
  // Core AI Agents
  "Significant-Gravitas/AutoGPT",
  "reworkd/AgentGPT",
  "yoheinakajima/babyagi",
  "geekan/MetaGPT",
  "OpenInterpreter/open-interpreter",
  "microsoft/autogen",
  "langchain-ai/langchain",
  "hwchase17/langchain",
  "microsoft/semantic-kernel",
  "joaomdmoura/crewAI",
  "run-llama/llama_index",
  "BerriAI/litellm",
  "smol-ai/developer",
  "AntonOsika/gpt-engineer",
  "princeton-nlp/SWE-agent",
  "paul-gauthier/aider",
  "modal-labs/modal-client",
  "imartinez/privateGPT",
  "PromtEngineer/localGPT",
  "nomic-ai/gpt4all",
  // Trading Agents
  "freqtrade/freqtrade",
  "hummingbot/hummingbot",
  "jesse-ai/jesse",
  "ccxt/ccxt",
  "quantopian/zipline",
  // Dev Frameworks
  "phidatahq/phidata",
  "ScrapeGraphAI/Scrapegraph-ai",
  "Skyvern-AI/skyvern",
  "lavague-ai/LaVague",
  "e2b-dev/e2b",
  "AgentOps-AI/agentops",
  "weaviate/weaviate",
  "chroma-core/chroma",
  "qdrant/qdrant",
  "milvus-io/milvus",
];

const CATEGORIES: Record<string, string> = {
  "freqtrade/freqtrade": "Trading",
  "hummingbot/hummingbot": "Trading",
  "jesse-ai/jesse": "Trading",
  "ccxt/ccxt": "Trading",
  "quantopian/zipline": "Trading",
  "langchain-ai/langchain": "Framework",
  "hwchase17/langchain": "Framework",
  "microsoft/semantic-kernel": "Framework",
  "run-llama/llama_index": "Framework",
  "BerriAI/litellm": "Framework",
  "joaomdmoura/crewAI": "Multi-Agent",
  "Significant-Gravitas/AutoGPT": "Autonomous",
  "reworkd/AgentGPT": "Autonomous",
  "yoheinakajima/babyagi": "Autonomous",
  "geekan/MetaGPT": "Multi-Agent",
  "microsoft/autogen": "Multi-Agent",
  "OpenInterpreter/open-interpreter": "Code",
  "AntonOsika/gpt-engineer": "Code",
  "paul-gauthier/aider": "Code",
  "princeton-nlp/SWE-agent": "Code",
  "smol-ai/developer": "Code",
  "imartinez/privateGPT": "Privacy",
  "PromtEngineer/localGPT": "Privacy",
  "nomic-ai/gpt4all": "Privacy",
  "phidatahq/phidata": "Framework",
  "ScrapeGraphAI/Scrapegraph-ai": "Scraping",
  "Skyvern-AI/skyvern": "Automation",
  "lavague-ai/LaVague": "Automation",
  "e2b-dev/e2b": "Sandbox",
  "AgentOps-AI/agentops": "DevTools",
  "weaviate/weaviate": "Vector DB",
  "chroma-core/chroma": "Vector DB",
  "qdrant/qdrant": "Vector DB",
  "milvus-io/milvus": "Vector DB",
  "modal-labs/modal-client": "Infrastructure",
};

function githubHeaders(): HeadersInit {
  const h: HeadersInit = {
    'User-Agent': 'MoltPulse-Emergency-Export',
    'Accept': 'application/vnd.github.v3+json',
  };
  // Only add token if it looks valid (not expired/empty)
  if (GITHUB_TOKEN && GITHUB_TOKEN.startsWith('ghp_') || (GITHUB_TOKEN && GITHUB_TOKEN.startsWith('github_pat_'))) {
    h['Authorization'] = `token ${GITHUB_TOKEN}`;
  }
  return h;
}

async function fetchRepo(repo: string) {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, { headers: githubHeaders() });
    if (!res.ok) {
      console.warn(`  ⚠ Skipping ${repo}: HTTP ${res.status}`);
      return null;
    }
    const d = await res.json() as any;

    const stars = d.stargazers_count || 0;
    const velocity = Math.min(1, Math.log(stars + 1) / Math.log(200000));
    const pulse_score = Math.round(Math.min(100,
      (Math.log(stars + 1) / Math.log(200000)) * 60 +
      (d.forks_count ? Math.log(d.forks_count + 1) / Math.log(50000) * 20 : 0) +
      (d.open_issues_count < 50 ? 10 : 5) +
      10
    ));

    return {
      name: d.name,
      repo: `${d.owner.login}/${d.name}`,
      description: d.description,
      stars,
      forks: d.forks_count || 0,
      last_update: d.pushed_at,
      created_at: d.created_at,
      language: d.language,
      topics: d.topics || [],
      license: d.license?.spdx_id || null,
      category: CATEGORIES[repo] || CATEGORIES[repo.toLowerCase()] || 'General',
      velocity,
      pulse_score,
      growth_score: Math.round(velocity * 30),
      popularity_score: Math.round((Math.log(stars + 1) / Math.log(200000)) * 25),
      activity_score: Math.round(Math.random() * 10 + 10),
      trust_score: 10,
      votes: 0,
      downvotes: 0,
      is_verified: stars > 1000,
      is_visible: true,
      quality_score: Math.min(100, Math.round((stars / 1000) + 50)),
      trend: '+0.0%',
    };
  } catch (err) {
    console.warn(`  ⚠ Failed ${repo}:`, (err as Error).message);
    return null;
  }
}

async function main() {
  console.log(`🚀 Emergency export — fetching ${SEED_REPOS.length} repos from GitHub...`);
  const agents = [];

  for (const repo of SEED_REPOS) {
    process.stdout.write(`  Fetching ${repo}...`);
    const agent = await fetchRepo(repo);
    if (agent) {
      agents.push(agent);
      console.log(` ✓ ${agent.stars.toLocaleString()} ★  Pulse: ${agent.pulse_score}`);
    }
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 300));
  }

  // Sort by pulse score
  agents.sort((a, b) => (b.pulse_score || 0) - (a.pulse_score || 0));

  const outPath = path.resolve('data/agents-static.json');
  fs.writeFileSync(outPath, JSON.stringify(agents, null, 2));
  console.log(`\n✅ Wrote ${agents.length} agents to data/agents-static.json`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
