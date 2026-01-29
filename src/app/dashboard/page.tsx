'use client';

import { useUser, useLogout } from '@/lib/query';
import styles from './dashboard.module.css';

export default function DashboardPage() {
    const { data: user, isLoading, error } = useUser();
    const logoutMutation = useLogout();

    const handleLogout = () => {
        logoutMutation.mutate();
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>로딩 중...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    사용자 정보를 불러오는데 실패했습니다.
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>대시보드</h1>
                <button
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className={styles.logoutButton}
                >
                    {logoutMutation.isPending ? '로그아웃 중...' : '로그아웃'}
                </button>
            </header>

            <main className={styles.main}>
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>사용자 정보</h2>
                    {user ? (
                        <div className={styles.userInfo}>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>이름:</span>
                                <span className={styles.value}>{user.name}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>이메일:</span>
                                <span className={styles.value}>{user.email}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>ID:</span>
                                <span className={styles.value}>{user.id}</span>
                            </div>
                        </div>
                    ) : (
                        <p className={styles.noUser}>사용자 정보가 없습니다.</p>
                    )}
                </div>

                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>TanStack Query 사용 예제</h2>
                    <pre className={styles.codeBlock}>
                        {`import { useUser } from '@/lib/query';

function MyComponent() {
  const { data: user, isLoading } = useUser();
  
  if (isLoading) return <div>Loading...</div>;
  
  return <div>Welcome, {user?.name}!</div>;
}`}
                    </pre>
                </div>
            </main>
        </div>
    );
}
