import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { SessionData, sessionOptions, defaultSession } from './config';

/**
 * 서버 컴포넌트/Route Handler에서 세션 가져오기
 */
export async function getSession() {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    // 기본값 설정
    if (!session.isLoggedIn) {
        session.isLoggedIn = defaultSession.isLoggedIn;
    }

    return session;
}

/**
 * 세션에 토큰 저장
 */
export async function saveTokensToSession(
    accessToken: string,
    refreshToken: string,
    memberCode?: number
) {
    const session = await getSession();

    session.accessToken = accessToken;
    session.refreshToken = refreshToken;
    session.memberCode = memberCode;
    session.isLoggedIn = true;

    await session.save();
}

/**
 * 세션 삭제 (로그아웃)
 */
export async function destroySession() {
    const session = await getSession();
    session.destroy();
}

/**
 * 세션에서 토큰 가져오기
 */
export async function getTokensFromSession() {
    const session = await getSession();

    if (!session.isLoggedIn) {
        return null;
    }

    return {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        memberCode: session.memberCode,
    };
}
