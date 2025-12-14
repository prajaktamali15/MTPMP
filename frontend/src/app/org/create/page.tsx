'use client';

import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function CreateOrganizationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not logged in
  if (!user) {
    router.push('/auth/login');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate organization creation
    setTimeout(() => {
      // Store organization ID in localStorage
      localStorage.setItem('current_org_id', 'org_' + Date.now());
      setLoading(false);
      // Redirect to dashboard
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h1 className="text-2xl mb-4">Create Organization</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 mb-1">
            Organization Name
          </label>
          <input
            type="text"
            id="orgName"
            placeholder="Enter organization name"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Organization'}
        </button>
      </form>
    </div>
  );
}