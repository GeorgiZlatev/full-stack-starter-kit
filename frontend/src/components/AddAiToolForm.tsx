'use client';

import { useState, useEffect } from 'react';
import { apiClient, Category, Tag, CreateAiToolData } from '@/lib/api';

interface AddAiToolFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AddAiToolForm({ onSuccess, onCancel }: AddAiToolFormProps) {
  const [formData, setFormData] = useState<CreateAiToolData>({
    name: '',
    description: '',
    link: '',
    category_id: 0,
    recommended_roles: [],
    tag_ids: [],
    how_to_use: '',
    real_examples: '',
    documentation_link: '',
    screenshots: [],
    additional_requirements: {},
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiClient.createAiTool(formData);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create AI tool');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateAiToolData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRoleToggle = (role: string) => {
    setFormData(prev => ({
      ...prev,
      recommended_roles: prev.recommended_roles?.includes(role)
        ? prev.recommended_roles.filter(r => r !== role)
        : [...(prev.recommended_roles || []), role]
    }));
  };

  const handleTagToggle = (tagId: number) => {
    setFormData(prev => ({
      ...prev,
      tag_ids: prev.tag_ids?.includes(tagId)
        ? prev.tag_ids.filter(id => id !== tagId)
        : [...(prev.tag_ids || []), tagId]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Add New AI Tool</h2>
          <p className="text-gray-600">Share a new AI tool with the community</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tool Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., ChatGPT, GitHub Copilot"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => handleInputChange('category_id', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tool Link *
            </label>
            <input
              type="url"
              required
              value={formData.link}
              onChange={(e) => handleInputChange('link', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe what this tool does and how it can help..."
            />
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Documentation Link
              </label>
              <input
                type="url"
                value={formData.documentation_link || ''}
                onChange={(e) => handleInputChange('documentation_link', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://docs.example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How to Use
              </label>
              <textarea
                rows={3}
                value={formData.how_to_use || ''}
                onChange={(e) => handleInputChange('how_to_use', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief instructions on how to use this tool..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Real Examples
            </label>
            <textarea
              rows={3}
              value={formData.real_examples || ''}
              onChange={(e) => handleInputChange('real_examples', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Share specific examples of how you've used this tool..."
            />
          </div>

          {/* Recommended Roles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recommended Roles
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableRoles.map(role => (
                <label key={role.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.recommended_roles?.includes(role.value) || false}
                    onChange={() => handleRoleToggle(role.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">{role.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    formData.tag_ids?.includes(tag.id)
                      ? 'bg-blue-100 border-blue-300 text-blue-800'
                      : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create AI Tool'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
