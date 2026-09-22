interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory rate limiter Map tracking requests per IP.
//
// NOTE ON SERVERLESS: this map lives inside one server instance. On Vercel,
// Netlify Functions or any autoscaling host each warm instance keeps its own
// copy, so the effective ceiling is RATE_LIMIT_MAX multiplied by the number of
// running instances, and it resets on cold start. That is adequate against
// casual abuse. If you need a hard global ceiling on AI spend, back this with a
// shared store such as Upstash Redis or Vercel KV.
const rateLimitMap = new Map<string, RateLimitRecord>();
export const RATE_LIMIT_MAX = 10;
export const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window

export function resetRateLimit(): void {
  rateLimitMap.clear();
}

/**
 * Headers set by the hosting platform's own edge. Safe to trust, because the
 * platform overwrites whatever the client sent.
 */
const TRUSTED_IP_HEADERS = [
  "x-vercel-forwarded-for", // Vercel
  "cf-connecting-ip", // Cloudflare
  "x-nf-client-connection-ip", // Netlify
  "true-client-ip", // Akamai, Cloudflare Enterprise
];

/**
 * Identifies the caller for rate limiting.
 *
 * `x-forwarded-for` is a list the client can prepend to, so its leftmost entry
 * is attacker-controlled: rotating it defeats the limit entirely and runs up
 * your AI bill. Platform headers are therefore checked first, and the fallback
 * reads the RIGHTMOST `x-forwarded-for` entry, which is the address your own
 * edge observed rather than anything the client supplied.
 */
export function getClientIp(request: Request): string {
  for (const header of TRUSTED_IP_HEADERS) {
    const value = request.headers.get(header)?.trim();
    if (value) return value.split(",")[0].trim();
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const hops = forwardedFor
      .split(",")
      .map((hop) => hop.trim())
      .filter(Boolean);
    if (hops.length > 0) return hops[hops.length - 1];
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

export function isRateLimited(ip: string): boolean {
  const now = Date.now();

  // Periodic cleanup if map grows
  if (rateLimitMap.size > 1000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.resetTime) rateLimitMap.delete(key);
    }
  }

  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return true;
  }

  record.count += 1;
  return false;
}
