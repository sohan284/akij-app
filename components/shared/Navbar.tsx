'use client';

import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { logout } from '@/lib/redux/slices/authSlice';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Briefcase, User, LogOut } from 'lucide-react';

import { usePathname } from 'next/navigation';
import Image from 'next/image';
import logoNav from '@/app/assets/logoNav.png';

export default function Navbar() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const pathname = usePathname();
  const isAuthPage = pathname?.includes('/login');

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      dispatch(logout());
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed', error);
      // Fallback: clear client state anyway
      dispatch(logout());
    }
  };

  return (
    <nav className="border-b backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={logoNav}
              alt="Akij Resource"
              width={116}
              height={32}
              className="h-6 lg:h-8  w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Center: Title */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
          <h1 className="text-2xl font-bold text-slate-800">Akij Resource</h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {!isAuthPage && (
            <>
              {!isAuthenticated ? (
                <div className="flex gap-2">
                  <Link
                    href="/employer/login"
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                  >
                    Employer
                  </Link>
                  <Link
                    href="/candidate/login"
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Candidate
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end text-sm">
                    <span className="font-medium text-slate-700">{user?.email}</span>
                    <span className="text-muted-foreground capitalize flex items-center gap-1 text-[10px]">
                      {user?.role === 'employer' ? <Briefcase size={10} /> : <User size={10} />}
                      {user?.role}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon-sm" onClick={handleLogout}>
                    <LogOut className="h-5 w-5 text-slate-600" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
