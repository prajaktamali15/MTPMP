'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getData, postData } from '@/lib/api';

interface Comment {
  id: number;
  content: string;
  taskId: number;
  author: string;
  createdAt: string;
}

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState({ content: '', taskId: '' });
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const loadComments = async () => {
      try {
        setLoading(true);
        const data = await getData('/comments');
        setComments(data);
      } catch (error) {
        console.error('Failed to load comments:', error);
        // Fallback to mock data
        setComments([
          { id: 1, content: 'This task looks good so far. I\'ve completed the initial design.', taskId: 1, author: 'John Doe', createdAt: '2025-12-01T10:30:00Z' },
          { id: 2, content: 'Thanks for the update. Can you also add the mobile mockups?', taskId: 1, author: 'Jane Smith', createdAt: '2025-12-01T14:15:00Z' },
          { id: 3, content: 'Sure, I\'ll add those shortly.', taskId: 1, author: 'John Doe', createdAt: '2025-12-01T15:45:00Z' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [user, router]);

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.content || !newComment.taskId) return;

    try {
      const commentData = {
        content: newComment.content,
        taskId: parseInt(newComment.taskId)
      };

      const createdComment = await postData('/comments', commentData);
      
      // Add to local state
      setComments([...comments, {...createdComment, author: user.name || 'You'}]);
      
      // Reset form
      setNewComment({ content: '', taskId: '' });
    } catch (error) {
      console.error('Failed to create comment:', error);
      alert('Failed to create comment');
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Loading Comments...</h1>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Comments</h1>
        <button 
          onClick={() => router.push('/dashboard')}
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          Back to Dashboard
        </button>
      </div>
      
      {/* Create Comment Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Comment</h2>
        <form onSubmit={handleCreateComment} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Comment
            </label>
            <textarea
              id="content"
              value={newComment.content}
              onChange={(e) => setNewComment({...newComment, content: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your comment"
              rows={3}
              required
            />
          </div>
          <div>
            <label htmlFor="taskId" className="block text-sm font-medium text-gray-700 mb-1">
              Task ID
            </label>
            <input
              type="number"
              id="taskId"
              value={newComment.taskId}
              onChange={(e) => setNewComment({...newComment, taskId: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task ID"
              required
            />
            <div className="mt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add Comment
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-2">
              <div className="font-medium text-gray-900">{comment.author}</div>
              <div className="text-sm text-gray-500">
                {new Date(comment.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="text-gray-700 mb-2">
              Task ID: {comment.taskId}
            </div>
            <p className="text-gray-600">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}