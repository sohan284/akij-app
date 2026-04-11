'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/lib/redux/store';

/**
 * Guards a page to a specific role.
 * - If not authenticated → redirects to the appropriate login page.
 * - If authenticated but wrong role → redirects to their own dashboard.
 */
export function useRoleGuard(requiredRole: 'employer' | 'candidate') {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Not logged in → send to correct login page
      router.replace(`/${requiredRole}/login`);
      return;
    }

    if (user.role !== requiredRole) {
      // Logged in but wrong role → send to their own dashboard
      router.replace(`/${user.role}/dashboard`);
    }
  }, [isAuthenticated, user, requiredRole, router]);

  // Returns true only when the user is confirmed to be the right role
  const isAuthorized = isAuthenticated && user?.role === requiredRole;
  return { isAuthorized, user };
}
