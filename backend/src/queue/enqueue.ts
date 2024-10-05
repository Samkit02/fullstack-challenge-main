import { founderQueue } from './queue.js';
import { db } from '../db/db.js';

export const enqueueJobs = async (): Promise<void> => {
    const founders = await db.selectFrom('founders')
        .select(['id', 'full_name', 'linkedin_url', 'company_domain'])
        .where('email', 'is', null)
        .execute();

    const validFounders = founders.filter((founder) => founder.id !== undefined);

    for (const founder of validFounders) {
        await founderQueue.add('enrich-founder-data', {
            founderId: founder.id,
            founderName: founder.full_name,
            linkedinUrl: founder.linkedin_url,
            companyDomain: founder.company_domain,
        });
    }

    console.log(`Enqueued ${founders.length} jobs`);
};