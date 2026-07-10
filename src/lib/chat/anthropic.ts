import Anthropic from '@anthropic-ai/sdk';

// Credentials resolve from the environment (ANTHROPIC_API_KEY, ANTHROPIC_AUTH_TOKEN,
// or an `ant auth login` profile) -- never hardcode a key here.
export const anthropic = new Anthropic();

export interface RateLimiter {
  check(key: string): { allowed: boolean; retryAfterMs: number };
}

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;

// In-memory, fixed-window limiter. Does NOT survive a cold start or persist
// across serverless instances -- an accepted limitation for this project
// (see PLAN.md Phase 4). The RateLimiter interface boundary is what lets a
// durable store (e.g. Redis/Upstash) replace this later without touching
// the route that calls it.
class InMemoryFixedWindowRateLimiter implements RateLimiter {
  private windows = new Map<string, { count: number; windowStart: number }>();

  check(key: string): { allowed: boolean; retryAfterMs: number } {
    const now = Date.now();
    const entry = this.windows.get(key);

    if (!entry || now - entry.windowStart >= WINDOW_MS) {
      this.windows.set(key, { count: 1, windowStart: now });
      return { allowed: true, retryAfterMs: 0 };
    }

    if (entry.count < MAX_REQUESTS_PER_WINDOW) {
      entry.count += 1;
      return { allowed: true, retryAfterMs: 0 };
    }

    return { allowed: false, retryAfterMs: WINDOW_MS - (now - entry.windowStart) };
  }
}

export const rateLimiter: RateLimiter = new InMemoryFixedWindowRateLimiter();
