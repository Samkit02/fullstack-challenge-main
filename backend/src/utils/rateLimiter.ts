import { Redis } from 'ioredis';

const redis: Redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
});

const MAX_REQUESTS_PER_MINUTE = 1000;

export const checkRateLimit = async (): Promise<boolean> => {
  const currentTime = Math.floor(Date.now() / 1000);
  const windowTime = 60;
  const key = `api_rate_limit:${currentTime}`;

  const requests = await redis.incr(key);

  if (requests === 1) {
    await redis.expire(key, windowTime);
  }

  return requests <= MAX_REQUESTS_PER_MINUTE;
};
