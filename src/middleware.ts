import { NextRequest, NextResponse } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/mypage'];

// SSO 로그인 URL (환경변수로 설정)
const SSO_LOGIN_URL = process.env.SSO_LOGIN_URL || '/api/auth/login';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check for auth cookies
    const accessToken = request.cookies.get('access_token')?.value;

    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    // Redirect to error page if accessing protected route without auth
    if (isProtectedRoute && !accessToken) {
        const errorUrl = new URL('/error-page', request.url);
        errorUrl.searchParams.set('code', 'unauthorized');

        // returnTo를 쿠키에 저장 (SSO 로그인 후 돌아올 경로)
        const response = NextResponse.redirect(errorUrl);
        response.cookies.set('auth_return_to', pathname, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 5, // 5 minutes
        });

        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|error-page).*)',
    ],
};
