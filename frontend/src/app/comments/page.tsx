'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { getData, postData, getUserEmail } from '@/lib/api';

interface Comment {
  id: number;
  author: string;
  content: string;
  timestamp: string;
  taskId: number;
}

// Helper function to calculate time ago
const getTimeAgo = (date: Date) => {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
};

export default function CommentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) router.push('/auth/login');
  }, [user]);

  // Load comments
  useEffect(() => {
    if (user) {
      loadComments();
    }
  }, [user]);

  const loadComments = async () => {
    try {
      setLoading(true);
      // Load comments for a specific task (you would pass the task ID as a prop or from URL params)
      // For now, we'll load all comments as an example
      const commentsData = await getData('/comments');
      
      // Transform the data to match our interface
      const transformedComments = commentsData.map((comment: any) => ({
        id: comment.id,
        author: comment.user?.name || 'Unknown User',
        content: comment.content,
        timestamp: getTimeAgo(new Date(comment.createdAt)),
        taskId: comment.taskId
      }));
      
      setComments(transformedComments);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load comments:', error);
      setComments([]);
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === '') return;
    
    try {
      // In a real implementation, you would pass the actual task ID
      // For now, we'll use a placeholder
      const commentData = {
        content: newComment,
        taskId: 1 // This should be dynamically determined
      };
      
      const newCommentResponse = await postData('/comments', commentData);
      
      // Transform the response to match our interface
      const userEmail = getUserEmail();
      const comment: Comment = {
        id: newCommentResponse.id,
        author: newCommentResponse.user?.name || userEmail || 'You',
        content: newCommentResponse.content,
        timestamp: 'Just now',
        taskId: newCommentResponse.taskId
      };
      
      setComments([comment, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
      // Still update UI even if API call fails
      const userEmail = getUserEmail();
      const comment: Comment = {
        id: comments.length + 1,
        author: userEmail || 'You',
        content: newComment,
        timestamp: 'Just now',
        taskId: 1
      };
      
      setComments([comment, ...comments]);
      setNewComment('');
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Comments</h1>
        <button 
          onClick={() => router.push('/tasks/1')}
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          Back to Task
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add a Comment</h2>
        <form onSubmit={handleAddComment}>
          <div className="mb-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Write your comment here..."
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Post Comment
          </button>
        </form>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Comments ({comments.length})</h2>
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b pb-4 last:border-b-0">
              <div className="flex justify-between">
                <span className="font-medium">{comment.author}</span>
                <span className="text-sm text-gray-500">{comment.timestamp}</span>
              </div>
              <p className="mt-2 text-gray-700">{comment.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}