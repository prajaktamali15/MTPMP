'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

interface Task {
  id: number;
  title: string;
  status: string;
  project: string;
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
      // Simulate loading tasks
      setTimeout(() => {
        setTasks([
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
        <h1 className="text-3xl font-bold mb-4">Loading Tasks...</h1>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
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