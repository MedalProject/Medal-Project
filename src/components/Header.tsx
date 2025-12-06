'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
        <div className="flex items-center justify-between h-16 sm:h-18 relative">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl flex items-center justify-center text-lg sm:text-xl shadow-lg shadow-primary-500/30">
              🏷️
            </div>
            <span className="font-display text-xl sm:text-2xl font-bold gradient-text">
              Hey Badge
            </span>
          </Link>

          {/* Navigation - Desktop (중앙 배치) */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <Link href="/order" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              뱃지 만들기
            </Link>
            <Link href="/gallery" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              제작 사례 보기
            </Link>
          </nav>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-2 sm:gap-3">
            {loading ? (
              <div className="w-20 h-10 bg-gray-100 rounded-lg animate-pulse" />
            ) : user ? (
              <>
                <span className="text-sm text-gray-500 font-medium truncate max-w-[120px]">
                  {user.email?.split('@')[0]}
                </span>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-gray-600 hover:text-primary-600 font-medium transition-colors"
                >
                  내 주문
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900"
          >
            {mobileMenuOpen ? (
              <span className="text-2xl">×</span>
            ) : (
              <span className="text-xl">☰</span>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-2">
            <Link
              href="/order"
              className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              뱃지 만들기
            </Link>
            <Link
              href="/gallery"
              className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              제작 사례 보기
            </Link>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  내 주문
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full text-left px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="block mx-4 py-3 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-semibold text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  시작하기
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
