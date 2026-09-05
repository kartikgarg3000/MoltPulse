import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Cache at edge for 1 hour, allow up to 24h stale while revalidating.
// This is the critical fix to avoid Origin Transfer overages —
// badge SVGs served from Vercel's CDN edge instead of hitting the
// serverless function + Supabase on every GitHub README page view.
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const { owner, repo } = await params;
  const fullRepo = `${owner}/${repo}`;

  const supabase = await createClient();
  
  const { data } = await supabase
    .from('agents')
    .select('pulse_score')
    .ilike('repo', fullRepo)
    .single();

  let scoreText = 'N/A';
  if (data && data.pulse_score !== undefined && data.pulse_score !== null) {
    scoreText = Math.round(data.pulse_score).toString();
  }

  const leftText = "🔥 Pulse";
  const leftWidth = 65;
  const rightWidth = scoreText === 'N/A' ? 40 : 25 + (scoreText.length * 8);
  const totalWidth = leftWidth + rightWidth;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="24" role="img" aria-label="MoltPulse: ${scoreText}">
  <title>MoltPulse Score: ${scoreText}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="24" rx="4" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${leftWidth}" height="24" fill="#1e1e24"/>
    <rect x="${leftWidth}" width="${rightWidth}" height="24" fill="#6366f1"/>
    <rect width="${totalWidth}" height="24" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110">
    <text aria-hidden="true" x="${(leftWidth / 2) * 10}" y="175" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${(leftWidth - 14) * 10}">${leftText}</text>
    <text x="${(leftWidth / 2) * 10}" y="165" transform="scale(.1)" fill="#fff" textLength="${(leftWidth - 14) * 10}">${leftText}</text>
    <text aria-hidden="true" x="${(leftWidth + rightWidth / 2) * 10}" y="175" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${(rightWidth - 14) * 10}">${scoreText}</text>
    <text x="${(leftWidth + rightWidth / 2) * 10}" y="165" transform="scale(.1)" fill="#fff" font-weight="bold" textLength="${(rightWidth - 14) * 10}">${scoreText}</text>
  </g>
</svg>`.trim();

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      // CDN caches for 1 hour, serves stale up to 1 day while revalidating.
      // Prevents thousands of badge embeds from hammering the origin server.
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
