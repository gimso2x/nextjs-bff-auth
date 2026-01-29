import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromSession, destroySession } from '@/lib/session';
import { createServerApiWithCookies } from '@/lib/axios/server';

/**
 * Logout Route (iron-session + 쿠키 인증 버전)
 */
export async function POST(request: NextRequest) {
    try {
        // 세션에서 토큰 가져오기
        const tokens = await getTokensFromSession();

        if (tokens?.accessToken) {
            // 백엔드 로그아웃 호출 (쿠키로 토큰 전달)
            const cookieHeader = `access_token=${tokens.accessToken}; refresh_token=${tokens.refreshToken}`;
            const api = createServerApiWithCookies(cookieHeader);
            await api.post('/auth/logout', {}, { validateStatus: () => true });
        }
    } catch (error) {
        console.error('Backend logout error:', error);
    }

    // iron-session 세션 삭제
    await destroySession();

    return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest) {
    try {
        const tokens = await getTokensFromSession();

        if (tokens?.accessToken) {
            const cookieHeader = `access_token=${tokens.accessToken}; refresh_token=${tokens.refreshToken}`;
            const api = createServerApiWithCookies(cookieHeader);
            await api.post('/auth/logout', {}, { validateStatus: () => true });
        }
    } catch (error) {
        console.error('Backend logout error:', error);
    }

    await destroySession();

    return NextResponse.redirect(new URL('/', request.url));
}
