'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { getData, postData } from '../../lib/api';

interface Task {
  id: number;
  title: string;
  status: string;
  project: string;
  projectId: number;
  description: string;
}

export default function TasksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) router.push('/auth/login');
  }, [user]);

  // Load tasks
  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await getData('/tasks');
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      // Show empty array instead of mock data
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Loading Tasks...</h1>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <button 
          onClick={() => router.push('/projects')}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create Task
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">Task</th>
              <th className="py-2 px-4 border">Project</th>
              <th className="py-2 px-4 border">Status</th>
              <th className="py-2 px-4 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td className="py-2 px-4 border">{task.title}</td>
                <td className="py-2 px-4 border">{task.project}</td>
                <td className="py-2 px-4 border">
                  <span className={`px-2 py-1 rounded ${
                    task.status === 'Completed' ? 'bg-green-200' :
                    task.status === 'In Progress' ? 'bg-yellow-200' : 'bg-gray-200'
                  }`}>
                    {task.status}
                  </span>
                </td>
                <td className="py-2 px-4 border">
                  <button 
                    onClick={() => router.push(`/tasks/${task.id}`)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}