'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState(false)
  const [showPasswordRules, setShowPasswordRules] = useState(false)
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
  const router = useRouter()
  const supabase = createClient()

  // 이메일 중복 확인
  const checkEmail = async (emailToCheck: string) => {
    if (!emailToCheck) {
      setEmailStatus('idle')
      return
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailToCheck)) {
      setEmailStatus('invalid')
      return
    }

    setEmailStatus('checking')

    try {
      const res = await fetch('/api/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToCheck })
      })

      const data = await res.json()

      if (data.exists) {
        setEmailStatus('taken')
      } else if (data.valid) {
        setEmailStatus('available')
      } else {
        setEmailStatus('invalid')
      }
    } catch (err) {
      // API 에러 시 무시 (가입 시 다시 확인됨)
      setEmailStatus('idle')
    }
  }

  // 비밀번호 유효성 검사
  const passwordChecks = {
    length: password.length >= 10,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    noConsecutive: !/(.)\1{2,}/.test(password), // 같은 문자 3회 이상 연속 불가
    noEmail: !password || !email || !password.toLowerCase().includes(email.split('@')[0].toLowerCase()),
  }

  const isPasswordValid = 
    passwordChecks.length && 
    passwordChecks.hasLetter && 
    passwordChecks.hasNumber && 
    passwordChecks.hasSpecial &&
    passwordChecks.noConsecutive &&
    passwordChecks.noEmail

  const handleGoogleLogin = async () => {
    setSocialLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) {
        setError('구글 로그인 중 오류가 발생했습니다.')
      }
    } catch (err) {
      setError('구글 로그인 중 오류가 발생했습니다.')
    } finally {
      setSocialLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // 이메일 중복 확인
    if (emailStatus === 'taken') {
      setError('이미 가입된 이메일입니다. 다른 이메일을 사용해주세요.')
      setLoading(false)
      return
    }

    if (emailStatus === 'invalid') {
      setError('올바른 이메일 형식이 아닙니다.')
      setLoading(false)
      return
    }

    // 비밀번호 유효성 검사
    if (!isPasswordValid) {
      setError('비밀번호 조건을 모두 충족해주세요.')
      setLoading(false)
      return
    }

    // 비밀번호 확인
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        if (error.message.includes('already registered')) {
          setError('이미 가입된 이메일입니다.')
        } else {
          setError(error.message)
        }
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('회원가입 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
              ✉️
            </div>
            <h1 className="text-2xl font-bold mb-4">이메일을 확인해주세요!</h1>
            <p className="text-gray-500 mb-6">
              <strong>{email}</strong>로 확인 메일을 보냈습니다.
              이메일의 링크를 클릭하여 가입을 완료해주세요.
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

        {/* Signup Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-center mb-2">회원가입</h1>
          <p className="text-gray-500 text-center mb-6">
            계정을 만들어 주문을 관리하세요
          </p>

          {/* 구글 로그인 */}
          <button
            onClick={handleGoogleLogin}
            disabled={socialLoading}
            className="w-full py-4 bg-white border-2 border-gray-200 rounded-xl font-bold text-gray-700 flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {socialLoading ? '연결 중...' : '구글로 3초만에 가입하기'}
          </button>

          {/* 구분선 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">또는 이메일로 가입</span>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setEmailStatus('idle')
                  }}
                  onBlur={(e) => checkEmail(e.target.value)}
                  required
                  className={`w-full px-4 py-3 pr-10 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    emailStatus === 'available' ? 'border-green-400' :
                    emailStatus === 'taken' ? 'border-red-400' :
                    emailStatus === 'invalid' ? 'border-orange-400' :
                    'border-gray-200'
                  }`}
                  placeholder="your@email.com"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {emailStatus === 'checking' && (
                    <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  )}
                  {emailStatus === 'available' && (
                    <span className="text-green-500 text-xl">✓</span>
                  )}
                  {emailStatus === 'taken' && (
                    <span className="text-red-500 text-xl">✕</span>
                  )}
                  {emailStatus === 'invalid' && (
                    <span className="text-orange-400 text-xl">!</span>
                  )}
                </div>
              </div>
              {emailStatus === 'taken' && (
                <p className="mt-2 text-sm text-red-500">이미 가입된 이메일입니다.</p>
              )}
              {emailStatus === 'invalid' && (
                <p className="mt-2 text-sm text-orange-500">올바른 이메일 형식이 아닙니다.</p>
              )}
              {emailStatus === 'available' && (
                <p className="mt-2 text-sm text-green-500">사용 가능한 이메일입니다.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setShowPasswordRules(true)}
                  required
                  minLength={10}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    password && (isPasswordValid ? 'border-green-400' : 'border-orange-300')
                  } ${!password && 'border-gray-200'}`}
                  placeholder="비밀번호를 입력해주세요"
                />
                {password && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isPasswordValid ? (
                      <span className="text-green-500 text-xl">✓</span>
                    ) : (
                      <span className="text-orange-400 text-xl">!</span>
                    )}
                  </div>
                )}
              </div>
              
              {/* 비밀번호 규칙 표시 */}
              {showPasswordRules && (
                <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    <span className={passwordChecks.length && passwordChecks.hasLetter && passwordChecks.hasNumber && passwordChecks.hasSpecial ? 'text-green-600' : 'text-gray-400'}>
                      {passwordChecks.length && passwordChecks.hasLetter && passwordChecks.hasNumber && passwordChecks.hasSpecial ? '✓' : '○'} 영문, 숫자, 특수문자 포함 10자 이상
                    </span>
                    <span className={passwordChecks.noConsecutive ? 'text-green-600' : 'text-gray-400'}>
                      {passwordChecks.noConsecutive ? '✓' : '○'} 연속 문자 불가
                    </span>
                    <span className={passwordChecks.noEmail ? 'text-green-600' : 'text-gray-400'}>
                      {passwordChecks.noEmail ? '✓' : '○'} 이메일(아이디) 불가
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 확인
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
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="spinner" />
                  가입 중...
                </span>
              ) : (
                '회원가입'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="text-primary-600 font-semibold hover:underline">
                로그인
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
