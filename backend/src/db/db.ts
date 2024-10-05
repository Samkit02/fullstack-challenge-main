import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

interface Founder {
    id?: number;
    company_id: number;
    full_name: string;
    linkedin_url: string;
    company_domain: string;
    email?: string;
    bounce_status?: string;
}

interface Company {
    id?: number;
    name: string;
    location: string;
    description?: string;
}

interface Job {
    id?: number;
    company_id: number;
    title: string;
    location: string;
    description?: string;
}

interface EmailGrabberCache {
    id?: number;
    founder_name: string;
    linkedin_url: string;
    company_domain: string;
    email: string;
    api_number: number;
    created_at?: Date;
}

interface BounceDetectorCache {
    id?: number;
    email: string;
    bounce_status: string;
    api_number: number;
    created_at?: Date;
}

interface Database {
    founders: Founder;
    companies: Company;
    jobs: Job;
    email_grabber_cache: EmailGrabberCache;
    bounce_detector_cache: BounceDetectorCache;
}

export const pool = new Pool({
    connectionString: "postgres://postgres:S@mkitshah02@localhost:5432/yc_companies",
});

export const db = new Kysely<Database>({
    dialect: new PostgresDialect({ pool }),
});
