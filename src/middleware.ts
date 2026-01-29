import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from '@/lib/session/config';

// 인증이 필요한 라우트
const protectedRoutes = ['/dashboard', '/mypage'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    if (!isProtectedRoute) {
        return NextResponse.next();
    }

    // iron-session에서 세션 확인
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await getIronSession<SessionData>(request.cookies as any, sessionOptions);

    if (!session.isLoggedIn || !session.accessToken) {
        const errorUrl = new URL('/error-page', request.url);
        errorUrl.searchParams.set('code', 'unauthorized');

        const response = NextResponse.redirect(errorUrl);
        response.cookies.set('auth_return_to', pathname, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 5,
        });

        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|error-page|dev|callback).*)',
    ],
};
