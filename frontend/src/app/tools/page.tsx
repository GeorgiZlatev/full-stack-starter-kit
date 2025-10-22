'use client';

import { useAuth } from '@/contexts/AuthContext';
import ClientOnly from '@/components/ClientOnly';

export default function ToolsPage() {
  return (
    <ClientOnly fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <ToolsPageContent />
    </ClientOnly>
  );
}

function ToolsPageContent() {
  const { user, loading } = useAuth();

  if (loading) {
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-900">AI Tools</h1>
            <p className="text-gray-600 mt-2">Discover and share AI tools for your projects</p>
          </div>
          <button
            onClick={() => window.location.href = '/add-tool'}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Tool
          </button>
        </div>
        
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Tools Coming Soon!</h2>
          <p className="text-gray-600 mb-6">We're working on bringing you the best AI tools collection.</p>
          <button
            onClick={() => window.location.href = '/add-tool'}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Your First Tool
          </button>
        </div>
      </div>
    </div>
  );
}
