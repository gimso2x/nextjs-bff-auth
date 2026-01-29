import axios from 'axios';

/**
 * 🔌 클라이언트 사이드 Axios 인스턴스
 * 
 * 브라우저에서 BFF Proxy(/api/...)를 통해 백엔드 호출
 * 쿠키는 자동으로 포함됨 (withCredentials: true)
 */
const clientApi = axios.create({
    baseURL: '/api',
    timeout: 10000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default clientApi;
