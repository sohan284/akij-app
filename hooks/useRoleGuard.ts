'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { RootState } from '@/lib/redux/store';

/**
 * Guards a page to a specific role.
 * - If on the login page, allows access but redirects if already logged in as the correct role.
 * - If not authenticated → redirects to the appropriate login page.
 * - If authenticated but wrong role → redirects to their own dashboard.
 */
export function useRoleGuard(requiredRole: 'employer' | 'candidate') {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const pathname = usePathname();

  const loginPath = `/${requiredRole}/login`;
  const dashboardPath = `/${requiredRole}/dashboard`;

  useEffect(() => {
    // If we are on the login page for this role
    if (pathname === loginPath) {
      // If already logged in with the correct role, redirect to dashboard
      if (isAuthenticated && user?.role === requiredRole) {
        router.replace(dashboardPath);
      }
      return;
    }

    // Not logged in → send to correct login page
    if (!isAuthenticated || !user) {
      router.replace(loginPath);
      return;
    }

    // Logged in but wrong role → send to their own dashboard
    if (user.role !== requiredRole) {
      router.replace(`/${user.role}/dashboard`);
    }
  }, [isAuthenticated, user, requiredRole, router, pathname, loginPath, dashboardPath]);

  // Authorized if user has the correct role OR if they are on the login page
  const isAuthorized = (isAuthenticated && user?.role === requiredRole) || pathname === loginPath;
  return { isAuthorized, user };
}
