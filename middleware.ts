import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect dashboard and server routes
  if (req.nextUrl.pathname.startsWith('/dashboard') || 
      req.nextUrl.pathname.startsWith('/server') ||
      req.nextUrl.pathname.startsWith('/setup')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth', req.url));
    }
  }

  // Redirect authenticated users away from auth page
  if (req.nextUrl.pathname === '/auth' && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/server/:path*', '/setup/:path*', '/auth'],
};
