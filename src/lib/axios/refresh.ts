import { createServerApiWithCookies } from './server';

interface RefreshResult {
    success: boolean;
    cookies?: string[];
    error?: string;
}

// In-flight refresh promise to prevent multiple simultaneous refresh requests
let refreshPromise: Promise<RefreshResult> | null = null;

/**
 * Attempt to refresh the access token using the refresh token.
 * This function prevents duplicate refresh requests by reusing an in-flight promise.
 */
export async function refreshToken(cookieHeader: string | null): Promise<RefreshResult> {
    // If there's already a refresh in progress, wait for it
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = performRefresh(cookieHeader);

    try {
        const result = await refreshPromise;
        return result;
    } finally {
        refreshPromise = null;
    }
}

async function performRefresh(cookieHeader: string | null): Promise<RefreshResult> {
    try {
        const api = createServerApiWithCookies(cookieHeader);

        // 백엔드의 refresh 엔드포인트 호출
        const response = await api.post('/auth/refresh', {}, {
            validateStatus: (status) => status < 500, // Don't throw on 4xx
        });

        if (response.status === 200) {
            // Extract Set-Cookie headers from response
            const setCookieHeader = response.headers['set-cookie'];

            return {
                success: true,
                cookies: setCookieHeader ? (Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader]) : [],
            };
        }

        return {
            success: false,
            error: 'Refresh token expired or invalid',
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error during refresh',
        };
    }
}

/**
 * Make a request to the backend with automatic token refresh on 401.
 */
export async function requestWithRefresh<T = unknown>(
    config: {
        method: string;
        url: string;
        data?: unknown;
        headers?: Record<string, string>;
    },
    cookieHeader: string | null
): Promise<{ response: { status: number; data: T; headers: Record<string, string | string[]> } | null; newCookies: string[] | null; error: string | null }> {
    const api = createServerApiWithCookies(cookieHeader);

    try {
        // First attempt
        const response = await api.request<T>({
            ...config,
            validateStatus: (status) => status < 500,
        });

        // If successful, return the response
        if (response.status !== 401) {
            const setCookieHeader = response.headers['set-cookie'];
            return {
                response: {
                    status: response.status,
                    data: response.data,
                    headers: response.headers as Record<string, string | string[]>,
                },
                newCookies: setCookieHeader ? (Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader]) : null,
                error: null,
            };
        }

        // On 401, try to refresh the token
        const refreshResult = await refreshToken(cookieHeader);

        if (!refreshResult.success) {
            return {
                response: null,
                newCookies: null,
                error: 'SESSION_EXPIRED',
            };
        }

        // Retry with new cookies
        const newCookieHeader = refreshResult.cookies?.join('; ') || cookieHeader;
        const retryApi = createServerApiWithCookies(newCookieHeader);

        const retryResponse = await retryApi.request<T>({
            ...config,
            validateStatus: (status) => status < 500,
        });

        // If still 401 after refresh, session is truly expired
        if (retryResponse.status === 401) {
            return {
                response: null,
                newCookies: null,
                error: 'SESSION_EXPIRED',
            };
        }

        const setCookieHeader = retryResponse.headers['set-cookie'];
        const combinedCookies = [
            ...(refreshResult.cookies || []),
            ...(setCookieHeader ? (Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader]) : []),
        ];

        return {
            response: {
                status: retryResponse.status,
                data: retryResponse.data,
                headers: retryResponse.headers as Record<string, string | string[]>,
            },
            newCookies: combinedCookies.length > 0 ? combinedCookies : null,
            error: null,
        };
    } catch (error) {
        return {
            response: null,
            newCookies: null,
            error: error instanceof Error ? error.message : 'Request failed',
        };
    }
}
