'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import QRCodeModal from './QRCodeModal';

interface TwoFactorStatus {
  enabled_methods: string[];
  has_any_enabled: boolean;
}

export default function TwoFactorSettings() {
  const [status, setStatus] = useState<TwoFactorStatus>({ enabled_methods: [], has_any_enabled: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [qrModal, setQrModal] = useState<{
    isOpen: boolean;
    qrCodeUrl: string;
    secret: string;
    backupCodes: string[];
  }>({
    isOpen: false,
    qrCodeUrl: '',
    secret: '',
    backupCodes: [],
  });

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await apiClient.getTwoFactorStatus();
      setStatus(response);
    } catch (err) {
      console.error('2FA Status Error:', err);
      setError('Failed to load 2FA status');
    } finally {
      setLoading(false);
    }
  };

  const enableTwoFactor = async (type: string, data: any = {}) => {
    try {
      setLoading(true);
      const response = await apiClient.enableTwoFactor(type, data);
      
      if (type === 'google_authenticator') {
        // Show QR code modal
        setQrModal({
          isOpen: true,
          qrCodeUrl: response.qr_code_url,
          secret: response.secret,
          backupCodes: response.backup_codes,
        });
        setSuccess('Google Authenticator setup initiated. Please scan the QR code.');
        // Refresh status to show enabled state
        await fetchStatus();
      } else {
        setSuccess('2FA enabled successfully');
        await fetchStatus();
      }
    } catch (err: any) {
      console.error('2FA Enable Error:', err);
      setError(err.response?.data?.message || 'Failed to enable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const disableTwoFactor = async (type: string) => {
    try {
      setLoading(true);
      await apiClient.disableTwoFactor(type);
      setSuccess('2FA disabled successfully');
      await fetchStatus();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const sendCode = async (type: string, data: any = {}) => {
    try {
      setLoading(true);
      await apiClient.sendTwoFactorCode(type, data);
      setSuccess('Verification code sent successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !status.has_any_enabled) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Loading 2FA settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h2>
          <p className="text-gray-600 mt-2">Secure your account with additional authentication methods</p>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          <div className="space-y-6">
            {/* Email 2FA */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">📧</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Email Authentication</h3>
                    <p className="text-gray-600">Receive verification codes via email</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {status.enabled_methods.includes('email') ? (
                    <>
                      <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                        Enabled
                      </span>
                      <button
                        onClick={() => disableTwoFactor('email')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                      >
                        Disable
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => enableTwoFactor('email')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Enable
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Telegram 2FA */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">📱</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Telegram Authentication</h3>
                    <p className="text-gray-600">Receive verification codes via Telegram bot</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {status.enabled_methods.includes('telegram') ? (
                    <>
                      <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                        Enabled
                      </span>
                      <button
                        onClick={() => disableTwoFactor('telegram')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                      >
                        Disable
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => enableTwoFactor('telegram')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Enable
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Google Authenticator 2FA */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">🔐</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Google Authenticator</h3>
                    <p className="text-gray-600">Use Google Authenticator app for verification</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {status.enabled_methods.includes('google_authenticator') ? (
                    <>
                      <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                        Enabled
                      </span>
                      <button
                        onClick={() => disableTwoFactor('google_authenticator')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                      >
                        Disable
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => enableTwoFactor('google_authenticator')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Enable
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Security Info */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Security Information</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 2FA adds an extra layer of security to your account</li>
              <li>• You can enable multiple authentication methods</li>
              <li>• Backup codes are provided when you enable 2FA</li>
              <li>• Keep your backup codes in a safe place</li>
            </ul>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={qrModal.isOpen}
        onClose={() => setQrModal({ ...qrModal, isOpen: false })}
        qrCodeUrl={qrModal.qrCodeUrl}
        secret={qrModal.secret}
        backupCodes={qrModal.backupCodes}
      />
    </div>
  );
}
