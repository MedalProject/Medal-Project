'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl flex items-center justify-center text-lg sm:text-xl shadow-lg shadow-primary-500/30">
              🏷️
            </div>
            <span className="font-display text-xl sm:text-2xl font-bold gradient-text">
              Hey Badge
            </span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              홈
            </Link>
            <Link href="/order" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              뱃지 만들기
            </Link>
            {user && (
              <Link href="/dashboard" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                내 주문
              </Link>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {loading ? (
              <div className="w-20 h-10 bg-gray-100 rounded-lg animate-pulse" />
            ) : user ? (
              <>
                <Link
                  href="/dashboard"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium truncate max-w-[120px]">
                    {user.email?.split('@')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all"
                >
                  시작하기
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
