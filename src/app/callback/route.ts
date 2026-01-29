import { NextRequest, NextResponse } from 'next/server';
import { createServerApiWithCookies } from '@/lib/axios/server';

const MOCK_MODE = process.env.MOCK_MODE === 'true';

/**
 * SSO Callback Route
 * SSO에서 리다이렉트 후 백엔드 /auth/login 호출하여 토큰 발급
 * 
 * SSO에서 넘어오는 쿼리 파라미터:
 * - requestType: 요청 타입 (login 등)
 * - serviceCode: 서비스 코드
 * - memberCd: 회원 코드
 * - st: SSO 토큰
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    const requestType = searchParams.get('requestType');
    const serviceCode = searchParams.get('serviceCode');
    const memberCd = searchParams.get('memberCd');
    const st = searchParams.get('st');

    // 로그인 요청이 아니면 에러
    if (requestType !== 'login') {
        return NextResponse.redirect(
            new URL('/error-page?code=invalid_request_type', request.url)
        );
    }

    // 필수 파라미터 체크
    if (!memberCd) {
        return NextResponse.redirect(
            new URL('/error-page?code=missing_member_code', request.url)
        );
    }

    // 저장된 returnTo 쿠키가 있으면 해당 경로로, 없으면 홈으로
    const returnTo = request.cookies.get('auth_return_to')?.value || '/';

    // ============================================
    // Mock 모드: 백엔드 없이 가짜 토큰 발급
    // ============================================
    if (MOCK_MODE) {
        console.log('[MOCK_MODE] Simulating login for memberCd:', memberCd);

        const response = NextResponse.redirect(new URL(returnTo, request.url));

        // Mock 토큰 생성 (실제로는 유효하지 않음)
        const mockAccessToken = `mock_access_token_${memberCd}_${Date.now()}`;
        const mockRefreshToken = `mock_refresh_token_${memberCd}_${Date.now()}`;

        // 쿠키 설정
        response.cookies.set('access_token', mockAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 15, // 15분
        });

        response.cookies.set('refresh_token', mockRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7일
        });

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
            {
                memberCode: parseInt(memberCd, 10),
                // 필요시 추가 파라미터
                // serviceCode,
                // st,
            },
            {
                validateStatus: (status) => status < 500,
            }
        );

        if (backendResponse.status !== 200) {
            console.error('Backend login error:', backendResponse.data);
            return NextResponse.redirect(
                new URL('/error-page?code=login_failed', request.url)
            );
        }

        // 리다이렉트 응답 생성
        const response = NextResponse.redirect(new URL(returnTo, request.url));

        // 백엔드에서 내려준 Set-Cookie 헤더를 클라이언트에 전달
        const setCookieHeaders = backendResponse.headers['set-cookie'];
        if (setCookieHeaders) {
            const cookies = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
            cookies.forEach((cookie) => {
                response.headers.append('Set-Cookie', cookie);
            });
        }

        // returnTo 쿠키 삭제
        response.cookies.delete('auth_return_to');

        return response;
    } catch (error) {
        console.error('Callback error:', error);
        return NextResponse.redirect(
            new URL('/error-page?code=callback_error', request.url)
        );
    }
}
