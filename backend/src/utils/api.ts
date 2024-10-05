import fetch, { Response } from 'node-fetch';
import { timeout } from './timeout.js';

interface ApiResponse {
  tag: 'ok' | 'err';
  value?: string;
  error?: string;
}

export const scrapeCompanyDomain = ($: cheerio.Root): string | null => {
  const domainElement = $('i.fa-link');

  const companyDomain = domainElement.attr('title')?.trim() || null;

  if (companyDomain) {
    console.log(`Found company domain: ${companyDomain}`);
    return companyDomain;
  } else {
    console.warn('No company domain found');
    return null;
  }
};

export const callEmailGrabberApi = async (
  fullName: string,
  linkedInUrl: string,
  companyDomain: string,
  apiNumber: number
): Promise<string | null> => {
  const apiUrl = `http://alpha-api.fiber.ai/interview-challenge-email-grabbing-${apiNumber}`;

  try {
    const response: Response = await timeout(10000, fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, linkedInUrl, companyDomain, "apiKey": "651p7p8C3H-JU7Tb" }),
    }));

    const data: ApiResponse = await response.json() as ApiResponse;
    return data.tag === 'ok' ? data.value ?? null : null;

  } catch (error) {
    console.error(`Error calling email grabber API ${apiNumber}:`, error);
    return null;
  }
};

export const callBounceDetectionApi = async (
  email: string,
  apiNumber: number
): Promise<string | null> => {
  const apiUrl = `http://alpha-api.fiber.ai/interview-challenge-bounce-detection-${apiNumber}`;

  try {
    const response: Response = await timeout(10000, fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, "apiKey": "651p7p8C3H-JU7Tb" }),
    }));

    const data: ApiResponse = await response.json() as ApiResponse;
    return data.tag === 'ok' ? data.value ?? null : null;

  } catch (error) {
    console.error(`Error calling bounce detection API ${apiNumber}:`, error);
    return null;
  }
};
