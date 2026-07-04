/**
 * Quality Gate System for MoltPulse
 * 
 * Computes a quality score (0-100) for GitHub repos to filter noise
 * from the agent directory. Used by scrapers and admin flows.
 */

// --- Constants ---

export const AGENT_KEYWORDS = [
  'agent', 'autonomous', 'llm', 'gpt', 'ai', 'langchain', 'autogen',
  'tool-use', 'rag', 'multi-agent', 'framework', 'copilot', 'assistant',
  'chatbot', 'openai', 'anthropic', 'gemini', 'claude', 'reasoning',
  'agentic', 'self-improving', 'orchestration', 'workflow', 'automation',
  'nlp', 'natural-language', 'machine-learning', 'deep-learning',
  'transformer', 'inference', 'fine-tuning', 'embedding', 'vector',
  'retrieval', 'generative', 'prompt', 'chain-of-thought',
];

export const NOISE_PATTERNS = [
  /^my-/i,
  /dotfiles/i,
  /config.*profile/i,
  /^\.github$/i,
  /homework/i,
  /assignment/i,
  /college/i,
  /university/i,
  /course-?work/i,
  /tutorial/i,
  /^test-/i,
  /^demo-/i,
  /^hello-?world/i,
  /^awesome-/i,
  /^personal/i,
  /resume/i,
  /portfolio-?website/i,
  /blog-?template/i,
];

export const MIN_QUALITY_SCORE = 30;
export const AUTO_VERIFY_MIN_QUALITY = 70;
export const AUTO_VERIFY_MIN_STARS = 500;

// --- Types ---

export interface RepoQualityData {
  stars: number;
  description: string | null;
  repoName: string;        // full_name e.g. "owner/repo"
  topics: string[];
  readmeLength: number;     // character count
  hasReleases: boolean;
  license: string | null;
  language: string | null;
  lastPushDate: string;     // ISO date
}

export interface QualityResult {
  qualityScore: number;
  starsScore: number;
  readmeScore: number;
  relevanceScore: number;
  activityScore: number;
  infraScore: number;
  isLikelyAgent: boolean;
  isNoise: boolean;
  shouldBeVisible: boolean;
  shouldAutoVerify: boolean;
}

// --- Scoring Functions ---

/**
 * Stars score: 0-25 points
 * Uses log2 scale so diminishing returns at high star counts.
 * 0 stars = 0, 10 stars ≈ 10, 100 stars ≈ 20, 1k+ stars = 25
 */
function computeStarsScore(stars: number): number {
  if (stars <= 0) return 0;
  return Math.min(25, Math.log2(stars + 1) * 3);
}

/**
 * README score: 0-20 points
 * No README = 0, short = 5, medium = 12, thorough = 20
 */
function computeReadmeScore(readmeLength: number): number {
  if (readmeLength <= 0) return 0;
  if (readmeLength < 500) return 5;
  if (readmeLength < 2000) return 12;
  return 20;
}

/**
 * Agent-relevance score: 0-30 points
 * Checks topics + description + repo name against agent keywords.
 * Applies negative score for noise patterns.
 */
function computeRelevanceScore(
  topics: string[],
  description: string | null,
  repoName: string
): { score: number; isLikelyAgent: boolean; isNoise: boolean } {
  const searchText = [
    ...(topics || []),
    description || '',
    repoName,
  ].join(' ').toLowerCase();

  // Count keyword matches
  let keywordMatches = 0;
  for (const keyword of AGENT_KEYWORDS) {
    if (searchText.includes(keyword.toLowerCase())) {
      keywordMatches++;
    }
  }

  // Check for noise patterns
  const repoBaseName = repoName.split('/').pop() || '';
  let isNoise = false;
  for (const pattern of NOISE_PATTERNS) {
    if (pattern.test(repoBaseName) || pattern.test(description || '')) {
      isNoise = true;
      break;
    }
  }

  // No description at all is a strong negative signal
  const noDescription = !description || description.trim().length < 10;

  // Calculate score
  let score = 0;
  if (keywordMatches >= 5) score = 30;
  else if (keywordMatches >= 3) score = 22;
  else if (keywordMatches >= 2) score = 15;
  else if (keywordMatches >= 1) score = 8;
  else score = 0;

  // Penalties
  if (isNoise) score = Math.max(0, score - 20);
  if (noDescription) score = Math.max(0, score - 10);

  const isLikelyAgent = keywordMatches >= 2 && !isNoise;

  return { score, isLikelyAgent, isNoise };
}

/**
 * Activity score: 0-15 points
 * Based on recency of last push.
 */
function computeActivityScore(lastPushDate: string): number {
  const daysSincePush = (Date.now() - new Date(lastPushDate).getTime()) / (1000 * 3600 * 24);

  if (daysSincePush < 30) return 15;
  if (daysSincePush < 90) return 10;
  if (daysSincePush < 365) return 5;
  return 0;
}

/**
 * Infrastructure score: 0-10 points
 * License = 5, Releases = 5
 */
function computeInfraScore(license: string | null, hasReleases: boolean): number {
  let score = 0;
  if (license) score += 5;
  if (hasReleases) score += 5;
  return score;
}

// --- Main Exports ---

/**
 * Compute the full quality score for a repository.
 * Returns detailed breakdown + visibility/verification decisions.
 */
export function computeQualityScore(data: RepoQualityData): QualityResult {
  const starsScore = computeStarsScore(data.stars);
  const readmeScore = computeReadmeScore(data.readmeLength);
  const { score: relevanceScore, isLikelyAgent, isNoise } = computeRelevanceScore(
    data.topics,
    data.description,
    data.repoName
  );
  const activityScore = computeActivityScore(data.lastPushDate);
  const infraScore = computeInfraScore(data.license, data.hasReleases);

  const qualityScore = Math.min(100, Math.max(0,
    starsScore + readmeScore + relevanceScore + activityScore + infraScore
  ));

  const shouldBeVisible = qualityScore >= MIN_QUALITY_SCORE;
  const shouldAutoVerify = qualityScore >= AUTO_VERIFY_MIN_QUALITY && data.stars >= AUTO_VERIFY_MIN_STARS;

  return {
    qualityScore,
    starsScore,
    readmeScore,
    relevanceScore,
    activityScore,
    infraScore,
    isLikelyAgent,
    isNoise,
    shouldBeVisible,
    shouldAutoVerify,
  };
}

/**
 * Quick check: should this repo be hidden from the directory?
 */
export function shouldAutoHide(qualityScore: number): boolean {
  return qualityScore < MIN_QUALITY_SCORE;
}

/**
 * Quick check: should this repo get auto-verified?
 */
export function shouldVerify(qualityScore: number, stars: number): boolean {
  return qualityScore >= AUTO_VERIFY_MIN_QUALITY && stars >= AUTO_VERIFY_MIN_STARS;
}
