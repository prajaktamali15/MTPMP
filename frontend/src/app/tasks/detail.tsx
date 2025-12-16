'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { getData, postData, deleteData } from "@/lib/api";

export default function TaskDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  
  const [task, setTask] = useState<any>(null);
  const [subtasks, setSubtasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [addingComment, setAddingComment] = useState(false);
  
  // Subtask form state
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [creatingSubtask, setCreatingSubtask] = useState(false);

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  // Load real task data
  useEffect(() => {
    if (user && taskId) {
      loadTaskData();
    }
  }, [user, taskId]);

  const loadTaskData = async () => {
    try {
      setLoading(true);
      // Load task details
      const taskData = await getData(`/tasks/${taskId}`);
      setTask(taskData);
      
      // Load subtasks for this task
      const subtasksData = await getData(`/subtasks/task/${taskId}`);
      setSubtasks(subtasksData);
      
      // TODO: Load real comments when comments API is implemented
      setComments([]);
    } catch (err: any) {
      console.error('Error loading task data:', err);
      setError(err.message || "Failed to load task data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    setAddingComment(true);
    setError("");

    try {
      // TODO: Implement real comment API when available
      // For now, just add to local state
      const newComment = {
        id: comments.length + 1,
        user: "You",
        comment: comment,
        timestamp: new Date().toLocaleString()
      };
      
      setComments([...comments, newComment]);
      setComment("");
    } catch (err: any) {
      setError(err.message || "Failed to add comment");
    } finally {
      setAddingComment(false);
    }
  };

  const updateTaskStatus = async (newStatus: string) => {
    try {
      // Update task status via API
      const updatedTask = await postData(`/tasks/${taskId}`, {
        status: newStatus
      });
      setTask(updatedTask);
    } catch (err: any) {
      console.error('Error updating task status:', err);
      setError(err.message || "Failed to update task status");
    }
  };

  const handleCreateSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subtaskTitle.trim()) return;
    
    setCreatingSubtask(true);
    setError("");

    try {
      // Create subtask via API
      const newSubtask = await postData(`/subtasks`, {
        title: subtaskTitle,
        taskId: taskId
      });
      
      setSubtasks([...subtasks, newSubtask]);
      setSubtaskTitle("");
    } catch (err: any) {
      setError(err.message || "Failed to create subtask");
    } finally {
      setCreatingSubtask(false);
    }
  };

  const updateSubtaskStatus = async (subtaskId: string, newStatus: string) => {
    try {
      // Update subtask status via API
      const updatedSubtask = await postData(`/subtasks/${subtaskId}`, {
        status: newStatus
      });
      
      setSubtasks(subtasks.map(subtask => 
        subtask.id === subtaskId ? updatedSubtask : subtask
      ));
    } catch (err: any) {
      console.error('Error updating subtask status:', err);
      setError(err.message || "Failed to update subtask status");
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!confirm("Are you sure you want to delete this subtask?")) {
      return;
    }

    try {
      // Delete subtask via API
      await deleteData(`/subtasks/${subtaskId}`);
      
      setSubtasks(subtasks.filter(subtask => subtask.id !== subtaskId));
    } catch (err: any) {
      console.error('Error deleting subtask:', err);
      setError(err.message || "Failed to delete subtask");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Loading...</h1>
        <p className="text-lg text-gray-600">Fetching task details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => router.push("/dashboard")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
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
        <h1 className="text-3xl font-bold mb-2">{task?.title}</h1>
        <p className="text-gray-600">{task?.description || "No description provided"}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subtasks Section */}
          <div className="border rounded-lg p-4">
            <h2 className="text-2xl font-semibold mb-4">Subtasks</h2>
            
            {/* Create Subtask Form */}
            <form onSubmit={handleCreateSubtask} className="mb-4">
              <div className="flex">
                <input
                  type="text"
                  value={subtaskTitle}
                  onChange={(e) => setSubtaskTitle(e.target.value)}
                  className="flex-grow border border-gray-300 p-2 rounded-l"
                  placeholder="Add a subtask..."
                  required
                />
                <button
                  type="submit"
                  disabled={creatingSubtask}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 disabled:opacity-50"
                >
                  {creatingSubtask ? "Adding..." : "Add"}
                </button>
              </div>
            </form>
            
            {/* Subtasks List */}
            {subtasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No subtasks yet</p>
            ) : (
              <div className="space-y-3">
                {subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={subtask.status === 'DONE'}
                        onChange={(e) => updateSubtaskStatus(subtask.id, e.target.checked ? 'DONE' : 'OPEN')}
                        className="mr-3 h-5 w-5"
                      />
                      <span className={subtask.status === 'DONE' ? 'line-through text-gray-500' : ''}>
                        {subtask.title}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={subtask.status}
                        onChange={(e) => updateSubtaskStatus(subtask.id, e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Completed</option>
                        <option value="BLOCKED">Blocked</option>
                      </select>
                      <button
                        onClick={() => router.push(`/subtasks/${subtask.id}`)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSubtask(subtask.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Task Info */}
          <div className="border rounded-lg p-4">
            <h2 className="text-2xl font-semibold mb-4">Task Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Project</label>
                <p className="mt-1">{task?.project?.name || "Unknown Project"}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">
                  <select
                    value={task?.status}
                    onChange={(e) => updateTaskStatus(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Completed</option>
                    <option value="BLOCKED">Blocked</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Created</label>
                <p className="mt-1">{task?.createdAt ? new Date(task.createdAt).toLocaleDateString() : "Unknown"}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                <p className="mt-1">{task?.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : "Unknown"}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Comments */}
        <div className="border rounded-lg p-4">
          <h2 className="text-2xl font-semibold mb-4">Comments</h2>
          
          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="mb-6">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded mb-2"
              rows={3}
              placeholder="Add a comment..."
              required
            />
            <button
              type="submit"
              disabled={addingComment}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {addingComment ? "Adding..." : "Add Comment"}
            </button>
          </form>
          
          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No comments yet</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between">
                    <span className="font-medium">{c.user}</span>
                    <span className="text-sm text-gray-500">{c.timestamp}</span>
                  </div>
                  <p className="mt-2">{c.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}