'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthClient } from '@/hooks/use-auth-client';
import type { ReactNode } from 'react';

interface ClientProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export function ClientProtectedRoute({
  children,
  allowedRoles = [],
  redirectTo = '/login',
}: ClientProtectedRouteProps) {
  const { user, loading } = useAuthClient();
  const router = useRouter();
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    if (loading || redirected) return;

    // Add a small delay to prevent race conditions
    const timeout = setTimeout(() => {
      if (!user) {
        console.log('No user found, redirecting to login');
        setRedirected(true);
        router.push(redirectTo);
        return;
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        console.log(
          `User role ${user.role} not in allowed roles ${allowedRoles}, redirecting`
        );
        // Redirect to appropriate dashboard based on role
        setRedirected(true);
        switch (user.role) {
          case 'admin':
            if (!allowedRoles.includes('admin')) {
              router.push('/admin');
            }
            break;
          case 'engineer':
          case 'manager':
            router.push('/dashboard');
            break;
          case 'homeowner':
            router.push('/homeowner');
            break;
          default:
            router.push('/login');
        }
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [user, loading, allowedRoles, redirectTo, router, redirected]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
