/**
 * lib/static-fallback.ts
 *
 * Returns agent data from the static JSON file when Supabase is restricted (402).
 * This is a zero-cost fallback — no DB queries, no egress.
 */
import agentsStatic from '@/data/agents-static.json';
import { Agent } from '@/types';

export function getStaticAgents(): Agent[] {
  return agentsStatic as unknown as Agent[];
}
