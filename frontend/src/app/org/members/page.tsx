"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getData, postData } from "@/lib/api";

export default function OrganizationMembersPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [inviting, setInviting] = useState(false);

  // Handle authentication and redirection with useEffect
  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
    }
  }, [user, router]);

  // Fetch members data
  useEffect(() => {
    if (user) {
      fetchMembers();
    }
  }, [user]);

  const fetchMembers = async () => {
    try {
      // Get organization ID from localStorage
      const orgId = localStorage.getItem('current_org_id');
      if (!orgId) {
        router.push("/dashboard");
        return;
      }
      
      // In a real app, you would fetch members from an API
      // For now, we'll simulate members data
      setMembers([
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'OWNER' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'MEMBER' },
      ]);
    } catch (err: any) {
      setError(err.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setError("");

    try {
      const orgId = localStorage.getItem('current_org_id');
      if (!orgId) {
        throw new Error("No organization selected");
      }
      
      // Create invitation using the API
      const response = await postData('/invitations', { email: inviteEmail, role: inviteRole });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Show success message with the token
      alert(`Invitation created! Share this token with the user: ${response.invitation.token}`);
      
      // Reset form
      setInviteEmail("");
      setInviteRole("MEMBER");
    } catch (err: any) {
      setError(err.message || "Failed to create invitation");
    } finally {
      setInviting(false);
    }
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Loading...</h1>
        <p className="text-lg text-gray-600">Fetching organization members...</p>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => router.push("/dashboard")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Handle unauthenticated state
  if (!user) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button 
          onClick={() => router.push("/dashboard")}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold mb-2">Organization Members</h1>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Invite New Member</h2>
        
        <div className="mb-6 p-4 border rounded">
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="inviteEmail"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded"
                required
              />
            </div>
            
            <div>
              <label htmlFor="inviteRole" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                id="inviteRole"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            
            <button
              type="submit"
              disabled={inviting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {inviting ? "Sending Invitation..." : "Send Invitation"}
            </button>
          </form>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Current Members</h2>
        
        {members.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded">
            <p className="text-gray-500">No members yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{member.name || "Unnamed User"}</h3>
                    <p className="text-gray-600">{member.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {member.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}