export interface SearchObject {
    companyName: string;
    numJobsMin?: number;
    numJobsMax?: number;
    location?: string;
    founderName?: string;
  }
  
  export interface CompanyResult {
    companyId: number;
    companyName: string;
    companyLocation: string;
    companyDescription?: string;
    jobId?: number;
    jobTitles?: string[];
    jobLocations?: string[];
    founderId?: number;
    founderNames?: string[];
    founderLinkedinUrls?: string[];
  }
  
  export interface JobChartData {
    companyName: string;
    jobCount: number;
  }