'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { getData, postData, putData, deleteData } from '@/lib/api';

export default function OrganizationSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orgName, setOrgName] = useState('');
  const [orgDescription, setOrgDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [orgId, setOrgId] = useState('');
  const [hasOrg, setHasOrg] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) router.push('/auth/login');
  }, [user]);

  // Load organization data
  useEffect(() => {
    if (user) {
      loadOrganization();
    }
  }, [user]);

  const loadOrganization = async () => {
    try {
      const orgs = await getData('/organizations');
      if (orgs && orgs.length > 0) {
        const org = orgs[0];
        setOrgId(org.id);
        setOrgName(org.name || '');
        // Note: Description field doesn't exist in the current schema
        setOrgDescription('');
        setHasOrg(true);
      } else {
        // User doesn't have an organization
        setHasOrg(false);
      }
    } catch (err) {
      console.error('Failed to load organization:', err);
      setError('Failed to load organization data');
    }
  };

  // Redirect to create org page if user doesn't have an organization
  useEffect(() => {
    if (user && !hasOrg) {
      router.push('/org/create');
    }
  }, [user, hasOrg, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Update organization using PUT method
      await putData(`/organizations/${orgId}`, { name: orgName });
      
      setLoading(false);
      setSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Failed to save organization settings:', err);
      setError(err.message || 'Failed to save organization settings');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this organization? This action cannot be undone and will delete all projects, tasks, and data associated with this organization.')) {
      try {
        // Delete organization using DELETE method
        await deleteData(`/organizations/${orgId}`);
        // Remove organization ID from localStorage
        localStorage.removeItem('current_org_id');
        router.push('/org/create');
      } catch (err) {
        console.error('Failed to delete organization:', err);
        alert('Failed to delete organization. Please try again.');
      }
    }
  };

  if (!user || !hasOrg) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Organization Settings</h1>
        <button 
          onClick={() => router.push('/dashboard')}
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          Back to Dashboard
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">General Settings</h2>
        <form onSubmit={handleSave}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Name
            </label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={orgDescription}
              onChange={(e) => setOrgDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              disabled
              placeholder="Description field not available in current schema"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            
            {success && (
              <span className="text-green-600">
                Settings saved successfully!
              </span>
            )}
          </div>
        </form>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Members & Invitations</h2>
        <div className="border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-4">
            Manage your organization members and send invitations to new members.
          </p>
          <button
            onClick={() => router.push('/org/members')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
          >
            Manage Members
          </button>
          <button
            onClick={() => router.push('/invitations/send')}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Send Invitation
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
        <div className="border border-red-200 rounded-lg p-4">
          <h3 className="font-medium mb-2">Delete Organization</h3>
          <p className="text-sm text-gray-600 mb-4">
            Once you delete an organization, there is no going back. All projects, tasks and data will be permanently deleted.
          </p>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Delete Organization
          </button>
        </div>
      </div>
    </div>
  );
}