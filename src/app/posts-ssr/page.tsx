import {
    dehydrate,
    HydrationBoundary,
} from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query/get-query-client';
import { postKeys } from '@/lib/query/keys';
import { getServerApiWithAuth } from '@/lib/axios/server';
import PostsClient from './posts-client';

/**
 * SSR + 클라이언트 하이브리드 예제 (인증 포함)
 * 
 * 서버에서 데이터를 미리 fetch하고 (prefetch)
 * 클라이언트에서 hydrate하여 즉시 표시
 * 
 * 인증이 필요한 API도 서버에서 prefetch 가능!
 */

// 공개 API (캐시 가능)
async function getPublicPosts(page: number, limit: number) {
    const response = await fetch(
        `https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${limit}`,
        { next: { revalidate: 60 } } // Next.js 캐시: 60초마다 갱신
    );
    return response.json();
}

// 인증 필요 API (쿠키 전달)
async function getProtectedPosts(page: number, limit: number) {
    const api = await getServerApiWithAuth();
    const response = await api.get(`/posts?page=${page}&limit=${limit}`);
    return response.data;
}

export default async function PostsSSRPage() {
    const queryClient = getQueryClient();

    // 1. 공개 API prefetch (JSONPlaceholder 예제)
    await queryClient.prefetchQuery({
        queryKey: postKeys.list({ page: 1, limit: 10 }),
        queryFn: () => getPublicPosts(1, 10),
    });

    // 2. 인증 필요 API prefetch (주석 해제하여 사용)
    // await queryClient.prefetchQuery({
    //   queryKey: ['protected-posts', { page: 1, limit: 10 }],
    //   queryFn: () => getProtectedPosts(1, 10),
    // });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PostsClient />
        </HydrationBoundary>
    );
}
