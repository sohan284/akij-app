'use client';

import { useRoleGuard } from '@/hooks/useRoleGuard';

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  const { isAuthorized } = useRoleGuard('employer');
  if (!isAuthorized) return null;
  return <>{children}</>;
}
