# 메달프로젝트 (Medal Project)

맞춤 메달 제작 이커머스 사이트

## 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **DB/인증**: Supabase (PostgreSQL + Auth)
- **결제**: KCP
- **배포**: Vercel

## 시작하기

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.local` 파일에 아래 값을 설정하세요:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
KCP_SITE_CD=your_kcp_site_code
KCP_CERT_INFO=your_kcp_cert
```

### 3. Supabase 데이터베이스 설정

Supabase SQL Editor에서 `supabase/schema.sql` 파일의 내용을 실행하세요.

### 4. Supabase Storage 설정

1. Supabase Dashboard → Storage → New bucket
2. 이름: `designs`, Public: 비활성화
3. Storage 정책 설정 (업로드/다운로드)

### 5. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인

## 배포

Vercel에 연결 후 환경변수를 설정하면 자동 배포됩니다.

### Supabase Auth 설정

배포 후 Supabase Dashboard → Authentication → URL Configuration에서:
- **Site URL**: 배포된 URL 입력
- **Redirect URLs**: `배포URL/**` 추가
