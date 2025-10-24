'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface AiTool {
  id: number;
  name: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  category: {
    id: number;
    name: string;
    color: string;
  };
  creator: {
    id: number;
    name: string;
    email: string;
  };
  tags: Array<{
    id: number;
    name: string;
    color: string;
  }>;
  views_count: number;
}

interface Filters {
  status: string;
  category_id: string;
  role: string;
  search: string;
  created_by: string;
}

export default function AdminToolsList() {
  const [tools, setTools] = useState<AiTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<Filters>({
    status: '',
    category_id: '',
    role: '',
    search: '',
    created_by: '',
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchTools();
    fetchCategories();
    fetchUsers();
  }, [filters]);

  const fetchTools = async () => {
    try {
      setLoading(true);
      const params: any = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      
      const response = await apiClient.getAdminTools(params);
      setTools(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tools');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.getAdminCategories();
      setCategories(response);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiClient.getAdminUsers();
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const handleApprove = async (toolId: number) => {
    try {
      await apiClient.approveTool(toolId);
      setTools(tools.map(tool => 
        tool.id === toolId 
          ? { ...tool, status: 'approved' as const }
          : tool
      ));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve tool');
    }
  };

  const handleReject = async (toolId: number, reason: string) => {
    try {
      await apiClient.rejectTool(toolId, reason);
      setTools(tools.map(tool => 
        tool.id === toolId 
          ? { ...tool, status: 'rejected' as const, rejection_reason: reason }
          : tool
      ));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject tool');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading tools...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Tools Management</h1>
          <p className="text-gray-600 mt-2">Review and manage AI tool submissions</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category_id}
                onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              >
                <option value="">All Roles</option>
                <option value="owner">Owner</option>
                <option value="backend">Backend</option>
                <option value="frontend">Frontend</option>
                <option value="pm">PM</option>
                <option value="qa">QA</option>
                <option value="designer">Designer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Creator</label>
              <select
                value={filters.created_by}
                onChange={(e) => setFilters({ ...filters, created_by: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              >
                <option value="">All Creators</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search tools..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Tools List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Tools ({tools.length})
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {tools.map((tool) => (
              <div key={tool.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{tool.name}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tool.status)}`}>
                        {tool.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{tool.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Category: {tool.category.name}</span>
                      <span>Creator: {tool.creator.name}</span>
                      <span>Views: {tool.views_count}</span>
                      <span>Created: {new Date(tool.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    {tool.tags.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-2">
                          {tool.tags.map(tag => (
                            <span
                              key={tag.id}
                              className="px-2 py-1 text-xs font-medium rounded"
                              style={{ backgroundColor: tag.color + '20', color: tag.color }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {tool.rejection_reason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-800">
                          <strong>Rejection Reason:</strong> {tool.rejection_reason}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-6 flex space-x-2">
                    {tool.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(tool.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Rejection reason:');
                            if (reason) handleReject(tool.id, reason);
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => window.open(tool.link, '_blank')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      View Tool
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {tools.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No tools found matching your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
