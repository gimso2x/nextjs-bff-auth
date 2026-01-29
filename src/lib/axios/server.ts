import axios from 'axios';
import { cookies } from 'next/headers';
import { API_CONFIG } from '@/lib/config';

/**
 * 🔌 서버 사이드 Axios 인스턴스
 * 
 * Route Handler와 Server Component에서 사용
 * 설정 변경: lib/config.ts → API_CONFIG
 */
export const serverApi = axios.create({
  baseURL: API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 쿠키를 포함한 서버 API 생성
 * Route Handler에서 백엔드 호출 시 사용
 */
export function createServerApiWithCookies(cookieHeader: string | null) {
  const instance = axios.create({
    baseURL: API_CONFIG.baseUrl,
    timeout: API_CONFIG.timeout,
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
  });

  return instance;
}

/**
 * Next.js cookies()를 사용한 인증 API 생성
 * Server Component에서 인증이 필요한 API 호출 시 사용
 * 
 * @example
 * const api = await getServerApiWithAuth();
 * const data = await api.get('/protected-endpoint');
 */
export async function getServerApiWithAuth() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  const cookieHeader = allCookies
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join('; ');

  return createServerApiWithCookies(cookieHeader || null);
}

export default serverApi;
