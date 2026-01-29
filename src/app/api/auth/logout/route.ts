import { NextRequest, NextResponse } from 'next/server';
import { createServerApiWithCookies } from '@/lib/axios/server';

/**
 * Logout Route
 * Clears authentication by calling backend logout and removing cookies.
 */
export async function POST(request: NextRequest) {
    const cookieHeader = request.headers.get('cookie');

    try {
        const api = createServerApiWithCookies(cookieHeader);
        await api.post('/auth/logout', {}, {
            validateStatus: () => true,
        });
    } catch (error) {
        console.error('Backend logout error:', error);
    }

    // Create response that clears auth cookies
    const response = NextResponse.json({ success: true });

    const cookiesToClear = ['access_token', 'refresh_token'];

    cookiesToClear.forEach((name) => {
        response.cookies.set(name, '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(0),
            path: '/',
            domain: process.env.COOKIE_DOMAIN || undefined,
        });
    });

    return response;
}

/**
 * GET handler for logout link (redirect version)
 */
export async function GET(request: NextRequest) {
    const cookieHeader = request.headers.get('cookie');

    try {
        const api = createServerApiWithCookies(cookieHeader);
        await api.post('/auth/logout', {}, {
            validateStatus: () => true,
        });
    } catch (error) {
        console.error('Backend logout error:', error);
    }

    // 로그아웃 후 홈으로 리다이렉트
    const response = NextResponse.redirect(new URL('/', request.url));

    const cookiesToClear = ['access_token', 'refresh_token'];

    cookiesToClear.forEach((name) => {
        response.cookies.set(name, '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(0),
            path: '/',
            domain: process.env.COOKIE_DOMAIN || undefined,
        });
    });

    return response;
}
