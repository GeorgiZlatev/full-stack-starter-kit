'use client';

import { useAuth } from '@/contexts/AuthContext';
import ClientOnly from '@/components/ClientOnly';
import AiToolsList from '@/components/AiToolsList';

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

  return <AiToolsList onAddTool={() => window.location.href = '/add-tool'} />;
}
