'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { getData } from '@/lib/api';

interface ActivityLog {
  id: number;
  user: string;
  action: string;
  target: string;
  timestamp: string;
}

// Add Member interface
interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasOrg, setHasOrg] = useState(false);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [memberCount, setMemberCount] = useState<number>(0);
  const [projectCount, setProjectCount] = useState<number>(0);
  const [taskCount, setTaskCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Check if user has organization and fetch real data
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setError(null);
      
      // Check if user has an organization
      const orgs = await getData('/organizations');
      const orgExists = orgs && orgs.length > 0;
      setHasOrg(!!orgExists);
      
      // If no organization, don't redirect automatically - let user decide
      if (!orgExists) {
        // Just update state, don't redirect
        return;
      }
      
      if (orgExists) {
        // Get the organization ID from the response
        const orgId = orgs[0].id;
        // Make sure the organization ID is set in localStorage
        localStorage.setItem('current_org_id', orgId);
        
        // Fetch real activity logs
        try {
          const activityLogsData = await getData('/activity-logs');
          console.log('Activity logs data:', activityLogsData);
          // Transform the data to match our interface
          const transformedLogs = activityLogsData.slice(0, 5).map((log: any) => ({
            id: log.id,
            user: log.user?.name || 'Unknown User',
            action: log.action,
            target: log.project?.name || log.task?.title || 'Unknown Target',
            timestamp: getTimeAgo(new Date(log.createdAt))
          }));
          setActivityLogs(transformedLogs);
        } catch (activityError) {
          console.error('Failed to load activity logs:', activityError);
          setError('Failed to load activity logs');
          setActivityLogs([]);
        }
        
        // Fetch counts
        try {
          const membersData = await getData(`/organizations/${orgId}/members`);
          setMemberCount(membersData.length);
          
          const projectsData = await getData('/projects');
          setProjectCount(projectsData.length);
          
          const tasksData = await getData('/tasks');
          setTaskCount(tasksData.length);
        } catch (error) {
          console.error('Failed to load counts data:', error);
          setError('Failed to load dashboard data');
          setMemberCount(0);
          setProjectCount(0);
          setTaskCount(0);
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data');
      setActivityLogs([]);
      setMemberCount(0);
      setProjectCount(0);
      setTaskCount(0);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Loading...</h1>
        <p className="text-lg text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  if (!hasOrg) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
        <h1 className="text-2xl mb-4">Create Your Organization</h1>
        <p className="text-gray-600 mb-6">
          You don't belong to any organization yet. Create one to get started.
        </p>
        <button 
          onClick={() => router.push('/org/create')}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Create Organization
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Organization Dashboard</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => router.push('/projects')}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            All Projects
          </button>
          <button 
            onClick={() => router.push('/org/settings')}
            className="bg-gray-600 text-white px-4 py-2 rounded"
          >
            Organization Settings
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      <p className="text-lg text-gray-600 mb-6">
        Welcome to your organization dashboard.
      </p>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="border rounded-lg p-4 bg-white shadow">
          <h3 className="font-semibold text-lg mb-2">Projects</h3>
          <p className="text-3xl font-bold text-blue-600">{projectCount}</p>
          <p className="text-sm text-gray-500">Active Projects</p>
          <button 
            onClick={() => router.push('/projects')}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            View All
          </button>
        </div>
        
        <div className="border rounded-lg p-4 bg-white shadow">
          <h3 className="font-semibold text-lg mb-2">Tasks</h3>
          <p className="text-3xl font-bold text-green-600">{taskCount}</p>
          <p className="text-sm text-gray-500">Open Tasks</p>
          <button 
            onClick={() => router.push('/tasks')}
            className="mt-2 text-green-600 hover:text-green-800 text-sm"
          >
            View All
          </button>
        </div>
        
        <div className="border rounded-lg p-4 bg-white shadow">
          <h3 className="font-semibold text-lg mb-2">Members</h3>
          <p className="text-3xl font-bold text-purple-600">{memberCount}</p>
          <p className="text-sm text-gray-500">Team Members</p>
          <button 
            onClick={() => router.push('/org/members')}
            className="mt-2 text-purple-600 hover:text-purple-800 text-sm"
          >
            Manage
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Log - taking full width now */}
        <div className="border rounded-lg p-4 lg:col-span-3">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-2">
            {activityLogs.map((log) => (
              <div key={log.id} className="border-b pb-2 last:border-b-0">
                <p className="text-sm">
                  <span className="font-medium">{log.user}</span> {log.action} <span className="font-medium">{log.target}</span> • {log.timestamp}
                </p>
              </div>
            ))}
            {activityLogs.length === 0 && !error && (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate time ago
const getTimeAgo = (date: Date) => {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
};