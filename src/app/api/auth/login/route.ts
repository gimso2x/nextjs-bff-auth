import { NextRequest, NextResponse } from 'next/server';

const SSO_URL = process.env.SSO_URL || 'http://localhost:9000';
const SSO_CLIENT_ID = process.env.SSO_CLIENT_ID || 'your-client-id';
const SSO_REDIRECT_URI = process.env.SSO_REDIRECT_URI || 'http://localhost:3000/api/auth/callback';

/**
 * SSO Login Route
 * Redirects user to SSO server for authentication.
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const returnTo = searchParams.get('returnTo') || '/dashboard';

    // Store return URL in a cookie for use after callback
    const response = NextResponse.redirect(
        `${SSO_URL}/authorize?` +
        new URLSearchParams({
            client_id: SSO_CLIENT_ID,
            redirect_uri: SSO_REDIRECT_URI,
            response_type: 'code',
            scope: 'openid profile email',
            state: encodeURIComponent(returnTo),
        }).toString()
    );

    // Set return URL cookie (used after SSO callback)
    response.cookies.set('auth_return_to', returnTo, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 5, // 5 minutes
    });

    return response;
}
