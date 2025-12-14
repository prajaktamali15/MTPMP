'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function TaskDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [addingComment, setAddingComment] = useState(false);

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  // Simulate loading task data
  useEffect(() => {
    setTimeout(() => {
      setTask({
        id: 1,
        title: "Design homepage",
        description: "Create wireframes and mockups for the new homepage design",
        status: "In Progress",
        project: "Website Redesign",
        assignee: "John Doe",
        createdAt: "2025-12-10",
        updatedAt: "2025-12-14"
      });
      
      setComments([
        { id: 1, user: "Jane Smith", comment: "Looks good so far!", timestamp: "2025-12-12 10:30 AM" },
        { id: 2, user: "You", comment: "Working on the color scheme now", timestamp: "2025-12-13 2:15 PM" }
      ]);
      
      setLoading(false);
    }, 500);
  }, []);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    setAddingComment(true);
    setError("");

    // Simulate adding comment
    setTimeout(() => {
      const newComment = {
        id: comments.length + 1,
        user: "You",
        comment: comment,
        timestamp: new Date().toLocaleString()
      };
      
      setComments([...comments, newComment]);
      setComment("");
      setAddingComment(false);
    }, 500);
  };

  const updateTaskStatus = (newStatus: string) => {
    setTask({ ...task, status: newStatus });
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
          onClick={() => router.push("/dashboard")}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold mb-2">{task?.title}</h1>
        <p className="text-gray-600">{task?.description || "No description provided"}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Details */}
        <div className="lg:col-span-2 border rounded-lg p-4">
          <h2 className="text-2xl font-semibold mb-4">Task Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Project</label>
              <p className="mt-1">{task?.project}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Assignee</label>
              <p className="mt-1">{task?.assignee}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <div className="mt-1">
                <select
                  value={task?.status}
                  onChange={(e) => updateTaskStatus(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Created</label>
              <p className="mt-1">{task?.createdAt}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Updated</label>
              <p className="mt-1">{task?.updatedAt}</p>
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
            {comments.map((c) => (
              <div key={c.id} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between">
                  <span className="font-medium">{c.user}</span>
                  <span className="text-sm text-gray-500">{c.timestamp}</span>
                </div>
                <p className="mt-2">{c.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}