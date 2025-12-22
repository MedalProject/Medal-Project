'use client'

/**
 * 비밀번호 변경 탭 컴포넌트
 */

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { PasswordFormData } from '@/types/mypage'

interface PasswordTabProps {
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export default function PasswordTab({ onSuccess, onError }: PasswordTabProps) {
  const supabase = createClient()
  
  const [passwords, setPasswords] = useState<PasswordFormData>({
    current: '',
    new: '',
    confirm: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  // 비밀번호 변경
  const handleChangePassword = async () => {
    // 유효성 검사
    if (passwords.new !== passwords.confirm) {
      onError('새 비밀번호가 일치하지 않습니다.')
      return
    }

    if (passwords.new.length < 10) {
      onError('비밀번호는 10자 이상이어야 합니다.')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      })

      if (error) throw error

      onSuccess('비밀번호가 변경되었습니다.')
      setPasswords({ current: '', new: '', confirm: '' })
    } catch (error: unknown) {
      // 에러 메시지 안전하게 추출
      const errorMessage = error instanceof Error 
        ? error.message 
        : '비밀번호 변경에 실패했습니다.'
      onError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="font-bold text-lg mb-6">비밀번호 변경</h2>

      <div className="space-y-4">
        {/* 새 비밀번호 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            새 비밀번호
          </label>
          <input
            type="password"
            value={passwords.new}
            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="새 비밀번호 (10자 이상)"
          />
        </div>

        {/* 새 비밀번호 확인 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            새 비밀번호 확인
          </label>
          <input
            type="password"
            value={passwords.confirm}
            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="새 비밀번호 확인"
          />
        </div>

        {/* 변경 버튼 */}
        <button
          onClick={handleChangePassword}
          disabled={isLoading || !passwords.new || !passwords.confirm}
          className="w-full py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
        >
          {isLoading ? '변경 중...' : '비밀번호 변경'}
        </button>
      </div>
    </div>
  )
}



