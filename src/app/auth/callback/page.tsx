'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

// useSearchParams()를 사용하는 컴포넌트는 Suspense로 감싸야 함
function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [message, setMessage] = useState('로그인 처리 중...')

  useEffect(() => {
    const run = async () => {
      const code = searchParams.get('code')

      if (!code) {
        router.replace('/login?error=missing_code')
        return
      }

      // 브라우저에서 code → session 교환 (PKCE verifier 저장소와 동일 컨텍스트)
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('OAuth callback error:', error)
        router.replace('/login?error=auth_failed')
        return
      }

      setMessage('로그인 완료! 이동 중...')
      router.replace('/dashboard')
      router.refresh()
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-3xl shadow-sm p-8 text-center w-full max-w-md">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">{message}</p>
        <p className="text-gray-400 text-sm mt-2">잠시만 기다려주세요.</p>
      </div>
    </main>
  )
}

// 로딩 UI (Suspense fallback)
function LoadingUI() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-3xl shadow-sm p-8 text-center w-full max-w-md">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">로그인 처리 중...</p>
        <p className="text-gray-400 text-sm mt-2">잠시만 기다려주세요.</p>
      </div>
    </main>
  )
}

// 메인 페이지 컴포넌트 - Suspense로 감싸서 export
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingUI />}>
      <AuthCallbackContent />
    </Suspense>
  )
}
