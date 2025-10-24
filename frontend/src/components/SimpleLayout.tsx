'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SimpleLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export default function SimpleLayout({ children, title, showBackButton, onBackClick }: SimpleLayoutProps) {
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const getRoleColor = (role: string) => {
    const colors = {
      owner: 'bg-red-100 text-red-800 border-red-200',
      backend: 'bg-blue-100 text-blue-800 border-blue-200',
      frontend: 'bg-green-100 text-green-800 border-green-200',
      pm: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      qa: 'bg-purple-100 text-purple-800 border-purple-200',
      designer: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center py-4 lg:py-0 lg:h-16">
            {/* Left side - Logo and title */}
            <div className="flex items-center mb-4 lg:mb-0">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Tools</span>
              </div>
              
              {showBackButton && (
                <button
                  onClick={onBackClick}
                  className="flex items-center text-gray-600 hover:text-gray-900 ml-4 lg:ml-6"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">Back</span>
                </button>
              )}
              
              {title && (
                <h1 className="text-lg lg:text-xl font-semibold text-gray-900 ml-4 lg:ml-6">{title}</h1>
              )}
            </div>

            {/* Right side - User info and navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              {/* User info */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500">{getRoleLabel(user?.role || '')}</div>
                </div>
              </div>
              
              {/* Navigation buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => window.location.href = '/tools'}
                  className="text-gray-600 hover:text-gray-900 px-2 py-1 lg:px-3 lg:py-2 rounded-md text-xs lg:text-sm font-medium transition-colors duration-200"
                >
                  <span className="hidden sm:inline">🤖 </span>Tools
                </button>
                <button
                  onClick={() => window.location.href = '/add-tool'}
                  className="text-gray-600 hover:text-gray-900 px-2 py-1 lg:px-3 lg:py-2 rounded-md text-xs lg:text-sm font-medium transition-colors duration-200"
                >
                  <span className="hidden sm:inline">➕ </span>Add Tool
                </button>
                <button
                  onClick={() => window.location.href = '/profile'}
                  className="text-gray-600 hover:text-gray-900 px-2 py-1 lg:px-3 lg:py-2 rounded-md text-xs lg:text-sm font-medium transition-colors duration-200"
                >
                  <span className="hidden sm:inline">👤 </span>Profile
                </button>
                
                {/* Admin Panel Button - Only for owner and admin roles */}
                {(user?.role === 'owner' || user?.role === 'admin') && (
                  <button
                    onClick={() => window.location.href = '/admin'}
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 lg:px-3 lg:py-2 rounded-md text-xs lg:text-sm font-medium transition-colors duration-200"
                  >
                    <span className="hidden sm:inline">🛡️ </span>Admin
                  </button>
                )}
                
                <button
                  onClick={async () => {
                    await logout();
                    window.location.href = '/';
                  }}
                  className="text-red-600 hover:text-red-900 px-2 py-1 lg:px-3 lg:py-2 rounded-md text-xs lg:text-sm font-medium transition-colors duration-200"
                >
                  <span className="hidden sm:inline">🚪 </span>Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
