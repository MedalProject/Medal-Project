'use client'

/**
 * 회원 탈퇴 탭 컴포넌트
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface WithdrawTabProps {
  userId: string
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export default function WithdrawTab({ userId, onSuccess, onError }: WithdrawTabProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [confirmText, setConfirmText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 회원 탈퇴
  const handleWithdraw = async () => {
    if (confirmText !== '회원탈퇴') {
      onError('"회원탈퇴"를 정확히 입력해주세요.')
      return
    }

    if (!confirm('정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return
    }

    setIsLoading(true)
    try {
      // 프로필 삭제 (cascade로 관련 데이터도 삭제됨)
      await supabase.from('profiles').delete().eq('id', userId)
      
      // 로그아웃
      await supabase.auth.signOut()

      onSuccess('회원 탈퇴가 완료되었습니다.')
      router.push('/')
    } catch (error) {
      onError('회원 탈퇴에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="font-bold text-lg mb-6 text-red-600">회원 탈퇴</h2>

      {/* 주의사항 */}
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
        {/* 확인 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            확인을 위해 <strong>&quot;회원탈퇴&quot;</strong>를 입력해주세요
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="회원탈퇴"
          />
        </div>

        {/* 탈퇴 버튼 */}
        <button
          onClick={handleWithdraw}
          disabled={isLoading || confirmText !== '회원탈퇴'}
          className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? '처리 중...' : '회원 탈퇴'}
        </button>
      </div>
    </div>
  )
}







