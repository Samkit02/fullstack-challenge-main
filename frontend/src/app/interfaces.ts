export interface SearchObject {
  companyName: string;
  numJobsMin?: number;
  numJobsMax?: number;
  location?: string;
  founderName?: string;
}

export interface Founder {
  name: string;
  linkedinUrl: string;
  email: string;
}

export interface CompanyResult {
  companyId: number;
  companyName: string;
  companyLocation: string;
  companyDescription?: string;
  jobTitles?: string[];
  jobLocations?: string[];
  founders?: Founder[];
}

export interface JobChartData {
  companyName: string;
  jobCount: number;
}