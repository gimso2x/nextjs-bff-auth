import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromSession, saveTokensToSession } from '@/lib/session';
import { createServerApiWithCookies } from '@/lib/axios/server';

const MOCK_MODE = process.env.MOCK_MODE === 'true';

/**
 * BFF Proxy Route Handler (iron-session 버전)
 * 
 * iron-session에서 토큰을 읽어 백엔드에 쿠키로 전달
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

    // Forward headers (cookie 제외 - 직접 설정)
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
        // 토큰을 쿠키 형식으로 변환하여 백엔드에 전달
        const cookieHeader = `access_token=${tokens.accessToken}; refresh_token=${tokens.refreshToken}`;
        const api = createServerApiWithCookies(cookieHeader);

        const response = await api.request({
            method: request.method,
            url: fullPath,
            data: body,
            headers: forwardHeaders,
            validateStatus: (status) => status < 500,
        });

        // 401이면 refresh 시도
        if (response.status === 401 && tokens.refreshToken) {
            const refreshCookie = `refresh_token=${tokens.refreshToken}`;
            const refreshResult = await tryRefreshToken(refreshCookie);

            if (refreshResult.success && refreshResult.accessToken) {
                // 새 토큰 저장
                await saveTokensToSession(
                    refreshResult.accessToken,
                    refreshResult.refreshToken || tokens.refreshToken,
                    tokens.memberCode
                );

                // 재시도
                const newCookieHeader = `access_token=${refreshResult.accessToken}; refresh_token=${refreshResult.refreshToken || tokens.refreshToken}`;
                const retryApi = createServerApiWithCookies(newCookieHeader);

                const retryResponse = await retryApi.request({
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

/**
 * Refresh token using cookie
 */
async function tryRefreshToken(refreshCookie: string): Promise<{
    success: boolean;
    accessToken?: string;
    refreshToken?: string;
}> {
    try {
        const api = createServerApiWithCookies(refreshCookie);

        const response = await api.post('/auth/refresh', {}, {
            validateStatus: (status) => status < 500,
        });

        if (response.status === 200) {
            // 백엔드가 JSON으로 토큰을 반환하는 경우
            if (response.data.access_token) {
                return {
                    success: true,
                    accessToken: response.data.access_token,
                    refreshToken: response.data.refresh_token,
                };
            }

            // 백엔드가 Set-Cookie로 토큰을 반환하는 경우
            const setCookieHeader = response.headers['set-cookie'];
            if (setCookieHeader) {
                const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
                const accessToken = extractTokenFromCookies(cookies, 'access_token');
                const refreshToken = extractTokenFromCookies(cookies, 'refresh_token');

                if (accessToken) {
                    return { success: true, accessToken, refreshToken };
                }
            }
        }

        return { success: false };
    } catch {
        return { success: false };
    }
}

/**
 * Set-Cookie 헤더에서 토큰 추출
 */
function extractTokenFromCookies(cookies: string[], tokenName: string): string | undefined {
    for (const cookie of cookies) {
        const match = cookie.match(new RegExp(`${tokenName}=([^;]+)`));
        if (match) {
            return match[1];
        }
    }
    return undefined;
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
