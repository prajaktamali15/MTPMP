'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

interface ActivityLog {
  id: number;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  details: string;
}

export default function ActivityLogsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) router.push('/auth/login');
  }, [user]);

  // Load activity logs
  useEffect(() => {
    if (user) {
      // Simulate loading activity logs
      setTimeout(() => {
        setLogs([
          { id: 1, user: 'John Doe', action: 'created', target: 'Project Website Redesign', timestamp: '2025-12-14 10:30 AM', details: 'Created new project with initial setup' },
          { id: 2, user: 'Jane Smith', action: 'updated', target: 'Task Design homepage', timestamp: '2025-12-14 02:15 PM', details: 'Changed task status to In Progress' },
          { id: 3, user: 'Bob Johnson', action: 'commented on', target: 'Task Setup database', timestamp: '2025-12-13 11:45 AM', details: 'Added comment about database schema' },
          { id: 4, user: 'Alice Brown', action: 'completed', target: 'Task Write documentation', timestamp: '2025-12-12 04:20 PM', details: 'Marked task as completed after review' },
          { id: 5, user: 'You', action: 'assigned', target: 'Task Review design', timestamp: '2025-12-12 09:30 AM', details: 'Assigned task to John Doe for review' },
          { id: 6, user: 'John Doe', action: 'created', target: 'Project Mobile App', timestamp: '2025-12-11 03:15 PM', details: 'Created new mobile application project' },
          { id: 7, user: 'Jane Smith', action: 'deleted', target: 'Task Old cleanup', timestamp: '2025-12-11 10:45 AM', details: 'Removed obsolete task from project' },
          { id: 8, user: 'Bob Johnson', action: 'uploaded', target: 'File design_mockup.pdf', timestamp: '2025-12-10 02:30 PM', details: 'Uploaded design mockup for review' }
        ]);
        setLoading(false);
      }, 500);
    }
  }, [user]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Loading Activity Logs...</h1>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Activity Logs</h1>
        <button 
          onClick={() => router.push('/dashboard')}
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          Back to Dashboard
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{log.user}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{log.action}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{log.target}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{log.timestamp}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{log.details}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}