import { NextRequest, NextResponse } from 'next/server';
import { requestWithRefresh } from '@/lib/axios/refresh';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';

/**
 * BFF Proxy Route Handler
 * Forwards all requests to the backend API with authentication handling.
 * 
 * Features:
 * - Forwards cookies to backend
 * - Auto-refreshes tokens on 401
 * - Passes Set-Cookie headers back to client
 */

async function handleRequest(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const pathString = path.join('/');

    // Don't proxy auth routes - they have dedicated handlers
    if (pathString.startsWith('auth/')) {
        return NextResponse.json(
            { error: 'Use dedicated auth endpoints' },
            { status: 400 }
        );
    }

    const cookieHeader = request.headers.get('cookie');
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    const fullPath = searchParams ? `/${pathString}?${searchParams}` : `/${pathString}`;

    // Get request body for non-GET requests
    let body: unknown = undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        try {
            body = await request.json();
        } catch {
            // No body or not JSON
        }
    }

    // Forward headers (excluding host and some hop-by-hop headers)
    const forwardHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => {
        const lowerKey = key.toLowerCase();
        if (!['host', 'connection', 'keep-alive', 'transfer-encoding'].includes(lowerKey)) {
            forwardHeaders[key] = value;
        }
    });

    const result = await requestWithRefresh(
        {
            method: request.method,
            url: fullPath,
            data: body,
            headers: forwardHeaders,
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
            { error: result.error || 'Request failed' },
            { status: 500 }
        );
    }

    // Create response
    const response = NextResponse.json(result.response.data, {
        status: result.response.status,
    });

    // Forward Set-Cookie headers from backend
    if (result.newCookies) {
        result.newCookies.forEach((cookie) => {
            response.headers.append('Set-Cookie', cookie);
        });
    }

    return response;
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
