/**
 * lib/rate-limit.ts
 *
 * Lightweight in-memory IP/user rate limiter for Next.js API routes.
 * Uses a sliding-window counter stored in a module-level Map.
 *
 * NOTE: Each serverless function instance has its own Map — this is
 * per-instance, not global. It is still effective at preventing bursts
 * from a single client hitting the same cold or warm instance repeatedly.
 * For global rate limiting use Upstash Redis (upgrade path).
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

// Separate stores per limiter name so different endpoints don't share counts
const stores = new Map<string, Map<string, RateLimitEntry>>();

function getStore(name: string): Map<string, RateLimitEntry> {
  if (!stores.has(name)) stores.set(name, new Map());
  return stores.get(name)!;
}

export interface RateLimitResult {
  success: boolean;   // true = request is allowed
  limit: number;      // max requests per window
  remaining: number;  // requests left in current window
  reset: number;      // unix ms when window resets
}

/**
 * Check whether a key (IP or user ID) is within the rate limit.
 *
 * @param name      A unique name for this limiter (e.g. "badge", "watchlist-toggle")
 * @param key       The identifier to throttle (IP address or user ID)
 * @param limit     Max requests allowed per window
 * @param windowMs  Window duration in milliseconds (default: 60_000 = 1 minute)
 */
export function checkRateLimit(
  name: string,
  key: string,
  limit: number,
  windowMs = 60_000,
): RateLimitResult {
  const store = getStore(name);
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart >= windowMs) {
    // New window
    store.set(key, { count: 1, windowStart: now });
    return { success: true, limit, remaining: limit - 1, reset: now + windowMs };
  }

  entry.count++;

  if (entry.count > limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: entry.windowStart + windowMs,
    };
  }

  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    reset: entry.windowStart + windowMs,
  };
}

/**
 * Extract the real client IP from Next.js request headers.
 * Handles Netlify / Cloudflare / standard proxies.
 */
export function getClientIp(request: Request): string {
  const headers = request instanceof Request ? request.headers : (request as any).headers;
  return (
    headers.get('x-nf-client-connection-ip') ||   // Netlify real IP
    headers.get('cf-connecting-ip') ||              // Cloudflare
    headers.get('x-real-ip') ||                     // nginx proxy
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}
