'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { getData, postData, putData, deleteData } from "@/lib/api";

export default function TasksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for task detail view
  const [taskId, setTaskId] = useState<string | null>(null);
  const [task, setTask] = useState<any>(null);
  const [subtasks, setSubtasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [addingComment, setAddingComment] = useState(false);
  
  // Subtask form state
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [creatingSubtask, setCreatingSubtask] = useState(false);
  
  // State for tasks list view
  const [tasks, setTasks] = useState<any[]>([]);

  // Get task ID from URL params
  useEffect(() => {
    console.log('=== TASKS PAGE DEBUG INFO ===');
    console.log('useSearchParams hook called');
    console.log('searchParams object:', searchParams);
    
    if (searchParams) {
      console.log('Available search params keys:', Array.from(searchParams.keys()));
      const idFromIdParam = searchParams.get('id');
      const idFromPageParam = searchParams.get('page');
      const id = idFromIdParam || idFromPageParam;
      console.log('id parameter:', idFromIdParam);
      console.log('page parameter:', idFromPageParam);
      console.log('Extracted taskId from URL params:', id);
      console.log('Full search params:', Object.fromEntries(searchParams.entries()));
      
      setTaskId(id || null); // Set to null if no ID is found
    } else {
      console.log('searchParams is null or undefined');
      setTaskId(null);
    }
    console.log('=== END TASKS PAGE DEBUG ===');
  }, [searchParams]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
    }
  }, [user, router]);

  // Load tasks list or task detail based on whether taskId is present
  useEffect(() => {
    if (user) {
      // If taskId is explicitly null or undefined, show tasks list
      // If taskId is a valid string, show task detail
      if (taskId) {
        loadTaskData();
      } else if (taskId === null) {
        // Only load tasks list if taskId is explicitly null (meaning no ID was found in URL)
        loadTasksList();
      }
      // If taskId is undefined, we're still initializing, so don't do anything yet
    }
  }, [user, taskId]);

  const loadTasksList = async () => {
    try {
      setLoading(true);
      const tasksData = await getData('/tasks');
      setTasks(tasksData);
      setError("");
    } catch (err: any) {
      console.error('Error loading tasks list:', err);
      setError(err.message || "Failed to load tasks");
      // Fallback to mock data
      setTasks([
        { id: 1, title: 'Design homepage', status: 'In Progress', project: { name: 'Website Redesign' }, description: 'Create wireframes for homepage' },
        { id: 2, title: 'Setup database', status: 'DONE', project: { name: 'Mobile App' }, description: 'Configure PostgreSQL database' },
        { id: 3, title: 'Create wireframes', status: 'OPEN', project: { name: 'Website Redesign' }, description: 'Design mockups for all pages' },
        { id: 4, title: 'Write copy', status: 'OPEN', project: { name: 'Marketing Campaign' }, description: 'Create content for marketing materials' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadTaskData = async () => {
    try {
      setLoading(true);
      // Check if taskId is available
      if (!taskId) {
        throw new Error("Task ID is required");
      }
      
      console.log('Loading task data for taskId:', taskId);
      
      // Load task details
      const taskData = await getData(`/tasks/${taskId}`);
      console.log('Task data loaded:', taskData);
      setTask(taskData);
      
      // Load subtasks for this task
      const subtasksData = await getData(`/subtasks/task/${taskId}`);
      console.log('Subtasks data loaded:', subtasksData);
      setSubtasks(subtasksData);
      
      // Load comments for this task
      try {
        const commentsData = await getData(`/comments/task/${taskId}`);
        console.log('Comments data loaded:', commentsData);
        setComments(commentsData.map((comment: any) => ({
          id: comment.id,
          user: comment.user?.name || "Unknown User",
          comment: comment.content,
          timestamp: new Date(comment.createdAt).toLocaleString()
        })));
      } catch (err: any) {
        console.error('Error loading comments:', err);
        // Set empty comments array if there's an error
        setComments([]);
      }
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
    setSuccessMessage("");

    try {
      // Make real API call to add comment
      const newComment = await postData(`/comments`, {
        content: comment.trim(),
        taskId: taskId
      });
      
      // Add to local state with proper structure
      const commentObj = {
        id: newComment.id,
        user: user?.name || "You",
        comment: comment.trim(),
        timestamp: new Date().toLocaleString()
      };
      
      setComments([...comments, commentObj]);
      setComment("");
      setSuccessMessage("Comment added successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to add comment");
    } finally {
      setAddingComment(false);
    }
  };

  const updateTaskStatus = async (newStatus: string) => {
    try {
      // Update task status via API using PUT instead of POST
      const updatedTask = await putData(`/tasks/${taskId}`, {
        status: newStatus
      });
      setTask(updatedTask);
      setSuccessMessage("Task status updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
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
    setSuccessMessage("");

    try {
      // Validate inputs
      if (!taskId) {
        throw new Error("Task ID is required");
      }
      
      if (!subtaskTitle || subtaskTitle.trim() === "") {
        throw new Error("Subtask title is required");
      }

      // Create subtask via API
      const newSubtask = await postData(`/subtasks`, {
        title: subtaskTitle.trim(),
        taskId: taskId
      });
      
      setSubtasks([...subtasks, newSubtask]);
      setSubtaskTitle("");
      setSuccessMessage("Subtask created successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to create subtask");
    } finally {
      setCreatingSubtask(false);
    }
  };

  const updateSubtaskStatus = async (subtaskId: string, newStatus: string) => {
    try {
      // Validate inputs
      if (!subtaskId) {
        throw new Error("Subtask ID is required");
      }
      
      if (!newStatus) {
        throw new Error("Status is required");
      }

      // Update subtask status via API using PUT instead of POST
      const updatedSubtask = await putData(`/subtasks/${subtaskId}`, {
        status: newStatus
      });
      
      setSubtasks(subtasks.map(subtask => 
        subtask.id === subtaskId ? updatedSubtask : subtask
      ));
      setSuccessMessage("Subtask updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
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
      setSuccessMessage("Subtask deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      console.error('Error deleting subtask:', err);
      setError(err.message || "Failed to delete subtask");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Loading...</h1>
        <p className="text-lg text-gray-600">
          {taskId ? "Fetching task details..." : taskId === null ? "Fetching tasks..." : "Initializing..."}
        </p>
      </div>
    );
  }

  // Show loading state while we're still extracting the task ID
  if (taskId === undefined) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Loading...</h1>
        <p className="text-lg text-gray-600">Initializing...</p>
      </div>
    );
  }

  // If we have a task ID but no task data, show error or task not found
  if (taskId && !task && !error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p className="text-red-500">Task not found</p>
        <button 
          onClick={() => router.push("/tasks")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Tasks List
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => router.push("/tasks")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Tasks List
        </button>
      </div>
    );
  }

  // If no task ID, show tasks list
  if (!taskId) {
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
                  <td className="py-2 px-4 border">{task.project?.name || task.project || "Unknown Project"}</td>
                  <td className="py-2 px-4 border">
                    <span className={`px-2 py-1 rounded ${
                      task.status === 'DONE' ? 'bg-green-200' :
                      task.status === 'IN_PROGRESS' ? 'bg-yellow-200' : 'bg-gray-200'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2 px-4 border">
                    <button 
                      onClick={() => router.push(`/tasks?page=${task.id}`)}
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

  // If we have a task ID and task data, show task detail view
  return (
    <div className="p-6">
      <div className="mb-6">
        <button 
          onClick={() => router.push("/tasks")}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Tasks List
        </button>
        <h1 className="text-3xl font-bold mb-2">{task?.title}</h1>
      </div>

      {(error || successMessage) && (
        <div className={`mb-4 p-3 rounded ${error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {error || successMessage}
        </div>
      )}

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
                  <div key={subtask.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={subtask.status === 'DONE'}
                        onChange={(e) => updateSubtaskStatus(subtask.id, e.target.checked ? 'DONE' : 'OPEN')}
                        className="mr-3 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="min-w-0 flex-1">
                        <span className={`font-medium ${subtask.status === 'DONE' ? 'text-gray-500' : 'text-gray-900'}`}>
                          {subtask.title}
                        </span>
                        <div className="mt-1 flex items-center text-xs text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${subtask.status === 'OPEN' ? 'bg-gray-100 text-gray-800' : subtask.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' : subtask.status === 'DONE' ? 'bg-green-100 text-green-800' : subtask.status === 'BLOCKED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                            {subtask.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => router.push(`/subtasks/detail?id=${subtask.id}`)}
                        className="flex items-center text-blue-600 hover:text-blue-800 p-1"
                        title="View subtask details"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        <span>Details</span>
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
                    <option value="DONE">Done</option>
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