const redis = require("redis");
require("dotenv").config();

// Initialize with null - we'll only create a client if Redis is available
let redisClient = null;

// Function to connect to Redis
const connectToRedis = async () => {
  try {
    const redisConfig = {
      socket: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
    };

    // Add password if provided
    if (process.env.REDIS_PASSWORD) {
      redisConfig.password = process.env.REDIS_PASSWORD;
    }

    console.log(
      `Attempting to connect to Redis at ${redisConfig.socket.host}:${redisConfig.socket.port}`
    );

    // Create Redis client
    const client = redis.createClient(redisConfig);

    // Set up event handlers
    client.on("error", (error) => {
      console.error("Redis error:", error.message);
    });

    client.on("connect", () => {
      console.log("Redis connection established successfully");
    });

    // Try to connect
    await client.connect();

    // Wrap client with methods needed for rate limiter
    redisClient = {
      get: async (key) => await client.get(key),
      set: async (key, value, options) => {
        if (options && options.PX) {
          return await client.set(key, value, { PX: options.PX });
        }
        return await client.set(key, value);
      },
      incr: async (key) => await client.incr(key),
      isOpen: true,
    };

    return redisClient;
  } catch (error) {
    console.warn(
      "Redis is not available. Running with limited functionality:",
      error.message
    );
    return null;
  }
};

// Connect in background but don't wait for it
connectToRedis().catch(() => {
  console.warn(
    "Could not connect to Redis. Rate limiting and caching will be disabled."
  );
});

// Helper function to safely use Redis
const useRedis = async (operation) => {
  if (!redisClient) return null;
  try {
    return await operation(redisClient);
  } catch (error) {
    console.error("Redis operation failed:", error.message);
    return null;
  }
};

module.exports = {
  redisClient,
  connectToRedis,
  useRedis,
  isAvailable: () => redisClient !== null && redisClient.isOpen,
};
