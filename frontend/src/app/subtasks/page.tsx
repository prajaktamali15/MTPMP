'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

interface Subtask {
  id: number;
  title: string;
  status: string;
  taskId: number;
}

export default function SubtasksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) router.push('/auth/login');
  }, [user]);

  // Load subtasks
  useEffect(() => {
    if (user) {
      // Simulate loading subtasks
      setTimeout(() => {
        setSubtasks([
          { id: 1, title: 'Create wireframes', status: 'Completed', taskId: 1 },
          { id: 2, title: 'Design color palette', status: 'In Progress', taskId: 1 },
          { id: 3, title: 'Select fonts', status: 'Pending', taskId: 1 }
        ]);
        setLoading(false);
      }, 500);
    }
  }, [user]);

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim() === '') return;
    
    const subtask: Subtask = {
      id: subtasks.length + 1,
      title: newSubtaskTitle,
      status: 'Pending',
      taskId: 1
    };
    
    setSubtasks([...subtasks, subtask]);
    setNewSubtaskTitle('');
  };

  const handleToggleStatus = (id: number) => {
    setSubtasks(subtasks.map(subtask => {
      if (subtask.id === id) {
        const newStatus = subtask.status === 'Completed' ? 'Pending' : 'Completed';
        return { ...subtask, status: newStatus };
      }
      return subtask;
    }));
  };

  const handleDeleteSubtask = (id: number) => {
    if (confirm('Are you sure you want to delete this subtask?')) {
      setSubtasks(subtasks.filter(subtask => subtask.id !== id));
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Subtasks</h1>
        <button 
          onClick={() => router.push('/tasks/1')}
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          Back to Task
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add a Subtask</h2>
        <form onSubmit={handleAddSubtask} className="flex gap-2">
          <input
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            className="flex-grow border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter subtask title..."
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add
          </button>
        </form>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Subtasks ({subtasks.length})</h2>
        {subtasks.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No subtasks yet. Add one above!</p>
        ) : (
          <div className="space-y-3">
            {subtasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={subtask.status === 'Completed'}
                    onChange={() => handleToggleStatus(subtask.id)}
                    className="h-5 w-5 text-blue-600 rounded"
                  />
                  <span className={`ml-3 ${subtask.status === 'Completed' ? 'line-through text-gray-500' : ''}`}>
                    {subtask.title}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    subtask.status === 'Completed' ? 'bg-green-200 text-green-800' :
                    subtask.status === 'In Progress' ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-800'
                  }`}>
                    {subtask.status}
                  </span>
                  <button
                    onClick={() => handleDeleteSubtask(subtask.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}