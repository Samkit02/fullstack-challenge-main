// import { Redis } from 'ioredis';
// import dotenv from 'dotenv';
// import { chromium } from 'playwright';
// import * as cheerio from 'cheerio';
// import { Kysely, PostgresDialect } from 'kysely';
// import pg from 'pg';
// import { timeout } from '../utils/timeout.js';
// import fetch from 'node-fetch';

// const { Pool } = pg;

// dotenv.config();

// // Define Company, Job, and Founder interfaces
// interface Company {
//     id?: number;
//     name: string;
//     location: string;
//     description?: string;
// }

// interface Job {
//     id?: number;
//     company_id: number;
//     title: string;
//     location: string;
//     description?: string;
// }

// interface Founder {
//     id?: number;
//     company_id: number;
//     full_name: string;
//     linkedin_url: string;
//     email?: string;
//     bounce_status?: string; // 'valid' or 'invalid'
// }

// interface EmailGrabberCache {
//     id?: number;               // The primary key, which may be undefined for new records
//     founder_name: string;      // The name of the founder
//     linkedin_url: string;      // The LinkedIn URL of the founder
//     company_domain: string;    // The company domain (e.g., amplitude.com)
//     email: string;             // The email returned by the API
//     api_number: number;        // Which API was used (1 or 2)
//     created_at?: Date;         // Timestamp of when the entry was created, automatically set by the DB
// }

// interface BounceDetectorCache {
//     id?: number;               // The primary key, which may be undefined for new records
//     email: string;             // The email for which bounce status was checked
//     bounce_status: string;     // The bounce status (e.g., "valid" or "invalid")
//     api_number: number;        // Which API was used (1 or 2)
//     created_at?: Date;         // Timestamp of when the entry was created, automatically set by the DB
// }

// interface Database {
//     companies: Company;
//     jobs: Job;
//     founders: Founder;
//     email_grabber_cache: EmailGrabberCache;
//     bounce_detector_cache: BounceDetectorCache;
// }

// const fiberApiKey: string | undefined = 651p7p8C3H-JU7Tb;
// if (!fiberApiKey) {
//     throw new Error("API key is missing");
// }

// // Setup Redis and PostgreSQL connections
// const redisUrl = redis://default:@localhost:6379 || 'redis://localhost:6379';
// const redisClient = new Redis(redisUrl);

// const pool = new Pool({
//     connectionString: postgres://postgres:S@mkitshah02@localhost:5432/yc_companies,
// });

// const db = new Kysely<Database>({
//     dialect: new PostgresDialect({ pool }),
// });


// // Function to scrape companies from YCombinator
// const scrapeCompanies = async () => {
//     const browser = await chromium.launch();
//     const page = await browser.newPage();
//     await page.goto('https://ycombinator.com/companies');

//     let previousHeight;
//     const scrollDelay = 1000;
//     const maxScrollAttempts = 20;

//     for (let i = 0; i < maxScrollAttempts; i++) {
//         await page.evaluate(() => window.scrollBy(0, window.innerHeight));
//         await page.waitForTimeout(scrollDelay);

//         const content = await page.content();
//         const $ = cheerio.load(content);
//         const companies = $('a._company_86jzd_338');

//         const companyPromises = companies.map(async (i, el) => {
//             const companyName = $(el).find('span._coName_86jzd_453').text().trim();
//             const location = $(el).find('span._coLocation_86jzd_469').text().trim();
//             const description = $(el).find('span._coDescription_86jzd_478').text().trim();
//             const companyLink = $(el).attr('href');

//             if (companyName && companyLink) {
//                 const companyId = await db.insertInto('companies')
//                     .values({
//                         name: companyName,
//                         location: location || 'Unknown',
//                         description,
//                     })
//                     .returning('id')
//                     .executeTakeFirst();

//                 if (companyId && companyId.id !== undefined) {
//                     await scrapeFoundersAndJobs(companyId.id, companyName, browser); // Pass the browser instance
//                 }
//             } else {
//                 console.warn('Company or company link missing, skipping...');
//             }
//         }).get();

//         await Promise.all(companyPromises);

//         const currentHeight = await page.evaluate(() => document.body.scrollHeight);
//         if (currentHeight === previousHeight) {
//             console.log('No more new content found, stopping...');
//             break;
//         }
//         previousHeight = currentHeight;
//     }

//     await browser.close();
//     console.log('Browser closed after scraping companies');
// };

// const scrapeFoundersAndJobs = async (companyId: number, companyName: string, browser: any) => {
//     await scrapeFounders(companyId, companyName, browser); // Scrape founders as before
//     await scrapeJobs(companyId, companyName, browser); // Scrape jobs for the same company
// };

// const scrapeCompanyDomain = ($: cheerio.Root): string | null => {
//     // Find the <i> tag with the class 'fa-link' and extract the 'title' attribute (domain name)
//     const domainElement = $('i.fa-link');

