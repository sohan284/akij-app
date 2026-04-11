'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '@/lib/redux/slices/authSlice';
import { RootState } from '@/lib/redux/store';

interface User {
  id: string;
  email: string;
  role: 'employer' | 'candidate';
}

export default function AuthInitializer({ user }: { user: User | null }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user && !isAuthenticated) {
      dispatch(login(user));
    }
  }, [user, isAuthenticated, dispatch]);

  return null;
}
