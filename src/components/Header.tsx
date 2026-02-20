'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
      
      // Load cart count
      if (user) {
        const { count } = await supabase
          .from('cart_items')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
        setCartCount(count || 0)
      }
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setCartCount(0)
      }
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
          <Link href="/" className="flex items-center">
            <span className="font-display text-xl sm:text-2xl font-extrabold tracking-tight">
              <span className="text-amber-500">Medal</span>
              <span className="text-gray-800"> Project</span>
            </span>
          </Link>

          {/* Navigation - Desktop (중앙 배치) */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <Link href="/order" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              메달 만들기
            </Link>
            <Link href="/design-request" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              디자인 의뢰
            </Link>
            <Link href="/gallery" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              제작 사례 보기
            </Link>
            <Link href="/order-lookup" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              주문 조회
            </Link>
          </nav>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-2 sm:gap-3">
            {loading ? (
              <div className="w-20 h-10 bg-gray-100 rounded-lg animate-pulse" />
            ) : user ? (
              <>
                <Link
                  href="/cart"
                  className="relative px-3 py-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <span className="text-xl">🛒</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
                
                {/* 사용자 드롭다운 메뉴 */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    onBlur={() => setTimeout(() => setUserMenuOpen(false), 150)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors rounded-xl hover:bg-gray-50"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block max-w-[100px] truncate">
                      {user.email?.split('@')[0]}
                    </span>
                    <svg 
                      className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* 드롭다운 메뉴 */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.email?.split('@')[0]}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <span>📦</span>
                        내 주문
                      </Link>
                      <Link
                        href="/mypage"
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <span>👤</span>
                        마이페이지
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span>👋</span>
                          로그아웃
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/cart"
                  className="relative px-3 py-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <span className="text-xl">🛒</span>
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all"
                >
                  회원가입
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
              메달 만들기
            </Link>
            <Link
              href="/design-request"
              className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              🎨 디자인 의뢰
            </Link>
            <Link
              href="/gallery"
              className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              제작 사례 보기
            </Link>
            <Link
              href="/order-lookup"
              className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              📦 주문 조회
            </Link>
            <Link
              href="/cart"
              className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium flex items-center justify-between"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>🛒 장바구니</span>
              {cartCount > 0 && (
                <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                  {cartCount}
                </span>
              )}
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
                <Link
                  href="/mypage"
                  className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  마이페이지
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
                  className="block mx-4 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-white rounded-xl font-semibold text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
