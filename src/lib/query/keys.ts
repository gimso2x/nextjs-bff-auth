/**
 * Query Key Factory
 * 
 * 모든 쿼리 키를 중앙에서 관리합니다.
 * - 키 중복 방지
 * - 자동완성 지원
 * - 관련 쿼리 일괄 무효화 가능
 * 
 * @example
 * // 목록 조회
 * useQuery({ queryKey: postKeys.list(), queryFn: ... })
 * 
 * // 상세 조회
 * useQuery({ queryKey: postKeys.detail(1), queryFn: ... })
 * 
 * // 관련 쿼리 무효화
 * queryClient.invalidateQueries({ queryKey: postKeys.all })
 */

// ============================================
// Auth
// ============================================
export const authKeys = {
    all: ['auth'] as const,
    user: () => [...authKeys.all, 'user'] as const,
};

// ============================================
// Posts (예제)
// ============================================
export const postKeys = {
    all: ['posts'] as const,
    list: (filters?: { page?: number; limit?: number }) =>
        [...postKeys.all, 'list', filters] as const,
    detail: (id: number) => [...postKeys.all, 'detail', id] as const,
};

// ============================================
// Users (예제)
// ============================================
export const userKeys = {
    all: ['users'] as const,
    list: () => [...userKeys.all, 'list'] as const,
    detail: (id: number) => [...userKeys.all, 'detail', id] as const,
};

// ============================================
// 새로운 도메인 추가 시 여기에 작성
// ============================================
// export const xxxKeys = {
//   all: ['xxx'] as const,
//   list: () => [...xxxKeys.all, 'list'] as const,
//   detail: (id: number) => [...xxxKeys.all, 'detail', id] as const,
// };
