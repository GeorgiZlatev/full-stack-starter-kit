'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, AiTool, Category, Tag } from '@/lib/api';
import SimpleLayout from './SimpleLayout';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTools: 0,
    totalCategories: 0,
    totalTags: 0,
    featuredTools: 0,
  });
  const [recentTools, setRecentTools] = useState<AiTool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [toolsResponse, categoriesData, tagsData] = await Promise.all([
          apiClient.getAiTools({ featured: true }),
          apiClient.getCategories(),
          apiClient.getTags(),
        ]);

        setRecentTools(toolsResponse.data.slice(0, 6));
        setCategories(categoriesData);
        setStats({
          totalTools: toolsResponse.total,
          totalCategories: categoriesData.length,
          totalTags: tagsData.length,
          featuredTools: toolsResponse.data.filter(tool => tool.is_featured).length,
        });
      } catch (err: any) {
        console.error('Dashboard data fetch error:', err);
        console.error('Error details:', {
          message: err.message,
          status: err.status,
          response: err.response
        });
        setError(`Failed to load dashboard data: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data if user is authenticated
    if (user) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const getRoleColor = (role: string) => {
    const colors = {
      owner: 'bg-red-100 text-red-800',
      backend: 'bg-blue-100 text-blue-800',
      frontend: 'bg-green-100 text-green-800',
      pm: 'bg-yellow-100 text-yellow-800',
      qa: 'bg-purple-100 text-purple-800',
      designer: 'bg-indigo-100 text-indigo-800',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      owner: 'Owner',
      backend: 'Backend Developer',
      frontend: 'Frontend Developer',
      pm: 'Project Manager',
      qa: 'QA Tester',
      designer: 'UI/UX Designer',
    };
    return labels[role as keyof typeof labels] || role;
  };

  if (loading) {
    return (
      <SimpleLayout title="Dashboard">
        <div className="flex justify-center items-center min-h-64">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </SimpleLayout>
    );
  }

  return (
    <SimpleLayout title="Dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {user?.name}! 👋
                </h1>
                <p className="text-blue-100 text-lg">
                  Discover and manage AI tools for your {getRoleLabel(user?.role || '').toLowerCase()} role.
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-4xl">🤖</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tools</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalTools}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalCategories}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tags</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalTags}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Featured</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.featuredTools}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/tools'}
                className="flex items-center w-full p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
              >
                <span className="text-2xl mr-3">🤖</span>
                <div>
                  <p className="font-medium text-gray-900">Browse AI Tools</p>
                  <p className="text-sm text-gray-600">Discover tools for your role</p>
                </div>
              </button>
              <button
                onClick={() => window.location.href = '/add-tool'}
                className="flex items-center w-full p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200"
              >
                <span className="text-2xl mr-3">➕</span>
                <div>
                  <p className="font-medium text-gray-900">Add New Tool</p>
                  <p className="text-sm text-gray-600">Share a tool with the community</p>
                </div>
              </button>
              <button
                onClick={() => window.location.href = '/profile'}
                className="flex items-center w-full p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200"
              >
                <span className="text-2xl mr-3">👤</span>
                <div>
                  <p className="font-medium text-gray-900">View Profile</p>
                  <p className="text-sm text-gray-600">Manage your account</p>
                </div>
              </button>
              
              {/* Admin Panel Button - Only for owner and admin roles */}
              {(user?.role === 'owner' || user?.role === 'admin') && (
                <button
                  onClick={() => window.location.href = '/admin'}
                  className="flex items-center w-full p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
                >
                  <span className="text-2xl mr-3">🛡️</span>
                  <div>
                    <p className="font-medium text-gray-900">Admin Panel</p>
                    <p className="text-sm text-gray-600">Manage tools and users</p>
                  </div>
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
            <div className="grid grid-cols-2 gap-3">
              {categories.slice(0, 6).map(category => (
                <div
                  key={category.id}
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-900">{category.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Tools */}
        {recentTools.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Featured AI Tools</h3>
              <p className="text-sm text-gray-600">Popular tools recommended for your role</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentTools.map(tool => (
                  <div key={tool.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{tool.name}</h4>
                      {tool.is_featured && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3 overflow-hidden" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>{tool.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: tool.category?.color }}
                        ></div>
                        <span className="text-xs text-gray-500">{tool.category?.name}</span>
                      </div>
                      <a
                        href={tool.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Visit →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <button
                  onClick={() => window.location.href = '/tools'}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  View All Tools
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-6">
            {error}
          </div>
        )}
      </div>
    </SimpleLayout>
  );
}