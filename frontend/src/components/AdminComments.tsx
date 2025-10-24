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
    email: string;
    role: string;
  };
  ai_tool: {
    id: number;
    name: string;
  };
}

export default function AdminComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      // Get all comments from all tools
      const response = await apiClient.request('/admin/comments');
      setComments(response.data || response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (commentId: number) => {
    try {
      await apiClient.request(`/admin/comments/${commentId}/approve`, {
        method: 'POST',
      });
      setSuccess('Comment approved successfully');
      await fetchComments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve comment');
    }
  };

  const handleReject = async (commentId: number) => {
    try {
      await apiClient.request(`/admin/comments/${commentId}/reject`, {
        method: 'POST',
      });
      setSuccess('Comment rejected successfully');
      await fetchComments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject comment');
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg">Loading comments...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <button
            onClick={() => window.location.href = '/admin'}
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Admin Dashboard
          </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Comments Management</h1>
        <p className="text-gray-600 mt-2">Review and approve/reject user comments</p>
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

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No comments to review</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {comment.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{comment.user.name}</p>
                      <p className="text-xs text-gray-500">{comment.user.email}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(comment.user.role)}`}>
                      {comment.user.role}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>Tool:</strong> {comment.ai_tool.name}
                    </p>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      comment.is_approved 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {comment.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                </div>
                
                {!comment.is_approved && (
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleApprove(comment.id)}
                      className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(comment.id)}
                      className="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
