import { NextResponse } from 'next/server';
import { users } from '@/lib/db';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    // In a real app, we would return a JWT session.
    // Here we just return the user info.
    const { password: _password, ...userWithoutPassword } = user;
    void _password;
    return NextResponse.json(userWithoutPassword);
  }

  return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
}
