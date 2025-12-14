'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function TaskSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [taskTitle, setTaskTitle] = useState('Design homepage');
  const [taskDescription, setTaskDescription] = useState('Create wireframes for homepage');
  const [taskStatus, setTaskStatus] = useState('In Progress');
  const [taskPriority, setTaskPriority] = useState(2);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) router.push('/auth/login');
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate saving task settings
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 1000);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      // Simulate deleting task
      alert('Task deleted successfully');
      router.push('/tasks');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Task Settings</h1>
        <button 
          onClick={() => router.push('/tasks/1')}
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          Back to Task
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Task Details</h2>
        <form onSubmit={handleSave}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title
            </label>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Low</option>
                <option value={2}>Medium</option>
                <option value={3}>High</option>
                <option value={4}>Critical</option>
              </select>
            </div>
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
                Task saved successfully!
              </span>
            )}
          </div>
        </form>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
        <div className="border border-red-200 rounded-lg p-4">
          <h3 className="font-medium mb-2">Delete Task</h3>
          <p className="text-sm text-gray-600 mb-4">
            Once you delete a task, there is no going back. Please be certain.
          </p>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
}