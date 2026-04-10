'use client';

import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { logout } from '@/lib/redux/slices/authSlice';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Briefcase, User, LogOut } from 'lucide-react';

import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const pathname = usePathname();
  const isAuthPage = pathname?.includes('/login');

  return (
    <nav className="border-b bg-white backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-2xl font-black text-[#3b3db9] leading-none tracking-tight">AKIJ</span>
                <span className="text-xs font-bold text-white bg-slate-500 px-1 py-0.5 rounded-xs leading-none">RESOURCE</span>
              </div>
              <span className="text-[8px] font-medium tracking-widest text-slate-500 uppercase">Towards success</span>
            </div>
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
                    className={buttonVariants({ variant: "ghost" })}
                  >
                    Employer
                  </Link>
                  <Link 
                    href="/candidate/login" 
                    className={buttonVariants({ variant: "outline", className: "rounded-lg" })}
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
                  <Button variant="ghost" size="icon" onClick={() => dispatch(logout())} className="hover:bg-slate-100 rounded-full h-10 w-10">
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
