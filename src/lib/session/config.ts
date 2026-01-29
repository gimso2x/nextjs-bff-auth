import { SessionOptions } from 'iron-session';
import { SESSION_CONFIG } from '@/lib/config';

/**
 * 세션에 저장할 데이터 타입
 */
export interface SessionData {
    accessToken?: string;
    refreshToken?: string;
    memberCode?: number;
    isLoggedIn: boolean;
}

/**
 * 기본 세션 값
 */
export const defaultSession: SessionData = {
    isLoggedIn: false,
};

/**
 * iron-session 설정
 * 설정 변경: lib/config.ts → SESSION_CONFIG
 */
export const sessionOptions: SessionOptions = {
    password: SESSION_CONFIG.password,
    cookieName: SESSION_CONFIG.cookieName,
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax' as const,
        maxAge: SESSION_CONFIG.maxAge,
    },
};
