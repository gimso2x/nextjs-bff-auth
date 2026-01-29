import { SessionOptions } from 'iron-session';

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
 */
export const sessionOptions: SessionOptions = {
    password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
    cookieName: 'app_session',
    cookieOptions: {
        // secure: true in production
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax' as const,
        maxAge: 60 * 60 * 24 * 7, // 7 days
    },
};
