'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCodeUrl: string;
  secret: string;
  backupCodes: string[];
}

export default function QRCodeModal({ isOpen, onClose, qrCodeUrl, secret, backupCodes }: QRCodeModalProps) {
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  useEffect(() => {
    if (isOpen && qrCodeUrl) {
      QRCode.toDataURL(qrCodeUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).then(setQrCodeDataUrl).catch(console.error);
    }
  }, [isOpen, qrCodeUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Google Authenticator Setup</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-48 h-48 mx-auto bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center mb-4">
              {qrCodeDataUrl ? (
                <img 
                  src={qrCodeDataUrl} 
                  alt="QR Code" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <div className="text-4xl mb-2">📱</div>
                  <p className="text-sm text-gray-600">Loading QR Code...</p>
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Scan this QR code with your Google Authenticator app
            </p>
            
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-500 mb-1">Manual Entry Key:</p>
              <code className="text-sm font-mono bg-gray-800 text-white px-3 py-2 rounded border block text-center">
                {secret}
              </code>
              <p className="text-xs text-gray-500 mt-2">
                Enter this key manually in Google Authenticator app
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setShowBackupCodes(!showBackupCodes)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              {showBackupCodes ? 'Hide' : 'Show'} Backup Codes
            </button>

            {showBackupCodes && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Backup Codes</h4>
                <p className="text-sm text-yellow-700 mb-3">
                  Save these codes in a safe place. Each can only be used once.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <code key={index} className="text-xs font-mono bg-white px-2 py-1 rounded border text-center">
                      {code}
                    </code>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              I've Set Up Google Authenticator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
