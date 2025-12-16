'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getData, deleteData } from '@/lib/api';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function OrganizationMembersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not logged in
  if (!user) {
    router.push('/auth/login');
    return null;
  }

  // Load members
  useEffect(() => {
    if (user) {
      loadMembers();
    }
  }, [user]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      
      // Get current organization ID from localStorage
      const orgId = localStorage.getItem('current_org_id');
      if (!orgId) {
        throw new Error('No organization found');
      }

      // Load real members data
      const membersData = await getData(`/organizations/${orgId}/members`);
      setMembers(membersData || []);
    } catch (err: any) {
      console.error('Failed to load members:', err);
      setError(err.message || 'Failed to load members');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from the organization?`)) {
      try {
        // Get current organization ID from localStorage
        const orgId = localStorage.getItem('current_org_id');
        if (!orgId) {
          throw new Error('No organization found');
        }

        // Call the remove member API
        await deleteData(`/organizations/${orgId}/members/${id}`);
        
        // Show success message
        alert(`${name} has been removed from the organization.`);
        
        // Refresh the member list
        loadMembers();
      } catch (err: any) {
        console.error('Failed to remove member:', err);
        alert(err.message || 'Failed to remove member');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Loading...</h1>
        <p className="text-lg text-gray-600">Loading organization members...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Organization Members</h1>
        <button 
          onClick={() => router.push('/invitations/send')}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Invite Members
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>{error}</p>
        </div>
      )}
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Members</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No members found
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{member.name || 'Unnamed User'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.role !== 'OWNER' && (
                        <button
                          onClick={() => handleRemoveMember(member.id, member.name || member.email)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}