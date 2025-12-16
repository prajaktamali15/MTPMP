'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { getData, postData, putData, deleteData } from '../../../lib/api';

interface Subtask {
  id: string;  // Changed from number to string to match backend UUIDs
  title: string;
  status: string;
  taskId: string;  // Changed from number to string to match backend UUIDs
  createdAt: string;
}

export default function SubtaskDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const subtaskId = params.id as string;
  
  const [subtask, setSubtask] = useState<Subtask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [subtaskStatus, setSubtaskStatus] = useState("OPEN");
  const [saving, setSaving] = useState(false);

  // Handle authentication and redirection with useEffect
  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
    }
  }, [user, router]);

  // Fetch subtask data
  useEffect(() => {
    if (user && subtaskId) {
      fetchSubtaskData();
    }
  }, [user, subtaskId]);

  const fetchSubtaskData = async () => {
    try {
      // Fetch real subtask data from the API
      const response = await getData(`/subtasks/${subtaskId}`) as Subtask;
      setSubtask(response);
      setSubtaskTitle(response.title);
      setSubtaskStatus(response.status);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to load subtask data");
      setLoading(false);
    }
  };

  const handleSaveSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // Save subtask data to the API using PUT method
      const response = await putData(`/subtasks/${subtaskId}`, {
        title: subtaskTitle,
        status: subtaskStatus
      }) as Subtask;
      
      setSubtask(response);
      alert("Subtask updated successfully!");
      setSaving(false);
    } catch (err: any) {
      setError(err.message || "Failed to update subtask");
      setSaving(false);
    }
  };

  const handleDeleteSubtask = async () => {
    if (!confirm("Are you sure you want to delete this subtask? This action cannot be undone.")) {
      return;
    }

    try {
      // Delete subtask using the API
      await deleteData(`/subtasks/${subtaskId}`);
      alert("Subtask deleted successfully!");
      // Redirect back to tasks page
      router.push("/tasks");
    } catch (err: any) {
      setError(err.message || "Failed to delete subtask");
    }
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Loading...</h1>
        <p className="text-lg text-gray-600">Fetching subtask details...</p>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => router.push("/tasks")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Tasks
        </button>
      </div>
    );
  }

  // Handle unauthenticated state
  if (!user) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button 
          onClick={() => router.push("/tasks")}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Tasks
        </button>
        <h1 className="text-3xl font-bold mb-2">Edit Subtask</h1>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSaveSubtask} className="space-y-6">
          <div>
            <label htmlFor="subtaskTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Subtask Title *
            </label>
            <input
              type="text"
              id="subtaskTitle"
              value={subtaskTitle}
              onChange={(e) => setSubtaskTitle(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded"
              required
            />
          </div>
          
          <div>
            <label htmlFor="subtaskStatus" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="subtaskStatus"
              value={subtaskStatus}
              onChange={(e) => setSubtaskStatus(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded"
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Completed</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>
          
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            
            <button
              type="button"
              onClick={() => router.push("/tasks")}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={handleDeleteSubtask}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 ml-auto"
            >
              Delete Subtask
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}