//     // Extract the value from the 'title' attribute
//     const companyDomain = domainElement.attr('title')?.trim() || null;

//     if (companyDomain) {
//         console.log(`Found company domain: ${companyDomain}`);
//         return companyDomain;
//     } else {
//         console.warn('No company domain found');
//         return null;
//     }
// };

// const scrapeJobs = async (companyId: number, companyName: string, browser: any) => {
//     const page = await browser.newPage();
//     const formattedCompanyName = companyName.toLowerCase().replace(/\s+/g, '-');
//     const url = `https://www.workatastartup.com/companies/${formattedCompanyName}`;

//     try {
//         await page.goto(url, { waitUntil: 'load', timeout: 60000 });
//         const content = await page.content();
//         const $ = cheerio.load(content);

//         // Scrape the jobs data
//         const jobs = $('div.job-name').map((i, el) => ({
//             title: $(el).text().trim(),
//             link: $(el).first().attr('href')
//         })).get();

//         console.log(`Found ${jobs.length} jobs for ${companyName}`);

//         if (jobs.length > 0) {
//             // Loop through each job found and insert it into the database
//             for (const job of jobs) {
//                 const jobLocation = $('span:contains("Location")').next().text().trim() || 'Unknown';
//                 const jobDescription = $('div.job-description').text().trim();

//                 await db.insertInto('jobs')
//                     .values({
//                         company_id: companyId,
//                         title: job.title,
//                         description: jobDescription || 'No description available',
//                         location: jobLocation
//                     })
//                     .executeTakeFirst();
//             }
//         } else {
//             // If no jobs are found, insert a placeholder entry
//             await db.insertInto('jobs')
//                 .values({
//                     company_id: companyId,
//                     title: 'No job available',
//                     description: 'No job available for this company',
//                     location: 'Unknown'
//                 })
//                 .executeTakeFirst();
//         }

//     } catch (err) {
//         console.error(`Error scraping jobs for ${companyName}:`, err);
//     } finally {
//         await page.close();
//     }
// };

// const scrapeFounders = async (companyId: number, companyName: string, browser: any) => {
//     const page = await browser.newPage();
//     const formattedCompanyName = companyName.toLowerCase().replace(/\s+/g, '-');
//     const url = `https://www.workatastartup.com/companies/${formattedCompanyName}`;

//     try {
//         await page.goto(url, { waitUntil: 'load', timeout: 60000 });
//         const content = await page.content();
//         const $ = cheerio.load(content);

//         // Fetch the company domain from the page
//         const companyDomain = scrapeCompanyDomain($) || 'unknown.com';

//         // Find founders information
//         const founders = $('div.mb-1.font-medium');

//         const founderPromises = founders.map(async (i, el) => {
//             const founderName = $(el).text().trim();
//             const linkedinUrl = $(el).find('a.fa-linkedin').attr('href');

//             if (founderName && linkedinUrl) {
//                 console.log(`Found founder: ${founderName}, LinkedIn: ${linkedinUrl}`);

//                 // Insert founder into the database
//                 const insertedFounder = await db.insertInto('founders')
//                     .values({
//                         company_id: companyId,
//                         full_name: founderName,
//                         linkedin_url: linkedinUrl || '',
//                     })
//                     .returning('id')
//                     .executeTakeFirst();

//                 if (insertedFounder && insertedFounder.id !== undefined) {
//                     // Enrich founder data with email grabbing and bounce detection
//                     await enrichFounderData(insertedFounder.id, founderName, linkedinUrl, companyDomain);
//                 }
//             }
//         }).get();

//         await Promise.all(founderPromises);
//         console.log(`Finished scraping founders for ${companyName}`);

//     } catch (err) {
//         console.error(`Error scraping WorkAtStartup for ${companyName}:`, err);
//     } finally {
//         await page.close(); // Close the page after scraping
//     }
// };

// // Enrich founder data using API calls for email grabbing and bounce detection with caching
// const enrichFounderData = async (founderId: number, founderName: string, linkedinUrl: string, companyDomain: string) => {
//     try {
//         // Check email cache
//         const cachedEmail = await getCachedEmail(founderName, linkedinUrl, companyDomain);

//         let email = cachedEmail;

//         if (!email) {
//             // Call email grabber APIs if no cached result
//             const email1 = await callEmailGrabberApi(founderName, linkedinUrl, companyDomain, fiberApiKey, 1);
//             const email2 = await callEmailGrabberApi(founderName, linkedinUrl, companyDomain, fiberApiKey, 2);
//             email = email1 ?? email2 ?? null;

//             // Store result in email grabber cache
//             if (email) {
//                 await cacheEmail(founderName, linkedinUrl, companyDomain, email, email1 ? 1 : 2);
//             }
//         }

