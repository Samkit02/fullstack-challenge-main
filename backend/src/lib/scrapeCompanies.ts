import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import { founderQueue } from '../queue/queue.js';
import { scrapeCompanyDomain } from '../utils/api.js';
import { db } from '../db/db.js';
import { redis } from '../queue/worker.js';
import { pool } from '../db/db.js';

const scrapeJobs = async (companyId: number, companyName: string, browser: any): Promise<void> => {
    const page = await browser.newPage();
    const formattedCompanyName = companyName.toLowerCase().replace(/\s+/g, '-');
    const url = `https://www.workatastartup.com/companies/${formattedCompanyName}`;

    try {
        await page.goto(url, { waitUntil: 'load', timeout: 60000 });
        const content = await page.content();
        const $ = cheerio.load(content);

        const jobs = $('div.job-name');

        console.log(`Found ${jobs.length} jobs for ${companyName}`);

        if (jobs.length > 0) {
            jobs.each(async (i, el) => {
                const jobTitle = $(el).find('a').text().trim();
        
                const jobLocation = $(el).closest('div').next().find('span:first-of-type').text().trim() || 'Unknown';
        
                const jobDescription = $(el).closest('div').find('div.job-description').text().trim() || '';
        
                await db.insertInto('jobs')
                  .values({
                    company_id: companyId,
                    title: jobTitle,
                    description: jobDescription,
                    location: jobLocation
                  })
                  .executeTakeFirst();
              });
        } else {
            await db.insertInto('jobs')
                .values({
                    company_id: companyId,
                    title: 'No jobs available',
                    description: 'No jobs were found for this company at the time of scraping',
                    location: 'Unknown'
                })
                .executeTakeFirst();
        }
    } catch (err) {
        console.error(`Error scraping jobs for ${companyName}:`, err);
    } finally {
        await page.close();
    }
};

const scrapeFounders = async (companyId: number, companyName: string, browser: any): Promise<void> => {
    const page = await browser.newPage();
    const formattedCompanyName = companyName.toLowerCase().replace(/\s+/g, '-');
    const url = `https://www.workatastartup.com/companies/${formattedCompanyName}`;

    try {
        await page.goto(url, { waitUntil: 'load', timeout: 60000 });
        const content = await page.content();
        const $ = cheerio.load(content);

        const companyDomain = scrapeCompanyDomain($);

        const founders = $('div.mb-1.font-medium');
        const founderPromises = founders.map(async (i, el) => {
            const founderName = $(el).text().trim();
            const linkedinUrl = $(el).find('a.fa-linkedin').attr('href');

            if (founderName && linkedinUrl) {
                console.log(`Found founder: ${founderName}, LinkedIn: ${linkedinUrl}`);

                const insertedFounder = await db.insertInto('founders')
                    .values({
                        company_id: companyId,
                        full_name: founderName,
                        linkedin_url: linkedinUrl,
                        company_domain: companyDomain || 'Unknown',
                    })
                    .returning('id')
                    .executeTakeFirst();

                if (insertedFounder?.id !== undefined) {
                    await founderQueue.add('enrich-founder-data', {
                        founderId: insertedFounder.id,
                        founderName,
                        linkedinUrl,
                        companyDomain: companyDomain || 'Unknown',
                    });

                    console.log(`Enqueued job for founder: ${founderName}`);
                }
            }
        }).get();

        await Promise.all(founderPromises);
        console.log(`Finished scraping founders for ${companyName}`);

        await scrapeJobs(companyId, companyName, browser);

    } catch (err) {
        console.error(`Error scraping founders for ${companyName}:`, err);
    } finally {
        await page.close();
    }
};

const scrapeCompanies = async (): Promise<void> => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('https://ycombinator.com/companies');

    let previousHeight: number | undefined;
    const scrollDelay = 1000;
    const maxScrollAttempts = 40;
    let scrapedCompanies = new Set<string>();

    for (let i = 0; i < maxScrollAttempts; i++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await page.waitForTimeout(scrollDelay);

        const content = await page.content();
        const $ = cheerio.load(content);
        const companies = $('a._company_86jzd_338');

        let newCompaniesFound = false;

        const companyPromises = companies.map(async (i, el) => {
            const companyName = $(el).find('span._coName_86jzd_453').text().trim();
            const location = $(el).find('span._coLocation_86jzd_469').text().trim();
            const description = $(el).find('span._coDescription_86jzd_478').text().trim();
            const companyLink = $(el).attr('href');

            if (companyName && companyLink && !scrapedCompanies.has(companyName)) {
                newCompaniesFound = true;
                scrapedCompanies.add(companyName);

                console.log(`Processing company: ${companyName}`);

                const companyId = await db.insertInto('companies')
                    .values({
                        name: companyName,
                        location: location || 'Unknown',
                        description,
                    })
                    .returning('id')
                    .executeTakeFirst();

                if (companyId?.id !== undefined) {
                    await scrapeFounders(companyId.id, companyName, browser);
                }
            }
        }).get();

        await Promise.all(companyPromises);

        const currentHeight = await page.evaluate(() => document.body.scrollHeight);

        if (!newCompaniesFound || currentHeight === previousHeight) {
            console.log('No more new content found, stopping...');
            break;
        }
        previousHeight = currentHeight;
    }

    await browser.close();
    console.log("Company scraping completed.");
};

(async () => {
    try {
        await scrapeCompanies();
    } catch (err) {
        console.error('An error occurred during scraping:', err);
    } finally {
        try {
            console.log('Closing database and Redis connections...');
            await redis.quit();
            await pool.end();
            console.log('All connections closed, exiting...');
        } catch (err) {
            console.error('Error closing connections:', err);
        }
        process.exit(0);
    }
})();