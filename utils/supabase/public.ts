import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Public, cookie-free Supabase client for static / public page data.
 * Does NOT invoke next/headers `cookies()`, allowing Next.js to pre-render
 * pages statically (SSG) and cache them at the CDN edge (ISR).
 * This eliminates serverless function compute invocations on Netlify.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  return createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
