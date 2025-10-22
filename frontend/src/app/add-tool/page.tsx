'use client';

import { useAuth } from '@/contexts/AuthContext';
import AddAiToolForm from '@/components/AddAiToolForm';
import ClientOnly from '@/components/ClientOnly';

export default function AddToolPage() {
  return (
    <ClientOnly fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <AddToolPageContent />
    </ClientOnly>
  );
}

function AddToolPageContent() {
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

  return <AddAiToolForm onSuccess={() => window.location.href = '/tools'} onCancel={() => window.location.href = '/tools'} />;
}
