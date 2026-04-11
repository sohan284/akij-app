import { verifySession } from '@/lib/dal';
import { redirect } from 'next/navigation';
import AuthInitializer from '@/components/auth/AuthInitializer';

export default async function CandidateLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();

  // If unauthorized, redirect to login
  if (!session?.isAuth) {
    redirect('/candidate/login');
  }

  // If wrong role, redirect to their respective dashboard
  if (session.user.role !== 'candidate') {
    redirect(`/${session.user.role}/dashboard`);
  }

  return (
    <>
      <AuthInitializer user={session.user} />
      {children}
    </>
  );
}
