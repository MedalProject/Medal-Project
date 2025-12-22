'use client'

/**
 * 프로필 정보 수정 탭 컴포넌트
 */

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { ProfileData } from '@/types/mypage'

interface ProfileTabProps {
  userId: string
  email: string
  initialProfile: ProfileData
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export default function ProfileTab({
  userId,
  email,
  initialProfile,
  onSuccess,
  onError,
}: ProfileTabProps) {
  const supabase = createClient()
  
  const [profile, setProfile] = useState<ProfileData>(initialProfile)
  const [isLoading, setIsLoading] = useState(false)

  // 프로필 저장
  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          phone: profile.phone,
        })
        .eq('id', userId)

      if (error) throw error
      onSuccess('프로필이 저장되었습니다.')
    } catch (error) {
      onError('프로필 저장에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="font-bold text-lg mb-6">회원 정보 수정</h2>

      <div className="space-y-4">
        {/* 이메일 (읽기 전용) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이메일
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            이메일은 변경할 수 없습니다.
          </p>
        </div>

        {/* 이름 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이름
          </label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="이름을 입력해주세요"
          />
        </div>

        {/* 연락처 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            연락처
          </label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="010-0000-0000"
          />
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSaveProfile}
          disabled={isLoading}
          className="w-full py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
        >
          {isLoading ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </div>
  )
}



