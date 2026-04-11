import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user && user.password === password) {
      // In a real app, use hashing (bcrypt) and JWT signatures.
      const { password: _password, ...userWithoutPassword } = user;
      void _password;
      return NextResponse.json(userWithoutPassword);
    }

    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
