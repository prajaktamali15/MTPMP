"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { getData, postData, deleteData } from "@/lib/api";

interface Task {
  id: string;  // Changed from number to string to match backend UUIDs
  title: string;
  description: string;
  status: string;
  projectId: string;  // Changed from number to string to match backend UUIDs
  createdAt: string;
}

export default function EditTaskPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskStatus, setTaskStatus] = useState("OPEN");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Handle authentication and redirection with useEffect
  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
    }
  }, [user, router]);

  // Fetch task data
  useEffect(() => {
    if (user && taskId) {
      fetchTaskData();
    }
  }, [user, taskId]);

  const fetchTaskData = async () => {
    try {
      const response = await getData(`/tasks/${taskId}`) as Task;
      setTaskTitle(response.title);
      setTaskDescription(response.description || "");
      setTaskStatus(response.status || "OPEN");
    } catch (err: any) {
      console.error('Error fetching task data:', err);
      setError(err.message || "Failed to load task data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await postData(`/tasks/${taskId}`, {
        title: taskTitle,
        description: taskDescription,
        status: taskStatus
      });
      
      alert("Task updated successfully!");
      // Redirect back to the project page
      // First we need to get the project ID to redirect properly
      const taskData = await getData(`/tasks/${taskId}`) as Task;
      router.push(`/projects/${taskData.projectId}`);
    } catch (err: any) {
      setError(err.message || "Failed to update task");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      return;
    }

    try {
      // Use DELETE method instead of POST to /delete endpoint
      await deleteData(`/tasks/${taskId}`);
      alert("Task deleted successfully!");
      // Redirect back to the projects page
      router.push("/projects");
    } catch (err: any) {
      setError(err.message || "Failed to delete task");
    }
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Loading...</h1>
        <p className="text-lg text-gray-600">Fetching task details...</p>
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
          onClick={() => router.push("/projects")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Projects
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
          onClick={() => router.push("/projects")}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Projects
        </button>
        <h1 className="text-3xl font-bold mb-2">Edit Task</h1>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSaveTask} className="space-y-6">
          <div>
            <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              id="taskTitle"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded"
              required
            />
          </div>
          
          <div>
            <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="taskDescription"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded"
              rows={4}
            />
          </div>
          
          <div>
            <label htmlFor="taskStatus" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="taskStatus"
              value={taskStatus}
              onChange={(e) => setTaskStatus(e.target.value)}cd
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
              onClick={() => router.push("/projects")}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={handleDeleteTask}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 ml-auto"
            >
              Delete Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}