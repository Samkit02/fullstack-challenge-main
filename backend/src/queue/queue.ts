import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = 'redis://default:@localhost:6379';

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

export const founderQueue = new Queue('founder-api-jobs', {
  connection: redis,
});