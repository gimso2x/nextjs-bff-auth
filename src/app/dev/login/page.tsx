'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dev-login.module.css';

/**
 * 개발용 Mock 로그인 페이지
 * SSO 로그인을 시뮬레이션합니다.
 * 
 * ⚠️ 프로덕션에서는 이 페이지를 제거하거나 비활성화하세요!
 */
export default function DevLoginPage() {
    const router = useRouter();
    const [memberCd, setMemberCd] = useState('40');
    const [serviceCode, setServiceCode] = useState('5000');

    const handleLogin = () => {
        // SSO 콜백을 시뮬레이션
        const callbackUrl = `/callback?requestType=login&serviceCode=${serviceCode}&memberCd=${memberCd}&st=MOCK_SSO_TOKEN`;
        router.push(callbackUrl);
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.badge}>⚠️ 개발 전용</div>
                <h1 className={styles.title}>Mock 로그인</h1>
                <p className={styles.description}>
                    SSO 로그인을 시뮬레이션합니다.<br />
                    프로덕션에서는 이 페이지를 제거하세요.
                </p>

                <div className={styles.form}>
                    <div className={styles.field}>
                        <label className={styles.label}>Member Code</label>
                        <input
                            type="number"
                            value={memberCd}
                            onChange={(e) => setMemberCd(e.target.value)}
                            className={styles.input}
                            placeholder="40"
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Service Code</label>
                        <input
                            type="text"
                            value={serviceCode}
                            onChange={(e) => setServiceCode(e.target.value)}
                            className={styles.input}
                            placeholder="5000"
                        />
                    </div>

                    <button onClick={handleLogin} className={styles.button}>
                        Mock 로그인 실행
                    </button>
                </div>

                <div className={styles.info}>
                    <p>이 버튼을 클릭하면 다음 URL로 이동합니다:</p>
                    <code className={styles.code}>
                        /callback?requestType=login&memberCd={memberCd}&...
                    </code>
                </div>
            </div>
        </div>
    );
}
