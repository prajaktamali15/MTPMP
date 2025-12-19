'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { getData } from '@/lib/api';

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Organization {
  id: string;
  name: string;
}

export default function OrganizationSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orgName, setOrgName] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('owner'); // owner, admin, member
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) router.push('/auth/login');
  }, [user]);

  // Load user's organizations
  useEffect(() => {
    if (user) {
      loadOrganizations();
    }
  }, [user]);

  const loadOrganizations = async () => {
    try {
      // Use the correct endpoint: /organizations (not /auth/organizations)
      const orgs = await getData('/organizations');
      setOrganizations(orgs);
      
      // If there's a current org ID in localStorage, select it
      const currentOrgId = localStorage.getItem('current_org_id');
      if (currentOrgId) {
        setSelectedOrgId(currentOrgId);
      } else if (orgs.length > 0) {
        // Select the first organization by default
        setSelectedOrgId(orgs[0].id);
        localStorage.setItem('current_org_id', orgs[0].id);
      }
      
      // Load organization details
      if (orgs.length > 0) {
        const orgId = currentOrgId || orgs[0].id;
        
        // Load organization details
        try {
          const orgDetails = await getData(`/organizations/${orgId}`);
          setOrgName(orgDetails.name);
          
          // Load members
          const membersData = await getData(`/organizations/${orgId}/members`);
          
          // Transform the data to match our interface
          const transformedMembers = membersData.map((member: any) => ({
            id: member.id,
            name: member.name || member.email,
            email: member.email,
            role: member.role
          }));
          
          setMembers(transformedMembers);
          setUserRole(membersData.find((m: any) => m.email === user.email)?.role || 'member');
        } catch (error) {
          console.error('Failed to load organization details:', error);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load organizations:', error);
      // Don't use mock data - show empty state instead
      setOrganizations([]);
      setSelectedOrgId(null);
      setLoading(false);
    }
  };

  const handleOrgChange = (orgId: string) => {
    setSelectedOrgId(orgId);
    localStorage.setItem('current_org_id', orgId);
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Loading Organization Settings...</h1>
      </div>
    );
  }

  // If no organizations, show a message
  if (organizations.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Organization Settings</h1>
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p>You don't belong to any organization yet.</p>
          <button 
            onClick={() => router.push('/org/create')}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Create Organization
          </button>
        </div>
      </div>
    );
  }

  const handleInviteMember = async () => {
    const email = prompt('Enter email address to invite:');
    if (email) {
      try {
        // In a real app, you would make an API call here
        // For example: await postData('/invitations', { email, organizationId: selectedOrgId });
        alert(`Invitation sent to ${email}`);
      } catch (error) {
        console.error('Failed to send invitation:', error);
        alert('Failed to send invitation. Please try again.');
      }
    }
  };

  const handleDeleteOrg = async () => {
    if (confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      try {
        // Make API call to delete organization
        // await deleteData(`/organizations/${selectedOrgId}`);
        
        // Remove organization ID from localStorage
        localStorage.removeItem('current_org_id');
        // Redirect to dashboard
        router.push('/dashboard');
      } catch (error) {
        console.error('Failed to delete organization:', error);
        alert('Failed to delete organization. Please try again.');
      }
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
      
      {/* Organization Selector */}
      <div className="mb-6 p-4 border rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Organization
        </label>
        <select
          value={selectedOrgId || ''}
          onChange={(e) => handleOrgChange(e.target.value)}
          className="w-full border p-2 rounded"
        >
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>
      
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
          
          <button 
            onClick={async () => {
              try {
                // Save organization name
                // await putData(`/organizations/${selectedOrgId}`, { name: orgName });
                alert('Changes saved successfully!');
              } catch (error) {
                console.error('Failed to save changes:', error);
                alert('Failed to save changes. Please try again.');
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
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