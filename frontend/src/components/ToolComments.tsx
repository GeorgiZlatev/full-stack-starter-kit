'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface Comment {
  id: number;
  content: string;
  is_approved: boolean;
  created_at: string;
  user: {
    id: number;
    name: string;
    role: string;
  };
}

interface ToolCommentsProps {
  toolId: number;
}

export default function ToolComments({ toolId }: ToolCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchComments();
  }, [toolId]);

  const fetchComments = async () => {
    try {
      const response = await apiClient.getToolComments(toolId);
      setComments(response.data || response);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    // Check minimum length
    if (newComment.trim().length < 10) {
      setError('Comment must be at least 10 characters long');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Submitting comment:', { toolId, content: newComment });
      await apiClient.createToolComment(toolId, newComment);
      
      setNewComment('');
      setSuccess('Comment submitted successfully! It will be reviewed before being published.');
      await fetchComments();
    } catch (err: any) {
      console.error('Comment submission error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to submit comment';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      owner: 'bg-red-100 text-red-800',
      admin: 'bg-purple-100 text-purple-800',
      backend: 'bg-blue-100 text-blue-800',
      frontend: 'bg-green-100 text-green-800',
      pm: 'bg-yellow-100 text-yellow-800',
      qa: 'bg-purple-100 text-purple-800',
      designer: 'bg-indigo-100 text-indigo-800',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments ({comments.length})</h3>
      
      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Add a comment
          </label>
          <textarea
            id="comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            rows={3}
            placeholder="Share your experience with this tool... (minimum 10 characters)"
            required
          />
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit Comment'}
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No comments yet. Be the first to share your experience!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-b-0">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {comment.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-medium text-gray-900">{comment.user.name}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(comment.user.role)}`}>
                      {comment.user.role}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
