'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';

interface TwoFactorVerificationProps {
  onSuccess: () => void;
  onCancel: () => void;
  method: 'email' | 'telegram' | 'google_authenticator';
}

export default function TwoFactorVerification({ onSuccess, onCancel, method }: TwoFactorVerificationProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sendingCode, setSendingCode] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('Please enter the verification code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await apiClient.post('/2fa/verify', {
        code: code.trim(),
        type: method,
      });
      
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async () => {
    try {
      setSendingCode(true);
      setError('');
      
      await apiClient.post('/2fa/send-code', {
        type: method,
      });
      
      // Show success message
      setError(''); // Clear any previous errors
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send verification code');
    } finally {
      setSendingCode(false);
    }
  };

  const getMethodInfo = () => {
    switch (method) {
      case 'email':
        return {
          icon: '📧',
          title: 'Email Verification',
          description: 'Check your email for the verification code',
          placeholder: 'Enter 6-digit code',
        };
      case 'telegram':
        return {
          icon: '📱',
          title: 'Telegram Verification',
          description: 'Check your Telegram for the verification code',
          placeholder: 'Enter 6-digit code',
        };
      case 'google_authenticator':
        return {
          icon: '🔐',
          title: 'Google Authenticator',
          description: 'Enter the code from your Google Authenticator app',
          placeholder: 'Enter 6-digit code',
        };
      default:
        return {
          icon: '🔐',
          title: '2FA Verification',
          description: 'Enter your verification code',
          placeholder: 'Enter code',
        };
    }
  };

  const methodInfo = getMethodInfo();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">{methodInfo.icon}</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{methodInfo.title}</h2>
            <p className="text-gray-600 mb-8">{methodInfo.description}</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={methodInfo.placeholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest"
                maxLength={6}
                autoComplete="one-time-code"
                autoFocus
              />
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              {method !== 'google_authenticator' && (
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={sendingCode}
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {sendingCode ? 'Sending...' : 'Resend Code'}
                </button>
              )}

              <button
                type="button"
                onClick={onCancel}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Having trouble? Contact support for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
