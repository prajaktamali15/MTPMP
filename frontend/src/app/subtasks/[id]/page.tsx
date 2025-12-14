'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { getData, postData } from '../../../lib/api';

interface Subtask {
  id: number;
  title: string;
  status: string;
  taskId: number;
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
      // For now, we'll simulate subtask data since we don't have a real API endpoint
      // In a real implementation, you would fetch from `/subtasks/${subtaskId}`
      setTimeout(() => {
        const mockSubtask: Subtask = {
          id: Number(subtaskId),
          title: 'Sample Subtask',
          status: 'OPEN',
          taskId: 1,
          createdAt: '2025-12-14'
        };
        setSubtask(mockSubtask);
        setSubtaskTitle(mockSubtask.title);
        setSubtaskStatus(mockSubtask.status);
        setLoading(false);
      }, 500);
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
      // For now, we'll simulate saving since we don't have a real API endpoint
      // In a real implementation, you would POST to `/subtasks/${subtaskId}`
      setTimeout(() => {
        const updatedSubtask: Subtask = {
          id: Number(subtaskId),
          title: subtaskTitle,
          status: subtaskStatus,
          taskId: subtask?.taskId || 1,
          createdAt: subtask?.createdAt || '2025-12-14'
        };
        setSubtask(updatedSubtask);
        alert("Subtask updated successfully!");
        setSaving(false);
      }, 500);
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
      // For now, we'll simulate deletion since we don't have a real API endpoint
      // In a real implementation, you would POST to `/subtasks/${subtaskId}/delete`
      setTimeout(() => {
        alert("Subtask deleted successfully!");
        router.push("/subtasks");
      }, 500);
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
          onClick={() => router.push("/subtasks")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Subtasks
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
          onClick={() => router.push("/subtasks")}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Subtasks
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
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
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
              onClick={() => router.push("/subtasks")}
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