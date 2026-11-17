import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * ONLY run middleware on routes that strictly require server-side session authentication.
     * Public pages (/, /agents, /rankings, /playbooks, /submit, /api/badge, etc.) bypass
     * middleware entirely, which prevents unnecessary Edge Function invocations on Netlify
     * for every visitor, crawler, and bot — saving huge amounts of compute credits.
     */
    '/admin-portal-secret/:path*',
    '/profile/:path*',
    '/watchlist/:path*',
    '/auth/:path*',
  ],
};
