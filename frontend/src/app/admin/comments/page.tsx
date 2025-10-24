'use client';

import { useAuth } from '@/contexts/AuthContext';
import ClientOnly from '@/components/ClientOnly';
import AdminComments from '@/components/AdminComments';

export default function AdminCommentsPage() {
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

  if (!['owner', 'admin'].includes(user.role)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Access denied. Admin privileges required.</div>
      </div>
    );
  }

  return (
    <ClientOnly fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <AdminComments />
    </ClientOnly>
  );
}
