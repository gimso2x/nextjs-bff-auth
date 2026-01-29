'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import styles from './error.module.css';

const ERROR_MESSAGES: Record<string, string> = {
    invalid_request_type: '잘못된 요청입니다.',
    missing_member_code: '회원 정보가 누락되었습니다.',
    login_failed: '로그인에 실패했습니다.',
    callback_error: '인증 처리 중 오류가 발생했습니다.',
    session_expired: '세션이 만료되었습니다.',
    unauthorized: '인증이 필요합니다.',
    default: '알 수 없는 오류가 발생했습니다.',
};

function ErrorContent() {
    const searchParams = useSearchParams();
    const errorCode = searchParams.get('code') || 'default';
    const errorMessage = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.default;

    const ssoLoginUrl = process.env.NEXT_PUBLIC_SSO_LOGIN_URL || '/api/auth/login';

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.icon}>⚠️</div>
                <h1 className={styles.title}>오류 발생</h1>
                <p className={styles.message}>{errorMessage}</p>
                <p className={styles.code}>오류 코드: {errorCode}</p>

                <div className={styles.actions}>
                    <a href={ssoLoginUrl} className={styles.primaryButton}>
                        다시 로그인
                    </a>
                    <Link href="/" className={styles.secondaryButton}>
                        홈으로
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function ErrorPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ErrorContent />
        </Suspense>
    );
}
