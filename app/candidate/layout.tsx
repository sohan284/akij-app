'use client';

import { useRoleGuard } from '@/hooks/useRoleGuard';

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const { isAuthorized } = useRoleGuard('candidate');
  if (!isAuthorized) return null;
  return <>{children}</>;
}
