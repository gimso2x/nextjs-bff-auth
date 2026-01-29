import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from '@/lib/session/config';
import { AUTH_CONFIG } from '@/lib/config';

/**
 * 🛡️ 인증 미들웨어
 * 
 * 보호된 라우트 접근 시 세션 확인
 * 설정 변경: lib/config.ts → AUTH_CONFIG.protectedRoutes
 */
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isProtectedRoute = AUTH_CONFIG.protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    if (!isProtectedRoute) {
        return NextResponse.next();
    }

    // iron-session에서 세션 확인
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await getIronSession<SessionData>(request.cookies as any, sessionOptions);

    if (!session.isLoggedIn || !session.accessToken) {
        const errorUrl = new URL(AUTH_CONFIG.errorPage, request.url);
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
