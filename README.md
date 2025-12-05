# 🏷️ 뱃지팩토리 - 배포 가이드

실제 인터넷에서 작동하는 뱃지 제작 사이트를 배포하는 완전한 가이드입니다.

---

## 📋 목차

1. [사전 준비물](#1-사전-준비물)
2. [Supabase 설정](#2-supabase-설정-무료)
3. [로컬 개발 환경 설정](#3-로컬-개발-환경-설정)
4. [Vercel 배포](#4-vercel-배포-무료)
5. [도메인 연결 (선택)](#5-도메인-연결-선택)
6. [결제 시스템 연동 (사업용)](#6-결제-시스템-연동-사업용)
7. [문제 해결](#7-문제-해결)

---

## 1. 사전 준비물

### 필수
- [ ] **Node.js** (v18 이상) - https://nodejs.org
- [ ] **Git** - https://git-scm.com
- [ ] **GitHub 계정** - https://github.com
- [ ] **Supabase 계정** (무료) - https://supabase.com
- [ ] **Vercel 계정** (무료) - https://vercel.com

### 컴퓨터에 설치 확인
```bash
node --version   # v18.0.0 이상
npm --version    # 9.0.0 이상
git --version    # 설치되어 있으면 OK
```

---

## 2. Supabase 설정 (무료)

### 2.1 프로젝트 생성

1. https://supabase.com 접속 → **Start your project**
2. GitHub로 로그인
3. **New project** 클릭
4. 설정:
   - **Name**: badge-factory
   - **Database Password**: 강력한 비밀번호 입력 (기억해두세요!)
   - **Region**: Northeast Asia (Tokyo) 선택 (한국에서 가장 빠름)
5. **Create new project** 클릭 → 2분 대기

### 2.2 데이터베이스 테이블 생성

1. 왼쪽 메뉴에서 **SQL Editor** 클릭
2. **New query** 클릭
3. `supabase/schema.sql` 파일의 내용을 전체 복사하여 붙여넣기
4. **Run** 클릭 (또는 Ctrl+Enter)
5. "Success. No rows returned" 메시지 확인

### 2.3 Storage 버킷 생성 (파일 업로드용)

1. 왼쪽 메뉴에서 **Storage** 클릭
2. **New bucket** 클릭
3. 설정:
   - **Name**: designs
   - **Public bucket**: 체크 해제 (비공개)
4. **Create bucket** 클릭

### 2.4 Storage 정책 설정

1. 생성된 `designs` 버킷 클릭
2. **Policies** 탭 클릭
3. **New Policy** → **For full customization** 클릭
4. 아래 내용 입력:

**업로드 정책:**
```
Name: Users can upload designs
Allowed operation: INSERT
Target roles: authenticated
WITH CHECK expression: auth.uid()::text = (storage.foldername(name))[1]
```

**다운로드 정책:**
```
Name: Users can view own designs
Allowed operation: SELECT
Target roles: authenticated
USING expression: auth.uid()::text = (storage.foldername(name))[1]
```

### 2.5 API 키 복사

1. 왼쪽 메뉴에서 **Project Settings** (톱니바퀴) 클릭
2. **API** 클릭
3. 아래 두 값을 메모장에 복사:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGci...` (긴 문자열)

---

## 3. 로컬 개발 환경 설정

### 3.1 프로젝트 폴더로 이동

```bash
cd badge-factory
```

### 3.2 환경변수 설정

```bash
# .env.example을 .env.local로 복사
cp .env.example .env.local
```

`.env.local` 파일을 열어 Supabase 값 입력:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 3.3 패키지 설치 및 실행

```bash
# 패키지 설치 (1-2분 소요)
npm install

# 개발 서버 실행
npm run dev
```

### 3.4 브라우저에서 확인

http://localhost:3000 접속
- 홈페이지가 보이면 성공! ✅
- 회원가입/로그인 테스트
- 주문 테스트

---

## 4. Vercel 배포 (무료)

### 4.1 GitHub에 코드 업로드

```bash
# Git 초기화
git init
git add .
git commit -m "Initial commit"

# GitHub에서 새 Repository 생성 후
git remote add origin https://github.com/YOUR_USERNAME/badge-factory.git
git branch -M main
git push -u origin main
```

### 4.2 Vercel 연결

1. https://vercel.com 접속 → GitHub로 로그인
2. **Add New...** → **Project**
3. **Import Git Repository** → badge-factory 선택
4. **Environment Variables** 섹션에서 추가:
   - `NEXT_PUBLIC_SUPABASE_URL` = (Supabase URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (Supabase anon key)
5. **Deploy** 클릭

### 4.3 배포 완료!

- 배포 완료 후 `https://badge-factory-xxx.vercel.app` 주소 생성
- 이 주소로 전 세계 어디서나 접속 가능!

### 4.4 Supabase 리다이렉트 URL 설정

1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. **Site URL**: `https://your-project.vercel.app`
3. **Redirect URLs**에 추가:
   - `https://your-project.vercel.app/**`

---

## 5. 도메인 연결 (선택)

### 5.1 도메인 구매

추천 도메인 등록업체:
- **가비아** (gabia.com) - 한국
- **Namecheap** (namecheap.com) - 해외

예시: `badgefactory.kr` (약 15,000원/년)

### 5.2 Vercel에 도메인 연결

1. Vercel 프로젝트 → **Settings** → **Domains**
2. 구매한 도메인 입력 → **Add**
3. 표시되는 DNS 설정을 도메인 업체에서 설정

### 5.3 DNS 설정 (가비아 예시)

```
타입: A
호스트: @
값: 76.76.21.21

타입: CNAME
호스트: www
값: cname.vercel-dns.com
```

---

## 6. 결제 시스템 연동 (사업용)

### ⚠️ 사전 요구사항
- **사업자등록증** 필요
- PG사 심사 1-2주 소요

### 6.1 토스페이먼츠 연동 (추천)

1. https://developers.tosspayments.com 접속
2. 회원가입 → 테스트 키 발급
3. `.env.local`에 추가:
```
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_...
TOSS_SECRET_KEY=test_sk_...
```

### 6.2 결제 페이지 구현

```tsx
// src/app/payment/page.tsx
import { loadTossPayments } from '@tosspayments/payment-sdk'

const handlePayment = async (order) => {
  const tossPayments = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY)
  
  await tossPayments.requestPayment('카드', {
    amount: order.total_price,
    orderId: order.order_number,
    orderName: `뱃지 ${order.quantity}개`,
    customerName: order.shipping_name,
    successUrl: `${window.location.origin}/payment/success`,
    failUrl: `${window.location.origin}/payment/fail`,
  })
}
```

### 6.3 실결제 전환

1. 토스페이먼츠에서 사업자 심사 완료
2. 라이브 키 발급
3. 환경변수를 라이브 키로 변경

---

## 7. 문제 해결

### "Module not found" 에러
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Supabase 연결 안 됨
- `.env.local` 파일의 URL과 KEY 확인
- Supabase Dashboard에서 프로젝트가 Active 상태인지 확인

### 로그인이 안 됨
- Supabase → Authentication → URL Configuration에서 Site URL 확인
- 이메일 확인 메일이 스팸함에 있을 수 있음

### 빌드 에러
```bash
npm run build
```
에러 메시지를 확인하고 해당 파일 수정

---

## 📊 예상 비용

| 항목 | 비용 | 비고 |
|------|------|------|
| Supabase | 무료 | 월 500MB DB, 1GB Storage |
| Vercel | 무료 | 월 100GB 대역폭 |
| 도메인 | 1.5-3만원/년 | 선택사항 |
| 토스페이먼츠 | 2.8-3.5% | 거래당 수수료 |

**총: 무료~월 5만원** (트래픽 적을 때)

---

## 🚀 다음 단계

1. **SEO 최적화**: 검색엔진 등록
2. **Google Analytics**: 방문자 분석
3. **관리자 페이지**: 주문 관리 기능
4. **카카오 알림톡**: 주문/배송 알림

---

## 📞 도움이 필요하면

- Supabase 문서: https://supabase.com/docs
- Next.js 문서: https://nextjs.org/docs
- Vercel 문서: https://vercel.com/docs
- 토스페이먼츠: https://docs.tosspayments.com

---

**만든이**: Claude (Anthropic)  
**버전**: 1.0.0  
**최종 수정**: 2024
