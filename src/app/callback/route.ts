import { NextRequest, NextResponse } from 'next/server';
import { createServerApiWithCookies } from '@/lib/axios/server';
import { saveTokensToSession } from '@/lib/session';

const MOCK_MODE = process.env.MOCK_MODE === 'true';

/**
 * SSO Callback Route (iron-session 버전)
 * 
 * 백엔드에서 받은 토큰을 iron-session으로 암호화하여 저장
 * 브라우저에는 암호화된 세션 쿠키만 보임
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    const requestType = searchParams.get('requestType');
    const memberCd = searchParams.get('memberCd');

    if (requestType !== 'login') {
        return NextResponse.redirect(
            new URL('/error-page?code=invalid_request_type', request.url)
        );
    }

    if (!memberCd) {
        return NextResponse.redirect(
            new URL('/error-page?code=missing_member_code', request.url)
        );
    }

    const memberCode = parseInt(memberCd, 10);
    const returnTo = request.cookies.get('auth_return_to')?.value || '/';

    // ============================================
    // Mock 모드
    // ============================================
    if (MOCK_MODE) {
        console.log('[MOCK_MODE] Simulating login for memberCd:', memberCd);

        // iron-session에 Mock 토큰 저장
        await saveTokensToSession(
            `mock_access_token_${memberCd}_${Date.now()}`,
            `mock_refresh_token_${memberCd}_${Date.now()}`,
            memberCode
        );

        const response = NextResponse.redirect(new URL(returnTo, request.url));

        // 이전 버전 쿠키 삭제 (iron-session 전환 시)
        response.cookies.delete('access_token');
        response.cookies.delete('refresh_token');
        response.cookies.delete('auth_return_to');

        return response;
    }

    // ============================================
    // 실제 모드: 백엔드 API 호출
    // ============================================
    try {
        const api = createServerApiWithCookies(null);

        const backendResponse = await api.post(
            '/auth/login',
            { memberCode },
            { validateStatus: (status) => status < 500 }
        );

        if (backendResponse.status !== 200) {
            console.error('Backend login error:', backendResponse.data);
            return NextResponse.redirect(
                new URL('/error-page?code=login_failed', request.url)
            );
        }

        // 백엔드 응답에서 토큰 추출
        // 백엔드가 JSON으로 토큰을 보내는 경우:
        const { access_token, refresh_token } = backendResponse.data;

        // 또는 Set-Cookie 헤더에서 추출하는 경우:
        // const setCookieHeaders = backendResponse.headers['set-cookie'];
        // const accessToken = extractTokenFromCookie(setCookieHeaders, 'access_token');
        // const refreshToken = extractTokenFromCookie(setCookieHeaders, 'refresh_token');

        // iron-session에 토큰 저장 (암호화됨)
        await saveTokensToSession(access_token, refresh_token, memberCode);

        const response = NextResponse.redirect(new URL(returnTo, request.url));
        response.cookies.delete('auth_return_to');

        return response;
    } catch (error) {
        console.error('Callback error:', error);
        return NextResponse.redirect(
            new URL('/error-page?code=callback_error', request.url)
        );
    }
}
