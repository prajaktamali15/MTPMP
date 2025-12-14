'use client';

import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function SendInvitationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect if not logged in
  if (!user) {
    router.push('/auth/login');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate sending invitation
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setMessage(`Invitation sent to ${email} with ${role} role.`);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setEmail('');
        setRole('member');
        setSuccess(false);
        setMessage('');
      }, 3000);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Send Invitation</h1>
        <button 
          onClick={() => router.push('/dashboard')}
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          Back to Dashboard
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="colleague@example.com"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Owner has full access, Admin can manage projects and members, Member can only view and comment.
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personal Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Add a personal message to your invitation..."
            />
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push('/org/members')}
              className="text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
        
        {success && (
          <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <p>{message}</p>
          </div>
        )}
      </div>
      
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Pending Invitations</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-white rounded border">
            <div>
              <p className="font-medium">john.doe@example.com</p>
              <p className="text-sm text-gray-500">Sent 2 days ago</p>
            </div>
            <div className="flex space-x-2">
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">Pending</span>
              <button className="text-red-600 hover:text-red-800 text-sm">Resend</button>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-white rounded border">
            <div>
              <p className="font-medium">jane.smith@example.com</p>
              <p className="text-sm text-gray-500">Sent 1 week ago</p>
            </div>
            <div className="flex space-x-2">
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">Pending</span>
              <button className="text-red-600 hover:text-red-800 text-sm">Resend</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}