'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

interface Comment {
  id: number;
  author: string;
  content: string;
  timestamp: string;
  taskId: number;
}

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
      // Simulate loading comments
      setTimeout(() => {
        setComments([
          { id: 1, author: 'John Doe', content: 'This task looks good so far. I\'ve completed the initial design.', timestamp: '2 hours ago', taskId: 1 },
          { id: 2, author: 'Jane Smith', content: 'Thanks for the update. Can you also add the mobile mockups?', timestamp: '1 hour ago', taskId: 1 },
          { id: 3, author: 'John Doe', content: 'Sure, I\'ll add those shortly.', timestamp: '30 minutes ago', taskId: 1 }
        ]);
        setLoading(false);
      }, 500);
    }
  }, [user]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === '') return;
    
    const comment: Comment = {
      id: comments.length + 1,
      author: 'You',
      content: newComment,
      timestamp: 'Just now',
      taskId: 1
    };
    
    setComments([comment, ...comments]);
    setNewComment('');
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