# Next.js BFF Auth

Next.js 16 App Router + BFF Proxy + iron-session 인증 스타터

## 🚀 Quick Start

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env.local
# .env.local 수정

# 3. 개발 서버 시작
npm run dev
```

Mock 모드가 기본 활성화되어 있어 백엔드 없이 테스트 가능!
→ http://localhost:3000/dev/login

---

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   ├── [...path]/route.ts    ← 🔌 BFF Proxy (여기서 백엔드 호출)
│   │   └── auth/
│   │       ├── me/               ← 사용자 조회
│   │       └── logout/           ← 로그아웃
│   ├── callback/                 ← SSO 콜백 처리
│   ├── dashboard/                ← 보호된 페이지 예제
│   ├── error-page/               ← 에러 페이지
│   ├── (examples)/               ← 📚 예제 페이지 (삭제 가능)
│   │   ├── posts/                ← CSR + TanStack Query 예제
│   │   └── posts-ssr/            ← SSR Prefetch 예제
│   └── dev/login/                ← 개발용 Mock 로그인
├── lib/
│   ├── config.ts                 ← ⚙️ 설정 (이것만 수정!)
│   ├── index.ts                  ← 통합 export
│   ├── axios/                    ← API 클라이언트
│   ├── query/                    ← TanStack Query
│   └── session/                  ← iron-session
└── middleware.ts                 ← 인증 체크
```

---

## ⚙️ 커스터마이징 체크리스트

### 1단계: 설정 파일 수정 (`src/lib/config.ts`)

```typescript
// 백엔드 URL
API_CONFIG.baseUrl = 'https://your-backend.com';

// SSO 설정
SSO_CONFIG.url = 'https://your-sso.com';
SSO_CONFIG.loginUrl = 'https://sso.com/login';

// 보호된 라우트
AUTH_CONFIG.protectedRoutes = ['/dashboard', '/mypage', '/settings'];
```

### 2단계: 환경변수 설정 (`.env.local`)

```env
BACKEND_API_URL=https://your-backend.com
SSO_URL=https://your-sso.com
SESSION_SECRET=your_32_char_secret_here
MOCK_MODE=false  # 프로덕션에서는 false
```

### 3단계: 콜백 수정 (필요시)

`src/app/callback/route.ts`에서 백엔드 응답 형식에 맞게 수정

---

## 🔐 인증 플로우

```
1. 사용자 → SSO 로그인 페이지
2. SSO → /callback?requestType=login&memberCd=XX
3. BFF → 백엔드 /auth/login 호출 (memberCd 전달)
4. 백엔드 → access_token, refresh_token 반환
5. BFF → iron-session으로 암호화 저장
6. 브라우저 → app_session 쿠키만 보유 (토큰은 숨김!)
```

---

## 📖 사용법

### 클라이언트에서 API 호출

```typescript
import { clientApi, useUser } from '@/lib';

// Axios 직접 사용
const response = await clientApi.get('/posts');

// TanStack Query 사용
const { data: user } = useUser();
```

### 서버 컴포넌트에서 API 호출

```typescript
import { getServerApiWithAuth } from '@/lib';

async function getData() {
  const api = await getServerApiWithAuth();
  const response = await api.get('/protected-data');
  return response.data;
}
```

### 로그아웃

```typescript
import { useLogout } from '@/lib';

function LogoutButton() {
  const { mutate: logout } = useLogout();
  return <button onClick={() => logout()}>로그아웃</button>;
}
```

---

## 🔧 Backend API 요구사항

| Endpoint | Method | Request | Response |
|----------|--------|---------|----------|
| `/auth/login` | POST | `{ memberCode: number }` | `{ access_token, refresh_token }` |
| `/auth/refresh` | POST | Cookie: refresh_token | `{ access_token, refresh_token }` |
| `/auth/logout` | POST | Cookie: access_token | - |
| `/auth/me` | GET | Cookie: access_token | `{ id, email, name, ... }` |

---

## 📦 Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Axios
- TanStack Query
- iron-session

---

## 📄 License

MIT
