'use client';

import { ClientProtectedRoute } from '@/components/auth/client-protected-route';
import { AdminSidebar } from './admin-sidebar';
import { AuthProvider } from '@/hooks/use-auth-client';
import type { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AuthProvider>
      <ClientProtectedRoute allowedRoles={['admin']}>
        <div className="flex min-h-screen bg-background">
          <AdminSidebar />
          <main className="flex-1">
            <div className="w-full max-w-6xl mx-auto p-6">{children}</div>
          </main>
        </div>
      </ClientProtectedRoute>
    </AuthProvider>
  );
}

export default AdminLayout;
