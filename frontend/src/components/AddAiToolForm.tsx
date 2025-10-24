'use client';

import { useState, useEffect } from 'react';
import { apiClient, Category, Tag, CreateAiToolData } from '@/lib/api';
import SimpleLayout from './SimpleLayout';

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
    <SimpleLayout title="Add New AI Tool" showBackButton onBackClick={onCancel}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Add New AI Tool</h2>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Share a new AI tool with the community</p>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 sm:space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex">
                  <svg className="w-5 h-5 mr-2 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tool Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 bg-white text-sm sm:text-base"
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
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 bg-white text-sm sm:text-base"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 bg-white"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 bg-white"
                placeholder="Describe what this tool does and how it can help..."
              />
            </div>

            {/* Optional Fields */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Documentation Link
                  </label>
                  <input
                    type="url"
                    value={formData.documentation_link || ''}
                    onChange={(e) => handleInputChange('documentation_link', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 bg-white text-sm sm:text-base"
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
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 bg-white text-sm sm:text-base"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 bg-white"
                  placeholder="Share specific examples of how you've used this tool..."
                />
              </div>
            </div>

            {/* Recommended Roles */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Target Audience</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Recommended Roles
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {availableRoles.map(role => (
                    <label key={role.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer bg-white">
                      <input
                        type="checkbox"
                        checked={formData.recommended_roles?.includes(role.value) || false}
                        onChange={() => handleRoleToggle(role.value)}
                        className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-900">{role.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors duration-200 ${
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
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t border-gray-200">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200 font-medium flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create AI Tool
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </SimpleLayout>
  );
}
