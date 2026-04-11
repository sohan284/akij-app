import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';
import { cookies } from 'next/headers';

// 1. Specify protected and public routes
const protectedRoutes = ['/dashboard', '/candidate/dashboard', '/employer/dashboard'];
const publicRoutes = ['/login', '/candidate/login', '/employer/login', '/'];

export async function proxy(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isPublicRoute = publicRoutes.includes(path);

  // 3. Decrypt the session from the cookie
  const cookie = (await cookies()).get('akij_session')?.value;
  const session = await decrypt(cookie);

  // 4. Redirect to /login if the user is not authenticated
  if (isProtectedRoute && !session?.userId) {
    // Determine which login page to redirect to based on the path
    let loginUrl = '/candidate/login';
    if (path.startsWith('/employer')) {
      loginUrl = '/employer/login';
    }
    return NextResponse.redirect(new URL(loginUrl, req.nextUrl));
  }

  // 5. Redirect to /dashboard if the user is authenticated and trying to access a public route
  if (
    isPublicRoute &&
    session?.userId &&
    !path.startsWith(`/${session.role}/dashboard`)
  ) {
    return NextResponse.redirect(new URL(`/${session.role}/dashboard`, req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
