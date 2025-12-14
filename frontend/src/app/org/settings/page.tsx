'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function OrganizationSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orgName, setOrgName] = useState('My Organization');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('owner'); // owner, admin, member

  // Redirect if not logged in
  useEffect(() => {
    if (!user) router.push('/auth/login');
  }, [user]);

  // Load organization details
  useEffect(() => {
    if (user) {
      // Simulate loading organization data
      setTimeout(() => {
        setMembers([
          { id: 1, name: 'John Doe', email: 'john@example.com', role: 'owner' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin' },
          { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'member' },
          { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'member' }
        ]);
        setLoading(false);
      }, 500);
    }
  }, [user]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Loading Organization Settings...</h1>
      </div>
    );
  }

  const handleInviteMember = () => {
    const email = prompt('Enter email address to invite:');
    if (email) {
      alert(`Invitation sent to ${email}`);
      // In a real app, you would make an API call here
    }
  };

  const handleDeleteOrg = () => {
    if (confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      // Remove organization ID from localStorage
      localStorage.removeItem('current_org_id');
      // Redirect to dashboard
      router.push('/dashboard');
    }
  };

  return (
    <div className="p-6">
      <button 
        onClick={() => router.push('/dashboard')}
        className="mb-4 text-blue-600"
      >
        ← Back to Dashboard
      </button>
      
      <h1 className="text-3xl font-bold mb-6">Organization Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Organization Details */}
        <div className="border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Organization Details</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization Name
            </label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Save Changes
          </button>
        </div>
        
        {/* Member Management */}
        <div className="border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Members</h2>
            {(userRole === 'owner' || userRole === 'admin') && (
              <button 
                onClick={handleInviteMember}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                Invite Member
              </button>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border">Name</th>
                  <th className="py-2 px-4 border">Email</th>
                  <th className="py-2 px-4 border">Role</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id}>
                    <td className="py-2 px-4 border">{member.name}</td>
                    <td className="py-2 px-4 border">{member.email}</td>
                    <td className="py-2 px-4 border">
                      <span className="px-2 py-1 rounded bg-gray-200">
                        {member.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Danger Zone - Only for Owners */}
      {userRole === 'owner' && (
        <div className="border border-red-300 rounded-lg p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-red-600">Danger Zone</h2>
          <p className="text-gray-600 mb-4">
            Deleting your organization will permanently remove all projects, tasks, and data.
          </p>
          <button 
            onClick={handleDeleteOrg}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Delete Organization
          </button>
        </div>
      )}
    </div>
  );
}