import 'server-only';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import { cache } from 'react';
import prisma from '@/lib/prisma';

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get('akij_session')?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId as string },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) return null;

    return { isAuth: true, user: { ...user, role: user.role as 'employer' | 'candidate' } };
  } catch (error) {
    console.error('Failed to fetch user', error);
    return null;
  }
});
