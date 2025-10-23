'use client';

import { useAuth } from '@/contexts/AuthContext';
import TwoFactorSettings from '@/components/TwoFactorSettings';
import ClientOnly from '@/components/ClientOnly';

export default function TwoFactorPage() {
  return (
    <ClientOnly fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <TwoFactorPageContent />
    </ClientOnly>
  );
}

function TwoFactorPageContent() {
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

  return <TwoFactorSettings />;
}
