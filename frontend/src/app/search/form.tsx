'use client';

import { useState } from 'react';
import { SearchObject } from '../interfaces';

interface SearchFormProps {
    onSearch: (searchObject: SearchObject) => void;
}

const SearchForm = ({ onSearch }: SearchFormProps) => {
    const [companyName, setCompanyName] = useState('');
    // const [numJobsMin, setNumJobsMin] = useState<number | ''>('');
    // const [numJobsMax, setNumJobsMax] = useState<number | ''>('');
    // const [location, setLocation] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch({
            companyName,
            // numJobsMin: numJobsMin !== '' ? Number(numJobsMin) : undefined,
            // numJobsMax: numJobsMax !== '' ? Number(numJobsMax) : undefined,
            // location,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-100 p-6 rounded-lg shadow-md space-y-4">
            <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
                <input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                />
            </div>
            {/* <div>
                <label htmlFor="numJobsMin" className="block text-sm font-medium text-gray-700">Min Jobs</label>
                <input
                    id="numJobsMin"
                    type="number"
                    value={numJobsMin}
                    onChange={(e) => setNumJobsMin(e.target.value === '' ? '' : Number(e.target.value))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
            <div>
                <label htmlFor="numJobsMax" className="block text-sm font-medium text-gray-700">Max Jobs</label>
                <input
                    id="numJobsMax"
                    type="number"
                    value={numJobsMax}
                    onChange={(e) => setNumJobsMax(e.target.value === '' ? '' : Number(e.target.value))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
            <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div> */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Search
                </button>
            </div>
        </form>
    );
};

export default SearchForm;
