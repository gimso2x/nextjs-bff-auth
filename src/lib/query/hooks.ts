import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import clientApi from '../axios/client';
import { authKeys, postKeys } from './keys';

// ============================================
// Types
// ============================================
export interface User {
    id: string;
    email: string;
    name: string;
    memberCode: number;
}

export interface Post {
    id: number;
    userId: number;
    title: string;
    body: string;
}

// ============================================
// Auth Hooks
// ============================================

/**
 * 현재 사용자 정보 조회
 */
export function useUser() {
    return useQuery<User | null>({
        queryKey: authKeys.user(),
        queryFn: async () => {
            try {
                const response = await clientApi.get<User>('/auth/me');
                return response.data;
            } catch {
                return null;
            }
        },
        staleTime: 10 * 60 * 1000,
    });
}

/**
 * 로그아웃
 */
export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            await clientApi.post('/auth/logout');
        },
        onSuccess: () => {
            queryClient.clear();
            if (typeof window !== 'undefined') {
                window.location.href = '/';
            }
        },
    });
}

// ============================================
// Posts Hooks (예제 - JSONPlaceholder 사용)
// ============================================

/**
 * 게시물 목록 조회
 */
export function usePosts(options?: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = options || {};

    return useQuery<Post[]>({
        queryKey: postKeys.list({ page, limit }),
        queryFn: async () => {
            // JSONPlaceholder 직접 호출 (BFF 프록시 우회)
            const response = await fetch(
                `https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${limit}`
            );
            return response.json();
        },
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * 게시물 상세 조회
 */
export function usePost(id: number) {
    return useQuery<Post>({
        queryKey: postKeys.detail(id),
        queryFn: async () => {
            const response = await fetch(
                `https://jsonplaceholder.typicode.com/posts/${id}`
            );
            return response.json();
        },
        enabled: id > 0,
    });
}

// ============================================
// 새로운 도메인 훅 추가 시 여기에 작성
// ============================================
// export function useXxx() {
//   return useQuery({
//     queryKey: xxxKeys.list(),
//     queryFn: async () => {
//       const response = await clientApi.get('/xxx');
//       return response.data;
//     },
//   });
// }
