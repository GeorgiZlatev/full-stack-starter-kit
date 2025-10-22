'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';
import Dashboard from '@/components/Dashboard';
import AiToolsList from '@/components/AiToolsList';
import AddAiToolForm from '@/components/AddAiToolForm';
import Profile from '@/components/Profile';
import ClientOnly from '@/components/ClientOnly';

export default function Home() {
  return (
    <ClientOnly fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <HomeContent />
    </ClientOnly>
  );
}

function HomeContent() {
  const { user, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Full-Stack Starter Kit
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Laravel Backend + Next.js Frontend with Role-Based Authentication
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {showRegister ? <RegisterForm /> : <LoginForm />}
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {showRegister ? 'Already have an account?' : "Don't have an account?"}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowRegister(!showRegister)}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {showRegister ? 'Sign in instead' : 'Create new account'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="text-sm text-gray-600">
          <p className="mb-2">Test accounts available:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>owner@example.com</div>
            <div>backend@example.com</div>
            <div>frontend@example.com</div>
            <div>pm@example.com</div>
            <div>qa@example.com</div>
            <div>designer@example.com</div>
          </div>
          <p className="mt-2">Password: <code className="bg-gray-100 px-1 rounded">password</code></p>
        </div>
      </div>
    </div>
  );
}
