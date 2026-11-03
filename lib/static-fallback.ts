/**
 * lib/static-fallback.ts
 *
 * Returns agent data from the static JSON file when Supabase is restricted (402).
 * This is a zero-cost fallback — no DB queries, no egress.
 *
 * Set NEXT_PUBLIC_STATIC_ONLY=true in Netlify env vars to skip Supabase entirely
 * when the DB quota is exceeded — saves compute credits on every server render.
 */
import agentsStatic from '@/data/agents-static.json';
import { Agent } from '@/types';

export function getStaticAgents(): Agent[] {
  return agentsStatic as unknown as Agent[];
}

/**
 * Returns true when the app should skip Supabase and serve purely from static data.
 * Set NEXT_PUBLIC_STATIC_ONLY=true in Netlify environment variables to activate.
 */
export function isStaticOnlyMode(): boolean {
  return process.env.NEXT_PUBLIC_STATIC_ONLY === 'true';
}
