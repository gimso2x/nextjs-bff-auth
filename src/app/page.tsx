import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Next.js BFF Auth
        </h1>

        <p className={styles.description}>
          Next.js App Router + BFF Proxy + SSO 인증 스타터
        </p>

        <div className={styles.features}>
          <div className={styles.feature}>
            <h3>🔐 SSO 인증</h3>
            <p>외부 SSO 서버와 통합된 인증 플로우</p>
          </div>

          <div className={styles.feature}>
            <h3>🔄 자동 토큰 갱신</h3>
            <p>401 발생 시 BFF에서 자동 refresh</p>
          </div>

          <div className={styles.feature}>
            <h3>📦 TanStack Query</h3>
            <p>서버 상태 관리 및 캐싱</p>
          </div>

          <div className={styles.feature}>
            <h3>🛡️ 미들웨어 보호</h3>
            <p>인증이 필요한 라우트 자동 보호</p>
          </div>
        </div>

        <div className={styles.actions}>
          <Link href="/login" className={styles.primaryButton}>
            로그인
          </Link>
          <Link href="/dashboard" className={styles.secondaryButton}>
            대시보드
          </Link>
        </div>
      </main>
    </div>
  );
}
