'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { getData, postData, deleteData } from '@/lib/api';

interface Subtask {
  id: string;  // Changed from number to string
  title: string;
  status: string;  // Use string type to match backend enum
}

export default function SubtasksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [taskId, setTaskId] = useState<string | null>(null);  // Changed from number to string

  // Get task ID from URL params
  useEffect(() => {
    if (user) {
      // Get task ID from URL params
      const taskIdFromUrl = searchParams?.get('taskId');
      
      if (taskIdFromUrl) {
        setTaskId(taskIdFromUrl);
        loadSubtasks(taskIdFromUrl);
      } else {
        // Fallback to localStorage or show error
        setLoading(false);
      }
    }
  }, [user, searchParams]);

  const loadSubtasks = async (parentId: string) => {  // Changed from number to string
    try {
      setLoading(true);
      // Using the correct endpoint for subtasks by task ID
      const data = await getData(`/subtasks/task/${parentId}`);
      setSubtasks(data);
    } catch (error: any) {
      console.error('Failed to load subtasks:', error);
      setError(error.message || 'Failed to load subtasks');
      setSubtasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim() === '' || !taskId) return;
    
    try {
      const newSubtask = await postData('/subtasks', {
        title: newSubtaskTitle,
        taskId: taskId,  // Send as string
        status: 'OPEN'  // Use backend enum value
      });
      
      setSubtasks([...subtasks, newSubtask]);
      setNewSubtaskTitle('');
    } catch (error: any) {
      console.error('Failed to add subtask:', error);
      setError(error.message || 'Failed to add subtask');
    }
  };

  const handleToggleStatus = async (id: string) => {  // Changed from number to string
    try {
      const subtask = subtasks.find(s => s.id === id);
      if (!subtask) return;
      
      const newStatus = subtask.status === 'DONE' ? 'OPEN' : 'DONE';
      // Use postData for updates instead of putData
      const updatedSubtask = await postData(`/subtasks/${id}`, {
        status: newStatus
      });
      
      setSubtasks(subtasks.map(s => 
        s.id === id ? { ...s, status: newStatus } : s
      ));
    } catch (error: any) {
      console.error('Failed to update subtask status:', error);
      setError(error.message || 'Failed to update subtask status');
    }
  };

  const handleDeleteSubtask = async (id: string) => {  // Changed from number to string
    if (confirm('Are you sure you want to delete this subtask?')) {
      try {
        await deleteData(`/subtasks/${id}`);
        setSubtasks(subtasks.filter(subtask => subtask.id !== id));
      } catch (error: any) {
        console.error('Failed to delete subtask:', error);
        setError(error.message || 'Failed to delete subtask');
      }
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

  if (!taskId) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p className="text-red-500">Task ID not specified</p>
        <button 
          onClick={() => router.push('/tasks')}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Back to Tasks
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Subtasks</h1>
        <button 
          onClick={() => router.push(`/tasks/${taskId}`)}
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          Back to Task
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
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
                    checked={subtask.status === 'DONE'}
                    onChange={() => handleToggleStatus(subtask.id)}
                    className="h-5 w-5 text-blue-600 rounded"
                  />
                  <span className={`ml-3 ${subtask.status === 'DONE' ? 'text-gray-500' : ''}`}>
                    {subtask.title}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    subtask.status === 'DONE' ? 'bg-green-200 text-green-800' :
                    subtask.status === 'IN_PROGRESS' ? 'bg-yellow-200 text-yellow-800' : 
                    subtask.status === 'BLOCKED' ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-800'
                  }`}>
                    {subtask.status.replace('_', ' ')}
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