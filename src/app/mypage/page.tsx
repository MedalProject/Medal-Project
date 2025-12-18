'use client'

/**
 * 마이페이지
 * 
 * 회원 정보, 비밀번호 변경, 배송지 관리, 회원 탈퇴 기능을 제공합니다.
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

// 타입 import
import type { Address, ProfileData, MyPageTab, ToastType } from '@/types/mypage'

// 컴포넌트 import
import { ProfileTab, PasswordTab, AddressTab, WithdrawTab } from '@/components/mypage'

// 탭 메뉴 정의
const TAB_MENU = [
  { id: 'profile' as const, label: '회원 정보', icon: '👤' },
  { id: 'password' as const, label: '비밀번호 변경', icon: '🔒' },
  { id: 'address' as const, label: '배송지 관리', icon: '📍' },
  { id: 'withdraw' as const, label: '회원 탈퇴', icon: '👋' },
]

export default function MyPage() {
  const router = useRouter()
  const supabase = createClient()

  // 상태
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<MyPageTab>('profile')
  const [toast, setToast] = useState('')
  const [toastType, setToastType] = useState<ToastType>('success')

  // 초기 데이터
  const [profile, setProfile] = useState<ProfileData>({ name: '', phone: '' })
  const [addresses, setAddresses] = useState<Address[]>([])

  // 초기화
  useEffect(() => {
    const initializePage = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // 프로필 정보 불러오기
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile({
          name: profileData.name || '',
          phone: profileData.phone || '',
        })
      }

      // 배송지 목록 불러오기
      const { data: addressData } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (addressData) {
        setAddresses(addressData)
      }

      setLoading(false)
    }

    initializePage()
  }, [router, supabase])

  // Toast 표시
  const showToast = (message: string, type: ToastType = 'success') => {
    setToast(message)
    setToastType(type)
    setTimeout(() => setToast(''), 3000)
  }

  // 성공 핸들러
  const handleSuccess = (message: string) => showToast(message, 'success')
  
  // 에러 핸들러
  const handleError = (message: string) => showToast(message, 'error')

  // 로딩 상태
  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="spinner w-10 h-10" />
        </div>
      </>
    )
  }

  return (
    <>
      {/* 다음 우편번호 API 스크립트 */}
      <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" async />
      <Header />

      <main className="pt-24 pb-16 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* 페이지 헤더 */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">마이페이지</h1>
            <p className="text-gray-500">{user?.email}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* 사이드바 */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <nav className="space-y-1">
                  {TAB_MENU.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${
                        activeTab === item.id
                          ? 'bg-primary-50 text-primary-600 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </nav>

                {/* 주문 내역 링크 */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link
                    href="/dashboard"
                    className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <span>📦</span>
                    주문 내역
                  </Link>
                </div>
              </div>
            </div>

            {/* 컨텐츠 영역 */}
            <div className="md:col-span-3">
              {activeTab === 'profile' && user && (
                <ProfileTab
                  userId={user.id}
                  email={user.email || ''}
                  initialProfile={profile}
                  onSuccess={handleSuccess}
                  onError={handleError}
                />
              )}

              {activeTab === 'password' && (
                <PasswordTab
                  onSuccess={handleSuccess}
                  onError={handleError}
                />
              )}

              {activeTab === 'address' && user && (
                <AddressTab
                  userId={user.id}
                  initialAddresses={addresses}
                  onSuccess={handleSuccess}
                  onError={handleError}
                />
              )}

              {activeTab === 'withdraw' && user && (
                <WithdrawTab
                  userId={user.id}
                  onSuccess={handleSuccess}
                  onError={handleError}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Toast 알림 */}
      {toast && (
        <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 ${
          toastType === 'error' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            toastType === 'error' ? 'bg-white text-red-600' : 'bg-green-500 text-white'
          }`}>
            {toastType === 'error' ? '!' : '✓'}
          </div>
          {toast}
        </div>
      )}
    </>
  )
}
