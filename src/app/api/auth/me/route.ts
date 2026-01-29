import { NextRequest, NextResponse } from 'next/server';
import { requestWithRefresh } from '@/lib/axios/refresh';

/**
 * Get Current User Route
 * Returns the currently authenticated user's information.
 */
export async function GET(request: NextRequest) {
    const cookieHeader = request.headers.get('cookie');

    const result = await requestWithRefresh(
        {
            method: 'GET',
            url: '/auth/me',
        },
        cookieHeader
    );

    // Handle session expired
    if (result.error === 'SESSION_EXPIRED') {
        return NextResponse.json(
            { error: 'SESSION_EXPIRED', redirect: '/login?reason=session_expired' },
            { status: 401 }
        );
    }

    // Handle other errors
    if (result.error || !result.response) {
        return NextResponse.json(
            { error: result.error || 'Failed to get user' },
            { status: 500 }
        );
    }

    // Create response with user data
    const response = NextResponse.json(result.response.data, {
        status: result.response.status,
    });

    // Forward any new cookies (from token refresh)
    if (result.newCookies) {
        result.newCookies.forEach((cookie) => {
            response.headers.append('Set-Cookie', cookie);
        });
    }

    return response;
}
