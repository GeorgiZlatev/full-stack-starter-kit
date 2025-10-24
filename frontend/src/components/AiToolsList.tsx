'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient, AiTool, Category, Tag } from '@/lib/api';
import SimpleLayout from './SimpleLayout';

interface AiToolsListProps {
  onAddTool?: () => void;
}

export default function AiToolsList({ onAddTool }: AiToolsListProps) {
  const [tools, setTools] = useState<AiTool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showFeatured, setShowFeatured] = useState(false);

  // Debounced search effect
  useEffect(() => {
    if (search.trim()) {
      setIsSearching(true);
    }
    
    const timeoutId = setTimeout(() => {
      fetchData();
      setIsSearching(false);
    }, 300); // 300ms delay for search

    return () => clearTimeout(timeoutId);
  }, [search]);

  // Immediate effect for other filters
  useEffect(() => {
    fetchData();
  }, [selectedCategory, selectedTag, selectedRole, showFeatured]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [toolsResponse, categoriesData, tagsData] = await Promise.all([
        apiClient.getAiTools({
          search: search || undefined,
          category_id: selectedCategory || undefined,
          tag_id: selectedTag || undefined,
          role: selectedRole || undefined,
          featured: showFeatured || undefined,
        }),
        apiClient.getCategories(),
        apiClient.getTags(),
      ]);

      setTools(toolsResponse.data);
      setCategories(categoriesData);
      setTags(tagsData);
    } catch (err) {
      setError('Failed to load AI tools');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory(null);
    setSelectedTag(null);
    setSelectedRole(null);
    setShowFeatured(false);
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

  const getRoleLabel = (role: string) => {
    const labels = {
      owner: 'Owner',
      admin: 'Admin',
      backend: 'Backend',
      frontend: 'Frontend',
      pm: 'PM',
      qa: 'QA',
      designer: 'Designer',
    };
    return labels[role as keyof typeof labels] || role;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-lg">Loading AI tools...</div>
      </div>
    );
  }

  return (
    <SimpleLayout title="AI Tools">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>
        {/* Add Tool Button */}
        {onAddTool && (
          <div className="mb-8 flex justify-end">
            <button
              onClick={onAddTool}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Tool
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4 sm:p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tools..."
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
              <select
                value={selectedTag || ''}
                onChange={(e) => setSelectedTag(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="">All Tags</option>
                {tags.map(tag => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={selectedRole || ''}
                onChange={(e) => setSelectedRole(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="">All Roles</option>
                <option value="backend">Backend</option>
                <option value="frontend">Frontend</option>
                <option value="pm">PM</option>
                <option value="qa">QA</option>
                <option value="designer">Designer</option>
              </select>
            </div>

            <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-5 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showFeatured}
                  onChange={(e) => setShowFeatured(e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Show featured tools only</span>
              </label>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium self-start sm:self-auto"
              >
                Clear all filters
              </button>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : tools.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.291A7.962 7.962 0 0012 5c-2.34 0-4.29 1.009-5.824 2.709" />
              </svg>
            </div>
            <div className="text-gray-500 text-lg font-medium">No AI tools found</div>
            <p className="text-gray-400 mt-2">Try adjusting your filters or add a new tool</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {tools.map(tool => (
              <div key={tool.id} className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.name}</h3>
                      {tool.is_featured && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 ml-4">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {tool.views_count}
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 overflow-hidden" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {tool.description}
                  </p>

                  <div className="mb-4">
                    <div className="flex items-center mb-3">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: tool.category?.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">{tool.category?.name}</span>
                    </div>
                    
                    {tool.tags && tool.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tool.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                          >
                            {tag.name}
                          </span>
                        ))}
                        {tool.tags.length > 3 && (
                          <span className="text-xs text-gray-500 px-2 py-1">
                            +{tool.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Rating Display */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-sm ${
                              star <= (tool.average_rating || 0)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {tool.average_rating ? tool.average_rating.toFixed(1) : 'No rating'} 
                        ({tool.ratings_count || 0})
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-4 border-t border-gray-100 space-y-2 sm:space-y-0">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => window.location.href = `/tool/${tool.id}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
                      >
                        <span className="hidden sm:inline">View Details</span>
                        <span className="sm:hidden">Details</span>
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      
                      <a
                        href={tool.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-green-600 hover:text-green-800 text-xs sm:text-sm font-medium"
                      >
                        <span className="hidden sm:inline">Visit Tool</span>
                        <span className="sm:hidden">Visit</span>
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                    
                    {tool.documentation_link && (
                      <a
                        href={tool.documentation_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-gray-700 text-xs sm:text-sm self-start sm:self-auto"
                      >
                        📚 Docs
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SimpleLayout>
  );
}