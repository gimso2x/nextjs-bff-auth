import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromSession, destroySession } from '@/lib/session';
import { createServerApiWithCookies } from '@/lib/axios/server';

/**
 * Logout Route (iron-session 버전)
 */
export async function POST(request: NextRequest) {
    try {
        // 세션에서 토큰 가져오기
        const tokens = await getTokensFromSession();

        if (tokens?.accessToken) {
            // 백엔드 로그아웃 호출
            const api = createServerApiWithCookies(null);
            api.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
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
            const api = createServerApiWithCookies(null);
            api.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
            await api.post('/auth/logout', {}, { validateStatus: () => true });
        }
    } catch (error) {
        console.error('Backend logout error:', error);
    }

    await destroySession();

    return NextResponse.redirect(new URL('/', request.url));
}
