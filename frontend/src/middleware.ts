import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('vibely_token')?.value;
    const { pathname } = request.nextUrl;

    // Define public routes that should be accessible without a token
    // But also redirected TO dashboard if a token exists
    const isAuthRoute = pathname === '/login' || pathname === '/signup' || pathname === '/';

    // Define routes that require authentication
    // These are routes that should redirect to login if NO token exists
    const isProtectedRoute = pathname.startsWith('/chat') ||
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/settings') ||
        pathname.startsWith('/profile');

    if (token) {
        // If logged in and trying to access login/signup/landing, redirect to chat
        if (isAuthRoute) {
            return NextResponse.redirect(new URL('/chat', request.url));
        }
    } else {
        // If not logged in and trying to access a protected route, redirect to login
        if (isProtectedRoute) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
