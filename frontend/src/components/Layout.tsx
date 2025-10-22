'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/lib/api';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export default function Layout({ children, title, showBackButton, onBackClick }: LayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠', roles: ['owner', 'backend', 'frontend', 'pm', 'qa', 'designer'] },
    { name: 'AI Tools', href: '/tools', icon: '🤖', roles: ['owner', 'backend', 'frontend', 'pm', 'qa', 'designer'] },
    { name: 'Add Tool', href: '/add-tool', icon: '➕', roles: ['owner', 'backend', 'frontend', 'pm', 'qa', 'designer'] },
    { name: 'Categories', href: '/categories', icon: '📁', roles: ['owner', 'backend', 'pm'] },
    { name: 'Users', href: '/users', icon: '👥', roles: ['owner', 'pm'] },
    { name: 'Profile', href: '/profile', icon: '👤', roles: ['owner', 'backend', 'frontend', 'pm', 'qa', 'designer'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    user ? item.roles.includes(user.role) : false
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">Tools</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User info */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user?.role || '')}`}>
                {getRoleLabel(user?.role || '')}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Navigation</div>
            <button
              onClick={() => window.location.href = '/'}
              className="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
            >
              <span className="mr-3 text-lg">🏠</span>
              Dashboard
            </button>
            <button
              onClick={() => window.location.href = '/?page=tools'}
              className="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
            >
              <span className="mr-3 text-lg">🤖</span>
              AI Tools
            </button>
            <button
              onClick={() => window.location.href = '/?page=add-tool'}
              className="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
            >
              <span className="mr-3 text-lg">➕</span>
              Add Tool
            </button>
            <button
              onClick={() => window.location.href = '/?page=profile'}
              className="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
            >
              <span className="mr-3 text-lg">👤</span>
              Profile
            </button>
          </div>
        </nav>

        {/* Logout button */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-700 rounded-md hover:bg-red-50 transition-colors duration-200"
          >
            <span className="mr-3">🚪</span>
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {showBackButton && (
                <button
                  onClick={onBackClick}
                  className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              )}
              
              {title && (
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
