'use client';

import { usePosts, usePost } from '@/lib/query';
import { useState } from 'react';
import styles from './posts-ssr.module.css';

/**
 * 클라이언트 컴포넌트
 * 서버에서 prefetch된 데이터를 즉시 사용 (로딩 없음!)
 */
export default function PostsClient() {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [page, setPage] = useState(1);

    // 페이지 1은 서버에서 이미 prefetch됨 → 즉시 표시!
    const { data: posts, isLoading, isFetching } = usePosts({ page, limit: 10 });
    const { data: selectedPost, isLoading: isPostLoading } = usePost(selectedId || 0);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Posts (SSR Hybrid)</h1>
                <p className={styles.subtitle}>
                    서버에서 prefetch → 클라이언트에서 hydrate
                </p>
                <div className={styles.badge}>
                    {isFetching ? '🔄 갱신 중...' : '✅ 서버에서 미리 로딩됨'}
                </div>
            </header>

            <div className={styles.content}>
                {/* 목록 */}
                <section className={styles.listSection}>
                    <div className={styles.listHeader}>
                        <h2>목록</h2>
                        <div className={styles.pagination}>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className={styles.pageBtn}
                            >
                                ←
                            </button>
                            <span>Page {page}</span>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                className={styles.pageBtn}
                            >
                                →
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className={styles.loading}>로딩 중...</div>
                    ) : (
                        <ul className={styles.list}>
                            {posts?.map((post) => (
                                <li
                                    key={post.id}
                                    className={`${styles.listItem} ${selectedId === post.id ? styles.selected : ''}`}
                                    onClick={() => setSelectedId(post.id)}
                                >
                                    <span className={styles.postId}>#{post.id}</span>
                                    <span className={styles.postTitle}>{post.title}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* 상세 */}
                <section className={styles.detailSection}>
                    <h2>상세</h2>
                    {selectedId ? (
                        isPostLoading ? (
                            <div className={styles.loading}>로딩 중...</div>
                        ) : selectedPost ? (
                            <article className={styles.article}>
                                <h3 className={styles.articleTitle}>{selectedPost.title}</h3>
                                <p className={styles.articleBody}>{selectedPost.body}</p>
                                <div className={styles.articleMeta}>
                                    Post ID: {selectedPost.id} · User ID: {selectedPost.userId}
                                </div>
                            </article>
                        ) : null
                    ) : (
                        <div className={styles.placeholder}>
                            왼쪽 목록에서 게시물을 선택하세요
                        </div>
                    )}
                </section>
            </div>

            {/* 코드 예제 */}
            <section className={styles.codeSection}>
                <h2>SSR Prefetch 코드</h2>
                <pre className={styles.codeBlock}>
                    {`// page.tsx (Server Component)
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

export default async function Page() {
  const queryClient = new QueryClient();

  // 서버에서 미리 fetch
  await queryClient.prefetchQuery({
    queryKey: postKeys.list({ page: 1, limit: 10 }),
    queryFn: () => getPosts(1, 10),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientComponent />
    </HydrationBoundary>
  );
}`}
                </pre>
            </section>
        </div>
    );
}
