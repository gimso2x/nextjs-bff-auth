import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromSession } from '@/lib/session';
import { createServerApiWithCookies } from '@/lib/axios/server';

const MOCK_MODE = process.env.MOCK_MODE === 'true';

/**
 * Get Current User Route (iron-session 버전)
 */
export async function GET(request: NextRequest) {
    // iron-session에서 토큰 가져오기
    const tokens = await getTokensFromSession();

    if (!tokens?.accessToken) {
        return NextResponse.json(
            { error: 'SESSION_EXPIRED', redirect: '/error-page?code=session_expired' },
            { status: 401 }
        );
    }

    // Mock 모드
    if (MOCK_MODE) {
        return NextResponse.json({
            id: String(tokens.memberCode || 1),
            email: `user${tokens.memberCode}@example.com`,
            name: `Mock User ${tokens.memberCode}`,
            memberCode: tokens.memberCode,
        });
    }

    // 실제 백엔드 호출
    try {
        const api = createServerApiWithCookies(null);
        api.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;

        const response = await api.get('/auth/me', {
            validateStatus: (status) => status < 500,
        });

        if (response.status === 401) {
            // TODO: refresh token으로 갱신 시도
            return NextResponse.json(
                { error: 'SESSION_EXPIRED', redirect: '/error-page?code=session_expired' },
                { status: 401 }
            );
        }

        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { error: 'Failed to get user' },
            { status: 500 }
        );
    }
}
