'use client'

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

/**
 * OAuth 인증 후 `?code=...`가 `/` 같은 페이지로 떨어지는 경우를 대비한 안전장치입니다.
 * `/auth/callback` 라우트에서 code → session 교환을 수행하므로,
 * code가 감지되면 해당 라우트로 즉시 이동시킵니다.
 */
export default function AuthCodeRedirect() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // URL에서 직접 code 파라미터 추출 (useSearchParams보다 안전)
    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')
    
    if (!code) return

    // 이미 콜백 라우트에 있으면 아무것도 하지 않음
    if (pathname === '/auth/callback') return

    // code를 포함한 전체 쿼리스트링을 유지하며 리다이렉트
    const query = url.search // ?code=... 형태로 반환
    router.replace(`/auth/callback${query}`)
  }, [pathname, router])

  return null
}


