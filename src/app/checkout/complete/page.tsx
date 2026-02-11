'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'

function CheckoutCompleteContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('orderNumber') || ''
  const email = searchParams.get('email') || ''
  const [toast, setToast] = useState('')

  const handleCopyOrderNumber = async () => {
    if (!orderNumber) return
    try {
      await navigator.clipboard.writeText(orderNumber)
      setToast('주문번호가 복사되었습니다!')
      setTimeout(() => setToast(''), 3000)
    } catch {
      setToast('복사에 실패했습니다.')
      setTimeout(() => setToast(''), 3000)
    }
  }

  return (
    <>
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
            ✅
          </div>

          <h1 className="text-2xl font-bold mb-2">결제가 완료되었습니다!</h1>
          <p className="text-gray-500 mb-8">
            아래 주문번호로 주문 상태를 확인하실 수 있습니다.
          </p>

          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <p className="text-sm text-gray-500 mb-2">주문번호</p>
            <div className="flex items-center justify-center gap-3">
              <span className="font-display text-2xl font-bold text-primary-600">
                {orderNumber || '확인 불가'}
              </span>
              {orderNumber && (
                <button
                  onClick={handleCopyOrderNumber}
                  className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors"
                >
                  📋 복사
                </button>
              )}
            </div>
          </div>

          {email && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-left">
              <p className="text-sm text-blue-800">
                <strong>📧 {email}</strong>으로<br />
                주문 확인 안내를 보내드렸습니다.
              </p>
              <p className="text-xs text-blue-600 mt-2">
                ⚠️ 주문번호를 꼭 저장해주세요! 주문 조회 시 필요합니다.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/order-lookup"
              className="block w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-white rounded-xl font-bold text-lg shadow-lg shadow-amber-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all text-center"
            >
              주문 조회하기
            </Link>
            <Link
              href="/"
              className="block text-gray-500 hover:text-gray-700 text-sm py-2"
            >
              ← 홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-fade-in bg-gray-900 text-white">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500 text-white">
            ✓
          </div>
          {toast}
        </div>
      )}
    </>
  )
}

function LoadingFallback() {
  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse" />
        <div className="h-8 bg-gray-100 rounded-lg w-3/4 mx-auto mb-4 animate-pulse" />
        <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto animate-pulse" />
      </div>
    </div>
  )
}

export default function CheckoutCompletePage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-16 px-4 bg-gray-50 min-h-screen">
        <Suspense fallback={<LoadingFallback />}>
          <CheckoutCompleteContent />
        </Suspense>
      </main>
    </>
  )
}
