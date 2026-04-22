import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../logger';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (redisClient) return redisClient;

  redisClient = new Redis(config.redis.url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    lazyConnect: false,
  });

  redisClient.on('connect', () => logger.info('Redis connected'));
  redisClient.on('error', (err) => logger.error('Redis error', { error: err.message }));
  redisClient.on('close', () => logger.warn('Redis connection closed'));

  return redisClient;
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

export const CacheKeys = {
  analysis: (textHash: string) => `analysis:${textHash}`,
  userSession: (userId: string) => `user:session:${userId}`,
  rateLimit: (ip: string) => `rate:limit:${ip}`,
} as const;
