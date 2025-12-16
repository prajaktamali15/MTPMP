'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { getData } from '@/lib/api';

interface SearchResult {
  id: number;
  type: 'project' | 'task' | 'member';
  title: string;
  description: string;
  project?: string;
  status?: string;
  role?: string;
}

export default function SearchPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Handle authentication and redirection with useEffect
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    
    try {
      // TODO: Implement real search API endpoint
      // For now, we'll show empty results
      setResults([]);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle unauthenticated state
  if (!user) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Search</h1>
        <button 
          onClick={() => router.push('/dashboard')}
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          Back to Dashboard
        </button>
      </div>
      
      <div className="mb-8">
        <form onSubmit={handleSearch} className="max-w-2xl">
          <div className="flex">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-grow border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search projects, tasks, members..."
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-r-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </div>
      
      {results.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">Search Results ({results.length})</h2>
          </div>
          <ul className="divide-y divide-gray-200">
            {results.map((result) => (
              <li key={result.id} className="hover:bg-gray-50">
                <div className="px-6 py-4">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{result.title}</h3>
                      <p className="text-gray-500">{result.description}</p>
                      {result.project && (
                        <p className="text-sm text-gray-400 mt-1">Project: {result.project}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        result.type === 'project' ? 'bg-blue-100 text-blue-800' :
                        result.type === 'task' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                      </span>
                      {result.status && (
                        <span className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          result.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          result.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {result.status}
                        </span>
                      )}
                      {result.role && (
                        <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {result.role}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <button 
                      onClick={() => {
                        if (result.type === 'project') {
                          router.push(`/projects/${result.id}`);
                        } else if (result.type === 'task') {
                          router.push(`/tasks/${result.id}`);
                        } else {
                          router.push('/org/members');
                        }
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : query && !loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No results found for "{query}"</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Enter a search term to find projects, tasks and members</p>
        </div>
      )}
    </div>
  );
}