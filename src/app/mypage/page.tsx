'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

// 다음 우편번호 API 타입 정의
interface DaumPostcodeData {
  zonecode: string
  address: string
  addressType: string
  bname: string
  buildingName: string
}

interface DaumPostcode {
  new (options: {
    oncomplete: (data: DaumPostcodeData) => void
  }): { open: () => void }
}

declare global {
  interface Window {
    daum?: {
      Postcode: DaumPostcode
    }
  }
}

// 배송지 타입
type Address = {
  id: string
  user_id: string
  name: string
  phone: string
  zonecode: string
  address: string
  address_detail: string
  is_default: boolean
  created_at: string
}

export default function MyPage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'address' | 'withdraw'>('profile')
  const [toast, setToast] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

  // 프로필 정보
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
  })
  const [profileLoading, setProfileLoading] = useState(false)

  // 비밀번호 변경
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  })
  const [passwordLoading, setPasswordLoading] = useState(false)

  // 배송지 목록
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    zonecode: '',
    address: '',
    address_detail: '',
    is_default: false,
  })
  const [addressLoading, setAddressLoading] = useState(false)

  // 회원 탈퇴
  const [withdrawConfirm, setWithdrawConfirm] = useState('')
  const [withdrawLoading, setWithdrawLoading] = useState(false)

  useEffect(() => {
    const init = async () => {
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

    init()
  }, [])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast(message)
    setToastType(type)
    setTimeout(() => setToast(''), 3000)
  }

  // 프로필 저장
  const handleSaveProfile = async () => {
    if (!user) return
    
    setProfileLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          phone: profile.phone,
        })
        .eq('id', user.id)

      if (error) throw error
      showToast('프로필이 저장되었습니다.')
    } catch (error) {
      showToast('프로필 저장에 실패했습니다.', 'error')
    } finally {
      setProfileLoading(false)
    }
  }

  // 비밀번호 변경
  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      showToast('새 비밀번호가 일치하지 않습니다.', 'error')
      return
    }

    if (passwords.new.length < 10) {
      showToast('비밀번호는 10자 이상이어야 합니다.', 'error')
      return
    }

    setPasswordLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      })

      if (error) throw error

      showToast('비밀번호가 변경되었습니다.')
      setPasswords({ current: '', new: '', confirm: '' })
    } catch (error: unknown) {
      // 에러 메시지 안전하게 추출
      const errorMessage = error instanceof Error 
        ? error.message 
        : '비밀번호 변경에 실패했습니다.'
      showToast(errorMessage, 'error')
    } finally {
      setPasswordLoading(false)
    }
  }

  // 주소 검색 (다음 우편번호 API)
  const handleAddressSearch = () => {
    if (typeof window !== 'undefined' && window.daum) {
      new window.daum.Postcode({
        oncomplete: function(data: DaumPostcodeData) {
          setAddressForm(prev => ({
            ...prev,
            zonecode: data.zonecode,
            address: data.address,
          }))
        }
      }).open()
    }
  }

  // 배송지 저장
  const handleSaveAddress = async () => {
    if (!user) return
    
    if (!addressForm.name || !addressForm.phone || !addressForm.address) {
      showToast('필수 항목을 입력해주세요.', 'error')
      return
    }

    setAddressLoading(true)
    try {
      if (addressForm.is_default) {
        // 기존 기본 배송지 해제
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
      }

      if (editingAddress) {
        // 수정
        const { error } = await supabase
          .from('addresses')
          .update({
            name: addressForm.name,
            phone: addressForm.phone,
            zonecode: addressForm.zonecode,
            address: addressForm.address,
            address_detail: addressForm.address_detail,
            is_default: addressForm.is_default,
          })
          .eq('id', editingAddress.id)

        if (error) throw error
        showToast('배송지가 수정되었습니다.')
      } else {
        // 추가
        const { error } = await supabase
          .from('addresses')
          .insert({
            user_id: user.id,
            name: addressForm.name,
            phone: addressForm.phone,
            zonecode: addressForm.zonecode,
            address: addressForm.address,
            address_detail: addressForm.address_detail,
            is_default: addressForm.is_default,
          })

        if (error) throw error
        showToast('배송지가 추가되었습니다.')
      }

      // 목록 새로고침
      const { data } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (data) setAddresses(data)

      setShowAddressForm(false)
      setEditingAddress(null)
      setAddressForm({
        name: '',
        phone: '',
        zonecode: '',
        address: '',
        address_detail: '',
        is_default: false,
      })
    } catch (error) {
      showToast('배송지 저장에 실패했습니다.', 'error')
    } finally {
      setAddressLoading(false)
    }
  }

  // 배송지 삭제
  const handleDeleteAddress = async (id: string) => {
    if (!confirm('이 배송지를 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id)

      if (error) throw error

      setAddresses(addresses.filter(a => a.id !== id))
      showToast('배송지가 삭제되었습니다.')
    } catch (error) {
      showToast('배송지 삭제에 실패했습니다.', 'error')
    }
  }

  // 배송지 수정 시작
  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setAddressForm({
      name: address.name,
      phone: address.phone,
      zonecode: address.zonecode,
      address: address.address,
      address_detail: address.address_detail,
      is_default: address.is_default,
    })
    setShowAddressForm(true)
  }

  // 회원 탈퇴
  const handleWithdraw = async () => {
    if (!user) return
    
    if (withdrawConfirm !== '회원탈퇴') {
      showToast('"회원탈퇴"를 정확히 입력해주세요.', 'error')
      return
    }

    if (!confirm('정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return

    setWithdrawLoading(true)
    try {
      // 프로필 삭제 (cascade로 관련 데이터도 삭제됨)
      await supabase.from('profiles').delete().eq('id', user.id)
      
      // 로그아웃
      await supabase.auth.signOut()

      showToast('회원 탈퇴가 완료되었습니다.')
      router.push('/')
    } catch (error) {
      showToast('회원 탈퇴에 실패했습니다.', 'error')
    } finally {
      setWithdrawLoading(false)
    }
  }

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
                  {[
                    { id: 'profile', label: '회원 정보', icon: '👤' },
                    { id: 'password', label: '비밀번호 변경', icon: '🔒' },
                    { id: 'address', label: '배송지 관리', icon: '📍' },
                    { id: 'withdraw', label: '회원 탈퇴', icon: '👋' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as typeof activeTab)}
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
              {/* 회원 정보 */}
              {activeTab === 'profile' && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="font-bold text-lg mb-6">회원 정보 수정</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                      />
                      <p className="text-xs text-gray-400 mt-1">이메일은 변경할 수 없습니다.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="이름을 입력해주세요"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">연락처</label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="010-0000-0000"
                      />
                    </div>

                    <button
                      onClick={handleSaveProfile}
                      disabled={profileLoading}
                      className="w-full py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
                    >
                      {profileLoading ? '저장 중...' : '저장하기'}
                    </button>
                  </div>
                </div>
              )}

              {/* 비밀번호 변경 */}
              {activeTab === 'password' && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="font-bold text-lg mb-6">비밀번호 변경</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">새 비밀번호</label>
                      <input
                        type="password"
                        value={passwords.new}
                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="새 비밀번호 (10자 이상)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">새 비밀번호 확인</label>
                      <input
                        type="password"
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="새 비밀번호 확인"
                      />
                    </div>

                    <button
                      onClick={handleChangePassword}
                      disabled={passwordLoading || !passwords.new || !passwords.confirm}
                      className="w-full py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
                    >
                      {passwordLoading ? '변경 중...' : '비밀번호 변경'}
                    </button>
                  </div>
                </div>
              )}

              {/* 배송지 관리 */}
              {activeTab === 'address' && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-bold text-lg">배송지 관리</h2>
                    {!showAddressForm && (
                      <button
                        onClick={() => {
                          setShowAddressForm(true)
                          setEditingAddress(null)
                          setAddressForm({
                            name: '',
                            phone: '',
                            zonecode: '',
                            address: '',
                            address_detail: '',
                            is_default: addresses.length === 0,
                          })
                        }}
                        className="px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors"
                      >
                        + 새 배송지 추가
                      </button>
                    )}
                  </div>

                  {showAddressForm ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            받는 분 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={addressForm.name}
                            onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="이름"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            연락처 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="010-0000-0000"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          주소 <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={addressForm.zonecode}
                            readOnly
                            className="w-28 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50"
                            placeholder="우편번호"
                          />
                          <button
                            type="button"
                            onClick={handleAddressSearch}
                            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                          >
                            주소 검색
                          </button>
                        </div>
                        <input
                          type="text"
                          value={addressForm.address}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 mb-2"
                          placeholder="주소"
                        />
                        <input
                          type="text"
                          value={addressForm.address_detail}
                          onChange={(e) => setAddressForm({ ...addressForm, address_detail: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="상세주소"
                        />
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={addressForm.is_default}
                          onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                          className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">기본 배송지로 설정</span>
                      </label>

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setShowAddressForm(false)
                            setEditingAddress(null)
                          }}
                          className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                        >
                          취소
                        </button>
                        <button
                          onClick={handleSaveAddress}
                          disabled={addressLoading}
                          className="flex-1 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
                        >
                          {addressLoading ? '저장 중...' : editingAddress ? '수정하기' : '추가하기'}
                        </button>
                      </div>
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                        📍
                      </div>
                      <p className="text-gray-500">등록된 배송지가 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`p-4 border rounded-xl ${
                            address.is_default ? 'border-primary-300 bg-primary-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{address.name}</span>
                                {address.is_default && (
                                  <span className="px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                                    기본
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{address.phone}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                [{address.zonecode}] {address.address} {address.address_detail}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditAddress(address)}
                                className="text-sm text-gray-500 hover:text-primary-600"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(address.id)}
                                className="text-sm text-gray-500 hover:text-red-600"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 회원 탈퇴 */}
              {activeTab === 'withdraw' && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="font-bold text-lg mb-6 text-red-600">회원 탈퇴</h2>

                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold text-red-800 mb-2">⚠️ 주의사항</h3>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• 탈퇴 시 모든 주문 내역이 삭제됩니다.</li>
                      <li>• 저장된 배송지 정보가 삭제됩니다.</li>
                      <li>• 장바구니 정보가 삭제됩니다.</li>
                      <li>• 이 작업은 되돌릴 수 없습니다.</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        확인을 위해 <strong>"회원탈퇴"</strong>를 입력해주세요
                      </label>
                      <input
                        type="text"
                        value={withdrawConfirm}
                        onChange={(e) => setWithdrawConfirm(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="회원탈퇴"
                      />
                    </div>

                    <button
                      onClick={handleWithdraw}
                      disabled={withdrawLoading || withdrawConfirm !== '회원탈퇴'}
                      className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {withdrawLoading ? '처리 중...' : '회원 탈퇴'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Toast */}
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

