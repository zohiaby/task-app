const redis = require("../config/redis");
const { formatError } = require("../helpers/responseFormatter");

/**
 * In-memory rate limiting store (fallback when Redis is unavailable)
 */
const inMemoryStore = {
  cache: new Map(),
  get: async (key) => inMemoryStore.cache.get(key) || 0,
  set: async (key, value, options) => {
    inMemoryStore.cache.set(key, value);
    // Handle expiration
    if (options && options.PX) {
      setTimeout(() => {
        inMemoryStore.cache.delete(key);
      }, options.PX);
    }
    return true;
  },
  incr: async (key) => {
    const currentValue = inMemoryStore.cache.get(key) || 0;
    const newValue = currentValue + 1;
    inMemoryStore.cache.set(key, newValue);
    return newValue;
  },
};

/**
 * Redis-based rate limiting middleware with fallback to in-memory storage
 * Limits the number of requests a client can make in a given time window
 */
const rateLimiter = async (req, res, next) => {
  try {
    // Get IP address for rate limiting
    const ip = req.ip || req.connection.remoteAddress;
    const key = `ratelimit:${ip}`;

    // Get the current window max requests and time window from env
    const windowMs = process.env.RATE_LIMIT_WINDOW_MS || 60000; // Default: 1 minute
    const maxRequests = process.env.RATE_LIMIT_MAX_REQUESTS || 100; // Default: 100 requests per window

    // Check if Redis is available and use appropriate store
    let store;
    if (redis.isAvailable && redis.isAvailable()) {
      store = redis.useRedis ? redis.useRedis : redis.redisClient;
    } else {
      store = inMemoryStore;
    }

    // Get current count for this IP
    let currentRequestCount = 0;
    try {
      currentRequestCount = parseInt((await store.get(key)) || "0");
    } catch (error) {
      // If get fails, use in-memory store as fallback
      store = inMemoryStore;
      currentRequestCount = parseInt((await store.get(key)) || "0");
    }

    // Check if rate limit has been reached
    if (currentRequestCount >= maxRequests) {
      return res
        .status(429)
        .json(formatError("Too many requests, please try again later.", 429));
    }

    // First request from this IP
    if (currentRequestCount == 0) {
      await store.set(key, 1, {
        PX: windowMs, // Expire after window milliseconds
      });
    } else {
      // Increment the counter
      await store.incr(key);
    }

    // Add X-RateLimit headers to the response
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader(
      "X-RateLimit-Remaining",
      maxRequests - currentRequestCount - 1
    );

    next();
  } catch (error) {
    console.error("Rate limiter error:", error);
    // If rate limiting fails, we should still let the request through
    next();
  }
};

module.exports = rateLimiter;
