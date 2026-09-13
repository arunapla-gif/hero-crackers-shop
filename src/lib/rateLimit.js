/**
 * In-memory sliding window rate limiter for abuse and brute-force prevention.
 */

class RateLimiter {
  constructor() {
    this.hits = new Map();
    // Periodically clean up expired entries every 5 minutes
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), 5 * 60 * 1000).unref?.();
    }
  }

  getClientIp(request) {
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }
    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
      return realIp.trim();
    }
    return '127.0.0.1';
  }

  isRateLimited(key, maxLimit, windowMs) {
    const now = Date.now();
    const entry = this.hits.get(key);

    if (!entry) {
      this.hits.set(key, { count: 1, resetTime: now + windowMs });
      return { limited: false, remaining: maxLimit - 1, retryAfterSeconds: 0 };
    }

    if (now > entry.resetTime) {
      // Window expired, reset
      this.hits.set(key, { count: 1, resetTime: now + windowMs });
      return { limited: false, remaining: maxLimit - 1, retryAfterSeconds: 0 };
    }

    if (entry.count >= maxLimit) {
      const retryAfterSeconds = Math.ceil((entry.resetTime - now) / 1000);
      return { limited: true, remaining: 0, retryAfterSeconds };
    }

    entry.count += 1;
    return { limited: false, remaining: maxLimit - entry.count, retryAfterSeconds: 0 };
  }

  recordFailure(key, windowMs) {
    const now = Date.now();
    const entry = this.hits.get(key);
    if (!entry || now > entry.resetTime) {
      this.hits.set(key, { count: 1, resetTime: now + windowMs });
    } else {
      entry.count += 1;
    }
  }

  getFailures(key, maxLimit, windowMs) {
    const now = Date.now();
    const entry = this.hits.get(key);
    if (!entry || now > entry.resetTime) {
      return { limited: false, count: 0, retryAfterSeconds: 0 };
    }
    if (entry.count >= maxLimit) {
      const retryAfterSeconds = Math.ceil((entry.resetTime - now) / 1000);
      return { limited: true, count: entry.count, retryAfterSeconds };
    }
    return { limited: false, count: entry.count, retryAfterSeconds: 0 };
  }

  reset(key) {
    this.hits.delete(key);
  }

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.hits.entries()) {
      if (now > entry.resetTime) {
        this.hits.delete(key);
      }
    }
  }
}

const globalForLimiter = globalThis;
const limiter = globalForLimiter._rateLimiter || new RateLimiter();
if (process.env.NODE_ENV !== 'production') globalForLimiter._rateLimiter = limiter;

export default limiter;
