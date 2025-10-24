'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, AiTool } from '@/lib/api';
import ClientOnly from '@/components/ClientOnly';
import SimpleLayout from '@/components/SimpleLayout';
import ToolComments from '@/components/ToolComments';
import ToolRating from '@/components/ToolRating';

interface ToolPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ToolPage({ params }: ToolPageProps) {
  const resolvedParams = use(params);
  
  return (
    <ClientOnly fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <ToolPageContent toolId={parseInt(resolvedParams.id)} />
    </ClientOnly>
  );
}

function ToolPageContent({ toolId }: { toolId: number }) {
  const { user, loading: authLoading } = useAuth();
  const [tool, setTool] = useState<AiTool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading) {
      fetchTool();
    }
  }, [toolId, authLoading]);

  const fetchTool = async () => {
    try {
      const response = await apiClient.getAiTool(toolId);
      setTool(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tool');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Please log in to access this page.</div>
      </div>
    );
  }

  if (error) {
    return (
      <SimpleLayout title="Error" showBackButton={true} onBackClick={() => window.location.href = '/tools'}>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/tools'}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Back to Tools
          </button>
        </div>
      </SimpleLayout>
    );
  }

  if (!tool) {
    return (
      <SimpleLayout title="Tool Not Found" showBackButton={true} onBackClick={() => window.location.href = '/tools'}>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tool Not Found</h2>
          <p className="text-gray-600 mb-6">The requested tool could not be found.</p>
          <button
            onClick={() => window.location.href = '/tools'}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Back to Tools
          </button>
        </div>
      </SimpleLayout>
    );
  }

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
    <SimpleLayout title={tool.name} showBackButton={true} onBackClick={() => window.location.href = '/tools'}>
      <div className="max-w-6xl mx-auto">
        {/* Tool Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{tool.name}</h1>
              <p className="text-gray-600 mb-4">{tool.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <a
                  href={tool.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Visit Tool
                </a>
                
                {tool.documentation_link && (
                  <a
                    href={tool.documentation_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Documentation
                  </a>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(tool.category?.name || '')}`}>
                  {tool.category?.name}
                </span>
                {tool.tags?.map((tag) => (
                  <span key={tag.id} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    {tag.name}
                  </span>
                ))}
              </div>

              <div className="flex items-center text-sm text-gray-500">
                <span>Created by {tool.creator?.name}</span>
                <span className="mx-2">•</span>
                <span>{tool.views_count} views</span>
                <span className="mx-2">•</span>
                <span>{new Date(tool.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tool Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* How to Use */}
          {tool.how_to_use && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How to Use</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{tool.how_to_use}</p>
            </div>
          )}

          {/* Real Examples */}
          {tool.real_examples && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Real Examples</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{tool.real_examples}</p>
            </div>
          )}
        </div>

        {/* Comments and Rating */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ToolRating toolId={tool.id} />
          <ToolComments toolId={tool.id} />
        </div>
      </div>
    </SimpleLayout>
  );
}
