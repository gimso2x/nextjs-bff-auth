import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

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

export default serverApi;
