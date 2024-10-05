import { Worker } from 'bullmq';
import { callEmailGrabberApi, callBounceDetectionApi } from '../utils/api.js';
import { checkRateLimit } from '../utils/rateLimiter.js';
import { db } from '../db/db.js';
import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = 'redis://default:@localhost:6379';

interface FounderJob {
    founderId: number;
    founderName: string;
    linkedinUrl: string;
    companyDomain: string;
}

export const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
});

const founderWorker = new Worker<FounderJob>('founder-api-jobs', async (job) => {
    const { founderId, founderName, linkedinUrl, companyDomain } = job.data;

    if (!(await checkRateLimit())) {
        throw new Error('Rate limit exceeded, retry later');
    }

    const email1 = await callEmailGrabberApi(founderName, linkedinUrl, companyDomain, 1);
    const email2 = await callEmailGrabberApi(founderName, linkedinUrl, companyDomain, 2);

    const email = email1 || email2;

    if (email) {
        const bounce1 = await callBounceDetectionApi(email, 1);
        const bounce2 = await callBounceDetectionApi(email, 2);
        const bounceStatus = bounce1 || bounce2;

        await db.updateTable('founders')
            .set({
                email: email ?? undefined,
                bounce_status: bounceStatus ?? undefined,
            })
            .where('id', '=', founderId)
            .execute();
    }
}, {
    connection: redis,
    limiter: {
        max: 1000,
        duration: 60000,
    },
});

founderWorker.on('completed', (job) => {
    console.log(`Job ${job.id} has been completed`);
});

founderWorker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed: ${err.message}`);
});
