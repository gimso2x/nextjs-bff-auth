'use client';

import { usePosts, usePost } from '@/lib/query';
import { useState } from 'react';
import styles from './posts.module.css';

export default function PostsPage() {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [page, setPage] = useState(1);

    const { data: posts, isLoading, error } = usePosts({ page, limit: 10 });
    const { data: selectedPost, isLoading: isPostLoading } = usePost(selectedId || 0);

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>데이터를 불러오는데 실패했습니다.</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Posts</h1>
                <p className={styles.subtitle}>
                    JSONPlaceholder 목업 데이터 · TanStack Query + Query Key Factory
                </p>
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
                <h2>사용 예제</h2>
                <pre className={styles.codeBlock}>
                    {`import { usePosts, usePost, postKeys } from '@/lib/query';

// 목록 조회
const { data: posts } = usePosts({ page: 1, limit: 10 });

// 상세 조회
const { data: post } = usePost(1);

// 쿼리 무효화 (수정/삭제 후)
queryClient.invalidateQueries({ queryKey: postKeys.all });`}
                </pre>
            </section>
        </div>
    );
}
