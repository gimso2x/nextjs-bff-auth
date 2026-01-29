# Next.js BFF Auth

Next.js 16 App Router + BFF Proxy + SSO 인증 스타터 프로젝트

## 🚀 Features

- **BFF Proxy Pattern** - 모든 API 요청을 Next.js를 통해 백엔드로 프록시
- **SSO 인증** - 외부 SSO 서버와 통합된 인증 플로우
- **자동 토큰 갱신** - 401 발생 시 BFF에서 자동으로 refresh 후 재시도
- **TanStack Query** - 서버 상태 관리 및 캐싱
- **Middleware 보호** - 인증이 필요한 라우트 자동 보호

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── [...path]/route.ts       # BFF Proxy (401 자동 refresh)
│   │   └── auth/
│   │       ├── login/route.ts       # SSO 로그인 리다이렉트
│   │       ├── callback/route.ts    # SSO 콜백 → 백엔드 토큰 발급
│   │       ├── logout/route.ts      # 로그아웃
│   │       └── me/route.ts          # 현재 사용자 조회
│   ├── error-page/                  # 에러 페이지
│   ├── dashboard/                   # 보호된 페이지 예제
│   └── layout.tsx                   # QueryProvider 포함
├── lib/
│   ├── axios/
│   │   ├── client.ts                # 클라이언트 Axios
│   │   ├── server.ts                # 서버 Axios
│   │   └── refresh.ts               # 토큰 갱신 로직
│   └── query/
│       ├── provider.tsx             # TanStack Query Provider
│       └── hooks.ts                 # useUser, useLogout
└── middleware.ts                    # 인증 미들웨어
```

## 🔐 Authentication Flow

```
1. 사용자가 SSO 로그인 페이지에서 로그인
2. SSO → /callback?requestType=login&memberCd=40&serviceCode=5000&st=xxx
3. BFF가 memberCd로 백엔드 POST /auth/login 호출
4. 백엔드가 access_token, refresh_token을 httpOnly 쿠키로 반환
5. 홈(/)으로 리다이렉트
```

## 🔄 401 Auto Refresh Flow

```
1. 클라이언트 API 요청 → BFF Proxy
2. BFF → 백엔드 요청 (쿠키 포함)
3. 백엔드 401 응답
4. BFF → /auth/refresh 호출
5. 새 토큰 발급 (Set-Cookie)
6. 원래 요청 재시도
7. 성공 응답 + 새 쿠키 클라이언트에 전달
```

## ⚠️ Error Handling

| 상황 | 리다이렉트 |
|------|-----------|
| 인증 실패 | `/error-page?code=login_failed` |
| 세션 만료 | `/error-page?code=session_expired` |
| 미인증 접근 | `/error-page?code=unauthorized` |

에러 페이지에서 "다시 로그인" 버튼으로 SSO 재시도 가능

## ⚙️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

`.env.local` 파일 수정:

```env
# 백엔드 API
BACKEND_API_URL=http://your-backend-url

# SSO 설정
SSO_URL=http://your-sso-url
SSO_CLIENT_ID=your-client-id
SSO_REDIRECT_URI=http://localhost:3000/api/auth/callback

# SSO 로그인 URL (에러 페이지 재로그인용)
NEXT_PUBLIC_SSO_LOGIN_URL=http://your-sso-login-url

# 쿠키 도메인 (프로덕션용)
COOKIE_DOMAIN=your-domain.com
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### API 호출 (클라이언트)

```typescript
import clientApi from '@/lib/axios/client';

// BFF 프록시를 통해 백엔드 호출
const response = await clientApi.get('/posts');
```

### TanStack Query 사용

```typescript
import { useUser } from '@/lib/query';

function MyComponent() {
  const { data: user, isLoading } = useUser();
  
  if (isLoading) return <div>Loading...</div>;
  
  return <div>Welcome, {user?.name}!</div>;
}
```

### 로그아웃

```typescript
import { useLogout } from '@/lib/query';

function LogoutButton() {
  const { mutate: logout } = useLogout();
  return <button onClick={() => logout()}>로그아웃</button>;
}
```

## 🛡️ Protected Routes

`src/middleware.ts`에서 보호할 라우트 설정:

```typescript
const protectedRoutes = ['/dashboard', '/mypage', '/settings'];
```

## 🔧 Backend Requirements

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | `{ memberCode: number }` → Set-Cookie 반환 |
| `/auth/refresh` | POST | refresh token으로 새 access token 발급 |
| `/auth/logout` | POST | 로그아웃 |
| `/auth/me` | GET | 현재 사용자 정보 |

**쿠키 형식:**
```
access_token=...; Path=/; HttpOnly; SameSite=Strict
refresh_token=...; Path=/; HttpOnly; SameSite=Strict
```

## 📦 Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Axios
- TanStack Query

## 📄 License

MIT
