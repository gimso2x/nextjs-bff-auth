/**
 * 🎯 Lib 통합 Export
 * 
 * 모든 라이브러리 기능을 한 곳에서 import할 수 있습니다.
 * 
 * @example
 * import { clientApi, useUser, getSession, API_CONFIG } from '@/lib';
 */

// 설정
export * from './config';

// Axios
export { default as clientApi } from './axios/client';
export { default as serverApi, createServerApiWithCookies, getServerApiWithAuth } from './axios/server';

// 세션 (iron-session)
export { getSession, saveTokensToSession, destroySession, getTokensFromSession } from './session';
export type { SessionData } from './session/config';

// TanStack Query
export { default as QueryProvider } from './query/provider';
export { useUser, useLogout, usePosts, usePost } from './query/hooks';
export { getQueryClient } from './query/get-query-client';
export * from './query/keys';
