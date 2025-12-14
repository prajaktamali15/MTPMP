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
}

interface Project {
  id: number;
  name: string;
  description: string;
  tasks: number;
}

interface Task {
  id: number;
  title: string;
  status: string;
  project: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [hasOrg, setHasOrg] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [userRole, setUserRole] = useState('member'); // member, admin, owner

  // Redirect if not logged in
  useEffect(() => {
    if (!user) router.push('/auth/login');
  }, [user]);

  // Check if user has organization
  useEffect(() => {
    if (user) {
      // For now, we'll simulate checking for organization
      // In a real app, you would make an API call here
      setTimeout(() => {
        // Simulate checking for organization
        const orgExists = localStorage.getItem('current_org_id');
        setHasOrg(!!orgExists);
        
        // Simulate loading activity logs
        setActivityLogs([
          { id: 1, user: 'John Doe', action: 'created', target: 'Project Website Redesign', timestamp: '2 hours ago' },
          { id: 2, user: 'Jane Smith', action: 'updated', target: 'Task Design homepage', timestamp: '4 hours ago' },
          { id: 3, user: 'Bob Johnson', action: 'commented on', target: 'Task Setup database', timestamp: '1 day ago' },
          { id: 4, user: 'Alice Brown', action: 'completed', target: 'Task Write documentation', timestamp: '2 days ago' },
          { id: 5, user: 'You', action: 'assigned', target: 'Task Review design', timestamp: '3 days ago' }
        ]);
        
        // Simulate loading recent projects
        setRecentProjects([
          { id: 1, name: 'Website Redesign', description: 'Redesign company website', tasks: 12 },
          { id: 2, name: 'Mobile App', description: 'Develop mobile application', tasks: 8 },
          { id: 3, name: 'Marketing Campaign', description: 'Plan marketing campaign', tasks: 5 }
        ]);
        
        // Simulate loading recent tasks
        setRecentTasks([
          { id: 1, title: 'Design homepage', status: 'In Progress', project: 'Website Redesign' },
          { id: 2, title: 'Setup database', status: 'Completed', project: 'Mobile App' },
          { id: 3, title: 'Create wireframes', status: 'Pending', project: 'Website Redesign' },
          { id: 4, title: 'Write copy', status: 'Pending', project: 'Marketing Campaign' }
        ]);
        
        setLoading(false);
      }, 500);
    }
  }, [user]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Loading...</h1>
        <p className="text-lg text-gray-600">Checking your organization status...</p>
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
      
      <p className="text-lg text-gray-600 mb-6">
        Welcome to your organization! Here you can manage projects and tasks.
      </p>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="border rounded-lg p-4 bg-white shadow">
          <h3 className="font-semibold text-lg mb-2">Projects</h3>
          <p className="text-3xl font-bold text-blue-600">{recentProjects.length}</p>
          <p className="text-sm text-gray-500">Total Projects</p>
          <button 
            onClick={() => router.push('/projects')}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            View All
          </button>
        </div>
        
        <div className="border rounded-lg p-4 bg-white shadow">
          <h3 className="font-semibold text-lg mb-2">Tasks</h3>
          <p className="text-3xl font-bold text-green-600">{recentTasks.length}</p>
          <p className="text-sm text-gray-500">Total Tasks</p>
          <button 
            onClick={() => router.push('/tasks')}
            className="mt-2 text-green-600 hover:text-green-800 text-sm"
          >
            View All
          </button>
        </div>
        
        <div className="border rounded-lg p-4 bg-white shadow">
          <h3 className="font-semibold text-lg mb-2">Members</h3>
          <p className="text-3xl font-bold text-purple-600">12</p>
          <p className="text-sm text-gray-500">Team Members</p>
          <button 
            onClick={() => router.push('/org/members')}
            className="mt-2 text-purple-600 hover:text-purple-800 text-sm"
          >
            Manage
          </button>
        </div>
        
        <div className="border rounded-lg p-4 bg-white shadow">
          <h3 className="font-semibold text-lg mb-2">Create</h3>
          <div className="flex flex-col space-y-2 mt-2">
            <button 
              onClick={() => router.push('/projects')}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm hover:bg-blue-200"
            >
              + Project
            </button>
            <button 
              onClick={() => router.push('/tasks')}
              className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm hover:bg-green-200"
            >
              + Task
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Projects</h2>
            <button 
              onClick={() => router.push('/projects')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentProjects.map((project) => (
              <div key={project.id} className="border-b pb-3 last:border-b-0">
                <div className="flex justify-between">
                  <h3 className="font-medium">{project.name}</h3>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                    {project.tasks} tasks
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                <button 
                  onClick={() => router.push(`/projects/${project.id}`)}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent Tasks */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Tasks</h2>
            <button 
              onClick={() => router.push('/tasks')}
              className="text-green-600 hover:text-green-800 text-sm"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div key={task.id} className="border-b pb-3 last:border-b-0">
                <div className="flex justify-between">
                  <h3 className="font-medium">{task.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    task.status === 'Completed' ? 'bg-green-200' :
                    task.status === 'In Progress' ? 'bg-yellow-200' : 'bg-gray-200'
                  }`}>
                    {task.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Project: {task.project}</p>
                <button 
                  onClick={() => router.push(`/tasks/${task.id}`)}
                  className="mt-2 text-green-600 hover:text-green-800 text-sm"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Activity Logs */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <button 
              onClick={() => router.push('/activity/logs')}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {activityLogs.map((log) => (
              <div key={log.id} className="border-b pb-3 last:border-b-0">
                <p className="text-sm">
                  <span className="font-medium">{log.user}</span> {log.action} <span className="font-medium">{log.target}</span>
                </p>
                <p className="text-xs text-gray-500">{log.timestamp}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Additional Quick Links */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4 bg-white shadow">
          <h3 className="font-semibold text-lg mb-2">Files</h3>
          <p className="text-sm text-gray-600 mb-3">Manage project files</p>
          <button 
            onClick={() => router.push('/files')}
            className="bg-indigo-600 text-white px-3 py-1 rounded text-sm"
          >
            View Files
          </button>
        </div>
        
        <div className="border rounded-lg p-4 bg-white shadow">
          <h3 className="font-semibold text-lg mb-2">Comments</h3>
          <p className="text-sm text-gray-600 mb-3">View all comments</p>
          <button 
            onClick={() => router.push('/comments')}
            className="bg-teal-600 text-white px-3 py-1 rounded text-sm"
          >
            View Comments
          </button>
        </div>
        
        <div className="border rounded-lg p-4 bg-white shadow">
          <h3 className="font-semibold text-lg mb-2">Subtasks</h3>
          <p className="text-sm text-gray-600 mb-3">Manage subtasks</p>
          <button 
            onClick={() => router.push('/subtasks')}
            className="bg-amber-600 text-white px-3 py-1 rounded text-sm"
          >
            View Subtasks
          </button>
        </div>
        
        <div className="border rounded-lg p-4 bg-white shadow">
          <h3 className="font-semibold text-lg mb-2">Search</h3>
          <p className="text-sm text-gray-600 mb-3">Find anything</p>
          <button 
            onClick={() => router.push('/search/search')}
            className="bg-gray-600 text-white px-3 py-1 rounded text-sm"
          >
            Search
          </button>
        </div>
      </div>
      
      {/* Role-based Actions */}
      <div className="mt-8 border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Team Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(userRole === 'admin' || userRole === 'owner') && (
            <>
              <div className="border rounded p-3">
                <h3 className="font-medium mb-2">Invite Members</h3>
                <p className="text-sm text-gray-600 mb-3">Send invitations to team members</p>
                <button 
                  onClick={() => router.push('/invitations/send')}
                  className="bg-purple-600 text-white px-3 py-1 rounded text-sm"
                >
                  Send Invite
                </button>
              </div>
              
              <div className="border rounded p-3">
                <h3 className="font-medium mb-2">Manage Roles</h3>
                <p className="text-sm text-gray-600 mb-3">Assign roles and permissions</p>
                <button 
                  onClick={() => router.push('/org/members')}
                  className="bg-indigo-600 text-white px-3 py-1 rounded text-sm"
                >
                  Manage Roles
                </button>
              </div>
            </>
          )}
          
          <div className="border rounded p-3">
            <h3 className="font-medium mb-2">Settings</h3>
            <p className="text-sm text-gray-600 mb-3">Organization configuration</p>
            <button 
              onClick={() => router.push('/org/settings')}
              className="bg-gray-600 text-white px-3 py-1 rounded text-sm"
            >
              Org Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}