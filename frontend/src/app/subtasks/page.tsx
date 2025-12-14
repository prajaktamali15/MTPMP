'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getData, postData } from '@/lib/api';

interface Subtask {
  id: number;
  title: string;
  status: string;
  taskId: number;
  createdAt: string;
}

export default function SubtasksPage() {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSubtask, setNewSubtask] = useState({ title: '', taskId: '' });
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const loadSubtasks = async () => {
      try {
        setLoading(true);
        const data = await getData('/subtasks');
        setSubtasks(data);
      } catch (error) {
        console.error('Failed to load subtasks:', error);
        // Fallback to mock data
        setSubtasks([
          { id: 1, title: 'Create wireframes', status: 'Completed', taskId: 1, createdAt: '2025-12-01' },
          { id: 2, title: 'Design color palette', status: 'In Progress', taskId: 1, createdAt: '2025-12-02' },
          { id: 3, title: 'Select fonts', status: 'Pending', taskId: 1, createdAt: '2025-12-03' },
          { id: 4, title: 'Setup tables', status: 'Completed', taskId: 2, createdAt: '2025-12-05' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadSubtasks();
  }, [user, router]);

  const handleCreateSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.title || !newSubtask.taskId) return;

    try {
      const subtaskData = {
        title: newSubtask.title,
        taskId: parseInt(newSubtask.taskId),
        status: 'Pending'
      };

      const createdSubtask = await postData('/subtasks', subtaskData);
      
      // Add to local state
      setSubtasks([...subtasks, createdSubtask]);
      
      // Reset form
      setNewSubtask({ title: '', taskId: '' });
    } catch (error) {
      console.error('Failed to create subtask:', error);
      alert('Failed to create subtask');
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Loading Subtasks...</h1>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Subtasks</h1>
        <button 
          onClick={() => router.push('/dashboard')}
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          Back to Dashboard
        </button>
      </div>
      
      {/* Create Subtask Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New Subtask</h2>
        <form onSubmit={handleCreateSubtask} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={newSubtask.title}
              onChange={(e) => setNewSubtask({...newSubtask, title: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter subtask title"
              required
            />
          </div>
          <div>
            <label htmlFor="taskId" className="block text-sm font-medium text-gray-700 mb-1">
              Task ID
            </label>
            <input
              type="number"
              id="taskId"
              value={newSubtask.taskId}
              onChange={(e) => setNewSubtask({...newSubtask, taskId: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task ID"
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create Subtask
            </button>
          </div>
        </form>
      </div>
      
      {/* Subtasks List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Task ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subtasks.map((subtask) => (
              <tr key={subtask.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {subtask.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{subtask.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    subtask.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    subtask.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {subtask.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {subtask.taskId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {subtask.createdAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}