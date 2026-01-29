/**
 * 🔧 프로젝트 설정 중앙 관리
 * 
 * 환경변수와 설정값을 한 곳에서 관리합니다.
 * 프로젝트를 시작할 때 이 파일을 먼저 수정하세요.
 */

// ============================================
// 백엔드 API 설정
// ============================================
export const API_CONFIG = {
    /** 백엔드 API 기본 URL */
    baseUrl: process.env.BACKEND_API_URL || 'http://localhost:8080',

    /** API 요청 타임아웃 (ms) */
    timeout: 10000,
} as const;

// ============================================
// SSO 설정
// ============================================
export const SSO_CONFIG = {
    /** SSO 서버 URL */
    url: process.env.SSO_URL || 'http://localhost:9000',

    /** SSO 클라이언트 ID */
    clientId: process.env.SSO_CLIENT_ID || 'your-client-id',

    /** SSO 콜백 URL */
    redirectUri: process.env.SSO_REDIRECT_URI || 'http://localhost:3000/callback',

    /** SSO 로그인 페이지 URL (에러 페이지용) */
    loginUrl: process.env.NEXT_PUBLIC_SSO_LOGIN_URL || '/dev/login',
} as const;

// ============================================
// 세션 설정 (iron-session)
// ============================================
export const SESSION_CONFIG = {
    /** 세션 암호화 비밀키 (32자 이상) */
    password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',

    /** 세션 쿠키 이름 */
    cookieName: 'app_session',

    /** 세션 만료 시간 (초) - 기본 7일 */
    maxAge: 60 * 60 * 24 * 7,
} as const;

// ============================================
// 인증 라우트 설정
// ============================================
export const AUTH_CONFIG = {
    /** 인증이 필요한 라우트 목록 */
    protectedRoutes: ['/dashboard', '/mypage'],

    /** 인증 없이 접근 가능한 라우트 */
    publicRoutes: ['/', '/error-page', '/dev/login', '/callback'],

    /** 로그인 성공 후 기본 리다이렉트 */
    defaultRedirect: '/',

    /** 에러 페이지 경로 */
    errorPage: '/error-page',
} as const;

// ============================================
// 개발 모드 설정
// ============================================
export const DEV_CONFIG = {
    /** Mock 모드 활성화 (백엔드 없이 테스트) */
    mockMode: process.env.MOCK_MODE === 'true',
} as const;
