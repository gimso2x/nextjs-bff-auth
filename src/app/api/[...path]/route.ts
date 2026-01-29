import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromSession, saveTokensToSession } from '@/lib/session';
import { createServerApiWithCookies } from '@/lib/axios/server';

const MOCK_MODE = process.env.MOCK_MODE === 'true';

/**
 * BFF Proxy Route Handler (iron-session 버전)
 * 
 * iron-session에서 토큰을 읽어 백엔드에 Authorization 헤더로 전달
 */
async function handleRequest(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const pathString = path.join('/');

    // auth routes는 전용 핸들러 사용
    if (pathString.startsWith('auth/')) {
        return NextResponse.json(
            { error: 'Use dedicated auth endpoints' },
            { status: 400 }
        );
    }

    // iron-session에서 토큰 가져오기
    const tokens = await getTokensFromSession();

    if (!tokens?.accessToken) {
        return NextResponse.json(
            { error: 'SESSION_EXPIRED', redirect: '/error-page?code=session_expired' },
            { status: 401 }
        );
    }

    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    const fullPath = searchParams ? `/${pathString}?${searchParams}` : `/${pathString}`;

    // Get request body
    let body: unknown = undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        try {
            body = await request.json();
        } catch {
            // No body
        }
    }

    // Forward headers
    const forwardHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => {
        const lowerKey = key.toLowerCase();
        if (!['host', 'connection', 'keep-alive', 'transfer-encoding', 'cookie'].includes(lowerKey)) {
            forwardHeaders[key] = value;
        }
    });

    // Mock 모드
    if (MOCK_MODE) {
        return NextResponse.json({
            message: 'Mock response',
            path: fullPath,
            method: request.method,
        });
    }

    try {
        const api = createServerApiWithCookies(null);

        // Authorization 헤더로 토큰 전달
        api.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;

        const response = await api.request({
            method: request.method,
            url: fullPath,
            data: body,
            headers: forwardHeaders,
            validateStatus: (status) => status < 500,
        });

        // 401이면 refresh 시도
        if (response.status === 401 && tokens.refreshToken) {
            const refreshResult = await tryRefreshToken(tokens.refreshToken);

            if (refreshResult.success && refreshResult.accessToken) {
                // 새 토큰 저장
                await saveTokensToSession(
                    refreshResult.accessToken,
                    refreshResult.refreshToken || tokens.refreshToken,
                    tokens.memberCode
                );

                // 재시도
                api.defaults.headers.common['Authorization'] = `Bearer ${refreshResult.accessToken}`;
                const retryResponse = await api.request({
                    method: request.method,
                    url: fullPath,
                    data: body,
                    headers: forwardHeaders,
                    validateStatus: (status) => status < 500,
                });

                return NextResponse.json(retryResponse.data, { status: retryResponse.status });
            }

            return NextResponse.json(
                { error: 'SESSION_EXPIRED', redirect: '/error-page?code=session_expired' },
                { status: 401 }
            );
        }

        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { error: 'Request failed' },
            { status: 500 }
        );
    }
}

async function tryRefreshToken(refreshToken: string): Promise<{
    success: boolean;
    accessToken?: string;
    refreshToken?: string;
}> {
    try {
        const api = createServerApiWithCookies(null);
        api.defaults.headers.common['Authorization'] = `Bearer ${refreshToken}`;

        const response = await api.post('/auth/refresh', {}, {
            validateStatus: (status) => status < 500,
        });

        if (response.status === 200) {
            return {
                success: true,
                accessToken: response.data.access_token,
                refreshToken: response.data.refresh_token,
            };
        }

        return { success: false };
    } catch {
        return { success: false };
    }
}

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    return handleRequest(request, context);
}

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    return handleRequest(request, context);
}

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    return handleRequest(request, context);
}

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    return handleRequest(request, context);
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    return handleRequest(request, context);
}