//         if (email) {
//             // Check bounce detector cache
//             const cachedBounceStatus = await getCachedBounceStatus(email);

//             let bounceStatus = cachedBounceStatus;

//             if (!bounceStatus) {
//                 // Call bounce detection APIs if no cached result
//                 const bounce1 = await callBounceDetectionApi(email, fiberApiKey, 1);
//                 const bounce2 = await callBounceDetectionApi(email, fiberApiKey, 2);
//                 bounceStatus = bounce1 ?? bounce2 ?? null;

//                 // Store result in bounce detector cache
//                 if (bounceStatus) {
//                     await cacheBounceStatus(email, bounceStatus, bounce1 ? 1 : 2);
//                 }
//             }

//             // Update founder info in the database
//             await db.updateTable('founders')
//                 .set({
//                     email,
//                     bounce_status: bounceStatus ?? undefined
//                 })
//                 .where('id', '=', founderId)
//                 .executeTakeFirst();

//             console.log(`Updated founder ${founderName} with email: ${email}, bounce status: ${bounceStatus}`);
//         } else {
//             console.log(`No email found for founder ${founderName}`);
//         }
//     } catch (err) {
//         console.error(`Error enriching founder data for ${founderName}:`, err);
//     }
// };

// // Function to get cached email from email grabber cache
// const getCachedEmail = async (founderName: string, linkedinUrl: string, companyDomain: string) => {
//     const result = await db.selectFrom('email_grabber_cache')
//         .selectAll()
//         .where('founder_name', '=', founderName)
//         .where('linkedin_url', '=', linkedinUrl)
//         .where('company_domain', '=', companyDomain)
//         .orderBy('created_at', 'desc')
//         .executeTakeFirst();

//     return result ? result.email : null;
// };

// // Function to cache email
// const cacheEmail = async (founderName: string, linkedinUrl: string, companyDomain: string, email: string, apiNumber: number) => {
//     await db.insertInto('email_grabber_cache')
//         .values({
//             founder_name: founderName,
//             linkedin_url: linkedinUrl,
//             company_domain: companyDomain,
//             email,
//             api_number: apiNumber
//         })
//         .execute();
// };

// // Function to get cached bounce status
// const getCachedBounceStatus = async (email: string) => {
//     const result = await db.selectFrom('bounce_detector_cache')
//         .selectAll()
//         .where('email', '=', email)
//         .orderBy('created_at', 'desc')
//         .executeTakeFirst();

//     return result ? result.bounce_status : null;
// };

// // Function to cache bounce status
// const cacheBounceStatus = async (email: string, bounceStatus: string, apiNumber: number) => {
//     await db.insertInto('bounce_detector_cache')
//         .values({
//             email,
//             bounce_status: bounceStatus,
//             api_number: apiNumber
//         })
//         .execute();
// };

// // Email grabbing API call
// const callEmailGrabberApi = async (fullName: string, linkedInUrl: string, companyDomain: string, apiKey: string, apiNumber: number) => {
//     const apiUrl = `http://alpha-api.fiber.ai/interview-challenge-email-grabbing-${apiNumber}`;
//     try {
//         const response = await timeout(10000, fetch(apiUrl, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ fullName, linkedInUrl, companyDomain, apiKey })
//         }));

//         const data = await response.json() as { tag: 'ok' | 'err'; value?: string; error?: string };
//         if (data.tag === 'ok') {
//             return data.value; // Return email if found
//         }
//         console.warn(`Email grabber API ${apiNumber} returned error: ${data.error}`);
//         return null;
//     } catch (error) {
//         console.error(`Email grabber API ${apiNumber} error:`, error);
//         return null;
//     }
// };

// // Bounce detection API call
// const callBounceDetectionApi = async (email: string, apiKey: string, apiNumber: number) => {
//     const apiUrl = `http://alpha-api.fiber.ai/interview-challenge-bounce-detection-${apiNumber}`;
//     try {
//         const response = await timeout(10000, fetch(apiUrl, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ email, apiKey })
//         }));

//         const data = await response.json() as { tag: 'ok' | 'err'; value?: string; error?: string };
//         if (data.tag === 'ok') {
//             return data.value; // Return bounce verdict if successful
//         }
//         console.warn(`Bounce detection API ${apiNumber} returned error: ${data.error}`);
//         return null;
//     } catch (error) {
//         console.error(`Bounce detection API ${apiNumber} error:`, error);
//         return null;
//     }
// };

// (async () => {
//     try {
//         await scrapeCompanies();
//     } catch (err) {
//         console.error('An error occurred during scraping:', err);
//     } finally {
//         console.log('Closing database and Redis connections...');
//         await redisClient.quit(); // Close Redis connection
//         await pool.end(); // Close PostgreSQL pool
//         console.log('All connections closed, exiting...');
//         process.exit(0); // Force exit the process if necessary
//     }
// })();
