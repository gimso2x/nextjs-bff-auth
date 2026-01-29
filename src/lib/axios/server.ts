import axios from 'axios';
import { cookies } from 'next/headers';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';

/**
 * Server-side Axios instance for use in Route Handlers and Server Components.
 * This instance should be used with cookies passed from the request.
 */
export const serverApi = axios.create({
  baseURL: BACKEND_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Create a server API instance with cookies from the request.
 * Use this in Route Handlers to forward authentication cookies to the backend.
 */
export function createServerApiWithCookies(cookieHeader: string | null) {
  const instance = axios.create({
    baseURL: BACKEND_API_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
  });

  return instance;
}

/**
 * Get server API with cookies from Next.js cookies() helper.
 * Use this in Server Components for authenticated SSR prefetch.
 * 
 * @example
 * // In a Server Component
 * const api = await getServerApiWithAuth();
 * const data = await api.get('/protected-data');
 */
export async function getServerApiWithAuth() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  // 쿠키를 헤더 형식으로 변환
  const cookieHeader = allCookies
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join('; ');

  return createServerApiWithCookies(cookieHeader || null);
}

export default serverApi;
