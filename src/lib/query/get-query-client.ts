import { QueryClient, isServer } from '@tanstack/react-query';

/**
 * 브라우저와 서버에서 각각 QueryClient를 관리
 * 
 * - 브라우저: 싱글톤 (한 번만 생성)
 * - 서버: 요청마다 새로 생성 (메모리 누수 방지)
 */

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // SSR에서는 즉시 stale 처리하지 않음
                staleTime: 60 * 1000, // 1분
            },
        },
    });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
    if (isServer) {
        // 서버: 항상 새 QueryClient 생성
        return makeQueryClient();
    } else {
        // 브라우저: 싱글톤 패턴
        if (!browserQueryClient) {
            browserQueryClient = makeQueryClient();
        }
        return browserQueryClient;
    }
}
