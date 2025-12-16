'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { getData, postData, putData, deleteData, uploadFile, getTaskFiles, deleteFile } from '@/lib/api';
interface Subtask {
  id: string;
  title: string;
  description: string;
  status: string;
  taskId: string;
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    email: string;
    // ... other user properties
  };
  createdAt: string;
  updatedAt: string;
}

interface FileItem {
  id: string;
  name: string;
  path: string;
  size: number;
  mimeType: string;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function SubtaskDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subtaskId = searchParams?.get('id') as string;
  
  const [subtask, setSubtask] = useState<Subtask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [addingComment, setAddingComment] = useState(false);

  // Files state
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Check if we're still loading the subtask ID from URL
  const isInitializing = !subtaskId && typeof window !== 'undefined';

  // Debug logging
  useEffect(() => {
    console.log('Subtask Detail Page - User:', user);
    console.log('Subtask Detail Page - Subtask ID from URL:', subtaskId);
  }, [user, subtaskId]);
  // Load real subtask data
  useEffect(() => {
    if (user && subtaskId) {
      console.log('Loading subtask data for ID:', subtaskId);
      loadSubtaskData();
    } else if (!subtaskId && !isInitializing) {
      console.log('No subtask ID found in URL');
      setError("No subtask ID provided in URL");
      setLoading(false);
    }
  }, [user, subtaskId]);

  // Handle authentication redirect after hooks are declared
  if (!user && !isInitializing) {
    console.log('No user found and not initializing, redirecting to login');
    router.push("/auth/login");
    return null;
  }
  const loadSubtaskData = async () => {
    try {
      setLoading(true);
      // Load subtask details
      const subtaskData = await getData(`/subtasks/${subtaskId}`);
      setSubtask(subtaskData);
      
      // Load comments and files for the task that contains this subtask
      if (subtaskData.taskId) {
        try {
          const commentsData = await getData(`/comments/task/${subtaskData.taskId}`);
          setComments(commentsData);
        } catch (commentErr) {
          console.log('Could not load comments:', commentErr);
          setComments([]);
        }
        
        // Load files for the task
        try {
          const filesData = await getTaskFiles(subtaskData.taskId);
          setFiles(filesData);
        } catch (fileErr) {
          console.log('Could not load files:', fileErr);
          setFiles([]);
        }
      }
    } catch (err: any) {
      console.error('Error loading subtask data:', err);
      setError(err.message || "Failed to load subtask data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !subtask?.taskId) return;
    
    setAddingComment(true);
    setError("");

    try {
      // Create comment using the task ID (not subtask ID)
      const commentData = await postData('/comments', {
        content: newComment.trim(),
        taskId: subtask.taskId
      });
      
      setComments([...comments, commentData]);
      setNewComment("");
    } catch (err: any) {
      setError(err.message || "Failed to add comment");
    } finally {
      setAddingComment(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !subtask?.taskId) return;
    
    setUploading(true);
    setError("");

    try {
      // Upload file using the task ID (not subtask ID)
      const fileData = await uploadFile(selectedFile, subtask.taskId);
      
      setFiles([...files, fileData]);
      setSelectedFile(null);
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    
    try {
      await deleteFile(fileId);
      setFiles(files.filter(file => file.id !== fileId));
    } catch (err: any) {
      setError(err.message || "Failed to delete file");
    }
  };

  const updateSubtaskStatus = async (newStatus: string) => {
    try {
      const updatedSubtask = await putData(`/subtasks/${subtaskId}`, {
        status: newStatus
      });
      setSubtask(updatedSubtask);
    } catch (err: any) {
      setError(err.message || "Failed to update subtask status");
    }
  };

  const handleMarkComplete = async () => {
    try {
      const updatedSubtask = await putData(`/subtasks/${subtaskId}`, {
        status: 'DONE'
      });
      setSubtask(updatedSubtask);
      alert("Subtask marked as complete!");
    } catch (err: any) {
      setError(err.message || "Failed to mark subtask as complete");
    }
  };

  const handleDeleteSubtask = async () => {
    if (!confirm("Are you sure you want to delete this subtask? This action cannot be undone.")) return;
    
    try {
      await deleteData(`/subtasks/${subtaskId}`);
      alert("Subtask deleted successfully!");
      router.push(`/tasks?page=${subtask?.taskId}`);
    } catch (err: any) {
      setError(err.message || "Failed to delete subtask");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Loading...</h1>
        <p className="text-lg text-gray-600">Fetching subtask details...</p>
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
          Back to Tasks
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button 
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold mb-2">{subtask?.title}</h1>
        <p className="text-gray-600">{subtask?.description || "No description provided"}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subtask Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status and Actions */}
          <div className="border rounded-lg p-4">
            <h2 className="text-2xl font-semibold mb-4">Subtask Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded text-xs ${
                    subtask?.status === 'OPEN' ? 'bg-gray-100 text-gray-800' :
                    subtask?.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                    subtask?.status === 'DONE' ? 'bg-green-100 text-green-800' :
                    subtask?.status === 'BLOCKED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {subtask?.status === 'OPEN' ? 'Open' :
                     subtask?.status === 'IN_PROGRESS' ? 'In Progress' :
                     subtask?.status === 'DONE' ? 'Complete' :
                     subtask?.status === 'BLOCKED' ? 'Blocked' : 
                     subtask?.status?.replace('_', ' ') || 'Unknown'}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created
                </label>
                <p className="mt-1">{subtask?.createdAt ? new Date(subtask.createdAt).toLocaleDateString() : "Unknown"}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Updated
                </label>
                <p className="mt-1">{subtask?.updatedAt ? new Date(subtask.updatedAt).toLocaleDateString() : "Unknown"}</p>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => router.push(`/subtasks/${subtask?.id}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit Subtask
                </button>
                
                <button
                  onClick={handleMarkComplete}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Mark Complete
                </button>
                
                <button
                  onClick={handleDeleteSubtask}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete Subtask
                </button>
                
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
          
          {/* File Upload Section */}
          <div className="border rounded-lg p-4">
            <h2 className="text-2xl font-semibold mb-4">Files</h2>
            
            {/* Upload File Form */}
            <form onSubmit={handleFileUpload} className="mb-6">
              <div className="flex">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="flex-grow border border-gray-300 p-2 rounded-l text-sm"
                />
                <button
                  type="submit"
                  disabled={!selectedFile || uploading}
                  className="px-4 py-2 bg-green-600 text-white rounded-r hover:bg-green-700 disabled:opacity-50 text-sm"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
            
            {/* Files List */}
            <div className="space-y-4">
              {files.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No files uploaded yet</p>
              ) : (
                files.map((file) => (
                  <div key={file.id} className="border-b pb-4 last:border-b-0 flex justify-between items-center">
                    <div className="font-medium text-sm truncate flex-1">{file.name}</div>
                    <div className="flex space-x-2 ml-2">
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/uploads/${file.path.replace(/^.*[\\/]/, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Download
                      </a>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* Comments Section */}
        <div className="border rounded-lg p-4">
          <h2 className="text-2xl font-semibold mb-4">Comments</h2>
          
          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded mb-2 text-sm"
              rows={3}
              placeholder="Add a comment..."
              required
            />
            <button
              type="submit"
              disabled={addingComment}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {addingComment ? "Adding..." : "Add Comment"}
            </button>
          </form>
          
          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No comments yet</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between">
                    <span className="font-medium text-sm">{comment.author?.name || comment.author?.email || "Unknown User"}</span>
                    <span className="text-xs text-gray-500">
                      {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : "Unknown"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}