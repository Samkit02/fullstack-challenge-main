# Backend starter code

This contains the skeleton of an Express server using TypeScript. You should build on this for the challenge.

We've included some useful NPM libraries in the `package.json` file. We recommend you use them; feel free to install other packages as needed.

# Project Overview
This backend application is designed to scrape data from various sources, process it using workers, and store it in a PostgreSQL database. It provides APIs for querying the stored data (such as companies, jobs, and founders) with optional filters for company location and job numbers. The backend communicates with a Redis server for managing job queues and supports asynchronous processing via workers.

Features:
- Data Scraping: Scrapes job data, founders info, and company details.
- Job Processing: Uses a worker to process background tasks, such as fetching emails and bounce detection.
- Database Integration: Stores data in PostgreSQL.
- API: Provides endpoints to query company and job data.
- Redis: Manages job queues for asynchronous tasks.

Installation

Clone the repository:
```console 
git clone https://github.com/your-repo/backend.git
```

Navigate to the project folder:
```console
cd backend
```

Install all dependencies:
```console
npm install
```

Change the path of .pem file in db.ts.
I have added the file in root, after cloning the project just change the location of .pem file in backend/src/db/db.ts

Running the Application
1. Install Redis Server and Run the Worker
The worker processes background jobs (like email grabbing and bounce detection) using Redis-based queues.
Make sure redis is downloaded.

To install the redis:
```console
brew install redis
```

To run the worker:
```console
npm run worker
```

2. Run the local server on port 4000
```console
npm run start
```  

3. Scraping Companies
The scrapeCompanies.js file is used to scrape company data from external websites (such as YCombinator and WorkAtAStartup) and store them in the PostgreSQL database.

To run the scrapeCompanies.js script:
1. Ensure PostgreSQL, Redis, and the server are running:
    - PostgreSQL: Your database must be running to store scraped data.
    - Redis: Redis must be running as the scraper may enqueue some tasks.
    - Server: The Express server must be running (optional for scraping).
    
    
2. Run the scraper:
    In your terminal, run:
    ```console
    npm run setup
    ```
    This script will:
        - Scrape companies from the YC companies page.
        - Fetch job postings from WorkAtAStartup.
        - Insert scraped data (companies, jobs, and founders) into the PostgreSQL database.

Example output:
You should see logs like the following if the scraping process works successfully:
```console
Found company: Deel, Link: https://workatastartup.com/companies/deel
Found job: Senior Accountant, Location: Remote
Finished scraping founders for Deel
```
