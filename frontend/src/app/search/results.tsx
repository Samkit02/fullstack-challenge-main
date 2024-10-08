'use client';

import { useState } from 'react';
import SearchForm from './form';
import { SearchObject, CompanyResult } from '../interfaces';
import dotenv from 'dotenv';

dotenv.config();

const SearchResults = () => {
    const [results, setResults] = useState<CompanyResult[] | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (searchObject: SearchObject) => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:4000/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': "OU+oS+nWlDhE0yW6CyvXnCKzqBMsyoTSgzQ+F46siDQ=",
                },
                body: JSON.stringify(searchObject),
            });

            if (!res.ok) {
                throw new Error('Failed to fetch data');
            }

            const data = (await res.json()) as { data: CompanyResult[] };
            setResults(data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-2 gap-8 p-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">YC Company and Job Search</h2>
                <SearchForm onSearch={handleSearch} />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                {loading && <p>Loading...</p>}
                {results && results.length > 0 ? (
                    <div className="space-y-6">
                        {results.map((company: CompanyResult, idx: number) => (
                            <div key={idx} className="mb-6">
                                <h3 className="text-xl font-bold">{company.companyName}</h3>
                                <p className="text-gray-600">Location: {company.companyLocation}</p>

                                <div>
                                    <h4 className="text-lg font-semibold mt-4">Founders</h4>
                                    <ul>
                                        {Array.isArray(company.founders) && company.founders.length > 0 ? (
                                            company.founders.map((founder, i: number) => (
                                                <li key={i}>
                                                    <strong>{founder.name}</strong> - {founder.linkedinUrl ? (
                                                        <a href={founder.linkedinUrl} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                                                    ) : (
                                                        'No LinkedIn URL'
                                                    )}
                                                    <br />
                                                    {founder.email ? (
                                                        <span>Email: {founder.email}</span>
                                                    ) : (
                                                        <span>No email available</span>
                                                    )}
                                                </li>
                                            ))
                                        ) : (
                                            <p>No founder information available</p>
                                        )}
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="text-lg font-semibold mt-4">Jobs</h4>
                                    <ul>
                                        {Array.isArray(company.jobTitles) && company.jobTitles.length > 0 ? (
                                            company.jobTitles.map((title: string, i: number) => (
                                                <li key={i}>
                                                    <strong>{title}</strong> - {company.jobLocations && company.jobLocations[i] ? (
                                                        company.jobLocations[i]
                                                    ) : (
                                                        'Unknown Location'
                                                    )}
                                                </li>
                                            ))
                                        ) : (
                                            <li>No jobs available</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No companies found.</p>
                )}
            </div>
        </div>
    );
};

export default SearchResults;
