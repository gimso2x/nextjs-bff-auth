import axios from 'axios';

/**
 * Client-side Axios instance.
 * All requests go through the BFF proxy (/api/...) which handles:
 * - Cookie forwarding to backend
 * - Token refresh on 401
 * - Session expiry handling
 */
const clientApi = axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Response interceptor for handling errors
clientApi.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle session expired
        if (error.response?.status === 401) {
            const data = error.response.data;

            if (data?.error === 'SESSION_EXPIRED') {
                if (typeof window !== 'undefined') {
                    window.location.href = '/error-page?code=session_expired';
                }
            }
        }

        return Promise.reject(error);
    }
);

export default clientApi;
