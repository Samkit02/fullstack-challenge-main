'use client';

import { useState } from 'react';
import SearchForm from './form';
import { SearchObject, CompanyResult } from '../interfaces';
import dotenv from 'dotenv';

dotenv.config();

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
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <SearchForm onSearch={handleSearch} />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    {loading && (
                        <div className="flex justify-center mt-8">
                            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
                        </div>
                    )}

                    {!loading && results && results.length > 0 ? (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-700 mb-6">Search Results</h2>
                            <div className="grid gap-8">
                                {results.map((company: CompanyResult, idx: number) => (
                                    <div key={idx} className="bg-white shadow-lg rounded-lg p-6">

                                        <div className="mb-4">
                                            <h3 className="text-2xl font-bold text-gray-800">{company.companyName}</h3>
                                            <p className="text-gray-500">{company.companyLocation}</p>
                                            <p className="mt-2 text-gray-600">{company.companyDescription}</p>
                                        </div>


                                        <div className="border-t border-gray-200 my-4"></div>


                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-700 mb-3">Founders</h4>
                                                <ul className="space-y-2">
                                                    {Array.isArray(company.founderNames) && company.founderNames.length > 0 ? (
                                                        company.founderNames.map((name: string, i: number) => (
                                                            <li key={i} className="flex items-center">
                                                                <strong className="text-gray-800">{name}</strong> -{' '}
                                                                {company.founderLinkedinUrls && company.founderLinkedinUrls[i] ? (
                                                                    <a
                                                                        href={company.founderLinkedinUrls[i]}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-blue-600 hover:underline ml-1"
                                                                    >
                                                                        LinkedIn
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-gray-400 ml-1">No LinkedIn</span>
                                                                )}
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <p className="text-gray-400">No founder information available</p>
                                                    )}
                                                </ul>
                                            </div>

                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-700 mb-3">Jobs</h4>
                                                <ul className="space-y-2">
                                                    {Array.isArray(company.jobTitles) && company.jobTitles.length > 0 ? (
                                                        company.jobTitles.map((title: string, i: number) => (
                                                            <li key={i}>
                                                                <strong className="text-gray-800">{title}</strong> -{' '}
                                                                {company.jobLocations && company.jobLocations[i] ? (
                                                                    <span className="text-gray-600">{company.jobLocations[i]}</span>
                                                                ) : (
                                                                    <span className="text-gray-400">Unknown Location</span>
                                                                )}
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <p className="text-gray-400">No jobs available</p>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : !loading && results && results.length === 0 ? (
                        <p className="mt-8 text-center text-black-500">No companies found.</p>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default SearchResults;