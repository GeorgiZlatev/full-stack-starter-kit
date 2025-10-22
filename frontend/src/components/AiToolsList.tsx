'use client';

import { useState, useEffect } from 'react';
import { apiClient, AiTool, Category, Tag } from '@/lib/api';

interface AiToolsListProps {
  onAddTool?: () => void;
}

export default function AiToolsList({ onAddTool }: AiToolsListProps) {
  const [tools, setTools] = useState<AiTool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showFeatured, setShowFeatured] = useState(false);

  const availableRoles = [
    { value: 'owner', label: 'Owner' },
    { value: 'backend', label: 'Backend Developer' },
    { value: 'frontend', label: 'Frontend Developer' },
    { value: 'pm', label: 'Project Manager' },
    { value: 'qa', label: 'QA Tester' },
    { value: 'designer', label: 'UI/UX Designer' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, tagsData] = await Promise.all([
          apiClient.getCategories(),
          apiClient.getTags(),
        ]);
        setCategories(categoriesData);
        setTags(tagsData);
      } catch (err) {
        setError('Failed to load categories and tags');
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchTools = async () => {
      setLoading(true);
      try {
        const params: any = {};
        if (search) params.search = search;
        if (selectedCategory) params.category_id = selectedCategory;
        if (selectedTag) params.tag_id = selectedTag;
        if (selectedRole) params.role = selectedRole;
        if (showFeatured) params.featured = true;

        const response = await apiClient.getAiTools(params);
        setTools(response.data);
      } catch (err) {
        setError('Failed to load AI tools');
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, [search, selectedCategory, selectedTag, selectedRole, showFeatured]);

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
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Loading AI tools...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Tools</h1>
          <p className="text-gray-600">Discover and share AI tools for your projects</p>
        </div>
        {onAddTool && (
          <button
            onClick={onAddTool}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add New Tool
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tools..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              {availableRoles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-3 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showFeatured}
              onChange={(e) => setShowFeatured(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Show featured tools only</span>
          </label>
        </div>
      </div>

      {/* Tools Grid */}
      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : tools.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No AI tools found</div>
          <p className="text-gray-400 mt-2">Try adjusting your filters or add a new tool</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map(tool => (
            <div key={tool.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{tool.name}</h3>
                    {tool.is_featured && (
                      <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mt-1">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {tool.views_count} views
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {tool.description}
                </p>

                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <span 
                      className="inline-block w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: tool.category?.color }}
                    ></span>
                    <span className="text-sm text-gray-600">{tool.category?.name}</span>
                  </div>
                  
                  {tool.tags && tool.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tool.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag.id}
                          className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                        >
                          {tag.name}
                        </span>
                      ))}
                      {tool.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{tool.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <a
                    href={tool.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Visit Tool →
                  </a>
                  
                  {tool.documentation_link && (
                    <a
                      href={tool.documentation_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      Docs
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
