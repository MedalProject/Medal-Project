'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [isValidSession, setIsValidSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // 페이지 로드 시 세션 확인
  useEffect(() => {
    const checkSession = async () => {
      try {
        // 현재 세션 확인
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session) {
          setError('세션이 만료되었거나 유효하지 않습니다. 비밀번호 찾기를 다시 시도해주세요.')
          setCheckingSession(false)
          return
        }

        setIsValidSession(true)
      } catch (err) {
        console.error('Session check error:', err)
        setError('세션 확인 중 오류가 발생했습니다.')
      } finally {
        setCheckingSession(false)
      }
    }

    checkSession()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    if (password.length < 10) {
      setError('비밀번호는 10자 이상이어야 합니다.')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err: unknown) {
      // 에러 메시지 안전하게 추출
      const errorMessage = err instanceof Error 
        ? err.message 
        : '비밀번호 변경에 실패했습니다.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // 세션 확인 중 로딩 화면
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">세션 확인 중...</p>
          </div>
        </div>
      </div>
    )
  }

  // 세션이 유효하지 않은 경우
  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
              ❌
            </div>
            <h1 className="text-2xl font-bold mb-4">세션이 만료되었습니다</h1>
            <p className="text-gray-500 mb-6">
              {error || '비밀번호 재설정 링크가 만료되었거나 유효하지 않습니다.'}
              <br />비밀번호 찾기를 다시 시도해주세요.
            </p>
            <div className="space-y-3">
              <Link
                href="/forgot-password"
                className="block w-full px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors"
              >
                비밀번호 찾기
              </Link>
              <Link
                href="/login"
                className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                로그인 페이지로
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
              ✅
            </div>
            <h1 className="text-2xl font-bold mb-4">비밀번호가 변경되었습니다!</h1>
            <p className="text-gray-500 mb-6">
              새 비밀번호로 로그인해주세요.<br />
              잠시 후 로그인 페이지로 이동합니다...
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors"
            >
              로그인 페이지로 이동
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center mb-8">
          <Image
            src="/logo.png"
            alt="Hey Badge"
            width={160}
            height={50}
            className="h-12 w-auto"
            priority
          />
        </Link>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-center mb-2">새 비밀번호 설정</h1>
          <p className="text-gray-500 text-center mb-8">
            새로운 비밀번호를 입력해주세요.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                새 비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={10}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="10자 이상 입력해주세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                새 비밀번호 확인
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="비밀번호를 다시 입력해주세요"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary-500 to-blue-400 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
              {loading ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

