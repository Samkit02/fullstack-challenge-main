import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import { db } from './db/db.js';
import dotenv from 'dotenv';
import cors from 'cors';
import { sql } from 'kysely';

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
}));

app.use(bodyParser.json());

const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];

  if (apiKey === "OU+oS+nWlDhE0yW6CyvXnCKzqBMsyoTSgzQ+F46siDQ=") {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized. Invalid API Key.' });
  }
};

app.use(apiKeyAuth);

app.get('/health-check', async (req: Request, res: Response) => {
  try {
    await db.selectFrom('companies').select('id').limit(1).execute();
    res.status(200).json({ message: 'Database connection is healthy.' });
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ message: 'Database connection failed', error });
  }
});

app.post('/search', async (req: Request, res: Response) => {
  try {
    const searchParams = req.body;

    let query = db
      .selectFrom('companies')
      .select([
        'companies.id as companyId',
        'companies.name as companyName',
        'companies.location as companyLocation',
        'companies.description as companyDescription',

        sql<string[]>`(SELECT ARRAY_AGG(DISTINCT jobs.title) FROM jobs WHERE jobs.company_id = companies.id)`.as('jobTitles'),
        sql<string[]>`(SELECT ARRAY_AGG(DISTINCT jobs.location) FROM jobs WHERE jobs.company_id = companies.id)`.as('jobLocations'),

        sql<string[]>`(SELECT ARRAY_AGG(DISTINCT founders.full_name) FROM founders WHERE founders.company_id = companies.id)`.as('founderNames'),
        sql<string[]>`(SELECT ARRAY_AGG(DISTINCT founders.linkedin_url) FROM founders WHERE founders.company_id = companies.id)`.as('founderLinkedinUrls')
      ])
      .where('companies.name', 'like', `%${searchParams.companyName}%`)
      .groupBy(['companies.id', 'companies.name', 'companies.location', 'companies.description']);

    if (searchParams.companyName) {
      query = query.where('companies.name', 'like', `%${searchParams.companyName}%`);
    }

    if (searchParams.numJobsMin !== undefined) {
      query = query.having(db.fn.count('jobs.id'), '>=', searchParams.numJobsMin);
    }

    if (searchParams.numJobsMax !== undefined) {
      query = query.having(db.fn.count('jobs.id'), '<=', searchParams.numJobsMax);
    }

    if (searchParams.location) {
      query = query.where('companies.location', 'like', `%${searchParams.location}%`);
    }

    const results = await query.execute();

    res.status(200).json({
      data: results,
      message: 'Query successful',
    });
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
