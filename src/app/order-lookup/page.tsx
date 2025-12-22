'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import { priceTable, statusLabels, statusColors } from '@/lib/supabase'

// 도금 색상 옵션
const metalColors = [
  { id: 'gold', name: '금도금' },
  { id: 'silver', name: '은도금' },
]

// 조회된 주문 타입
type LookedUpOrder = {
  id: string
  order_number: string
  status: string
  paint_type: string
  metal_color: string
  size: number
  quantity: number
  design_name: string | null
  unit_price: number
  discount_amount: number
  total_price: number
  shipping_name: string | null
  shipping_address: string | null
  payment_method: string | null
  created_at: string
  paid_at: string | null
  shipped_at: string | null
  completed_at: string | null
}

export default function OrderLookupPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [orders, setOrders] = useState<LookedUpOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const getPaintTypeName = (type: string) => {
    return priceTable[type as keyof typeof priceTable]?.name || type
  }

  const getMetalColorName = (color: string) => {
    return metalColors.find(m => m.id === color)?.name || color
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 주문 조회
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setOrders([])
    setSearched(true)

    // 입력값 검증
    if (!orderNumber.trim()) {
      setError('주문번호를 입력해주세요.')
      return
    }

    if (!email.trim()) {
      setError('이메일을 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/order-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderNumber: orderNumber.trim(), 
          email: email.trim() 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '주문 조회에 실패했습니다.')
        return
      }

      setOrders(data.orders)
    } catch (err) {
      console.error('Order lookup error:', err)
      setError('주문 조회 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 주문번호 복사
  const handleCopyOrderNumber = async (orderNum: string) => {
    try {
      await navigator.clipboard.writeText(orderNum)
      // 복사 완료 피드백 (간단히 alert 대신 UI로 처리 가능)
    } catch {
      // 복사 실패 시 무시
    }
  }

  return (
    <>
      <Header />
      
      <main className="pt-24 pb-16 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          {/* 페이지 헤더 */}
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">
              주문 조회
            </h1>
            <p className="text-gray-500 text-lg">
              주문번호와 이메일로 주문 상태를 확인하세요
            </p>
          </div>

          {/* 조회 폼 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm mb-8">
            <form onSubmit={handleLookup} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  주문번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="예: HB250122-1234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  주문 시 입력한 이메일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-primary-500 to-blue-400 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    조회 중...
                  </span>
                ) : (
                  '주문 조회하기'
                )}
              </button>
            </form>

            {/* 도움말 */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                💡 주문번호는 주문 완료 시 화면과 이메일로 안내드립니다.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                📧 이메일을 찾을 수 없나요?{' '}
                <Link href="https://pf.kakao.com/_JjxbQn/chat" target="_blank" className="text-primary-600 hover:underline">
                  카카오톡 문의하기
                </Link>
              </p>
            </div>
          </div>

          {/* 조회 결과 */}
          {searched && orders.length === 0 && !loading && !error && (
            <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                🔍
              </div>
              <p className="text-gray-500">
                조회된 주문이 없습니다.<br />
                주문번호와 이메일을 다시 확인해주세요.
              </p>
            </div>
          )}

          {orders.length > 0 && (
            <div className="space-y-6">
              <h2 className="font-bold text-lg">조회 결과</h2>
              
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-3xl p-6 shadow-sm">
                  {/* 주문 헤더 */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg">{order.order_number}</span>
                        <button
                          onClick={() => handleCopyOrderNumber(order.order_number)}
                          className="text-xs text-gray-400 hover:text-gray-600"
                          title="주문번호 복사"
                        >
                          📋
                        </button>
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                      statusColors[order.status] || 'bg-gray-100 text-gray-800'
                    }`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>

                  {/* 상품 정보 */}
                  <div className="py-4 border-b border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                        🏷️
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {order.design_name || '디자인 파일'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {getPaintTypeName(order.paint_type)} / {getMetalColorName(order.metal_color)} / {order.size}mm
                        </p>
                        <p className="text-sm text-gray-500">
                          수량: {order.quantity}개
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          ₩{order.total_price.toLocaleString()}
                        </p>
                        {order.discount_amount > 0 && (
                          <p className="text-sm text-green-600">
                            -₩{order.discount_amount.toLocaleString()} 할인
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 배송 정보 */}
                  <div className="pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">배송지</h4>
                    <p className="text-sm text-gray-600">
                      {order.shipping_name} / {order.shipping_address}
                    </p>
                  </div>

                  {/* 상태 타임라인 */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className={`text-center ${order.created_at ? 'text-primary-600' : ''}`}>
                        <div className={`w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center text-xs ${
                          order.created_at ? 'bg-primary-500 text-white' : 'bg-gray-200'
                        }`}>
                          {order.created_at ? '✓' : '1'}
                        </div>
                        주문접수
                      </div>
                      <div className="flex-1 h-0.5 bg-gray-200 mx-2" />
                      <div className={`text-center ${order.paid_at ? 'text-primary-600' : ''}`}>
                        <div className={`w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center text-xs ${
                          order.paid_at ? 'bg-primary-500 text-white' : 'bg-gray-200'
                        }`}>
                          {order.paid_at ? '✓' : '2'}
                        </div>
                        결제완료
                      </div>
                      <div className="flex-1 h-0.5 bg-gray-200 mx-2" />
                      <div className={`text-center ${order.status === 'producing' || order.shipped_at ? 'text-primary-600' : ''}`}>
                        <div className={`w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center text-xs ${
                          order.status === 'producing' || order.shipped_at ? 'bg-primary-500 text-white' : 'bg-gray-200'
                        }`}>
                          {order.status === 'producing' || order.shipped_at ? '✓' : '3'}
                        </div>
                        제작중
                      </div>
                      <div className="flex-1 h-0.5 bg-gray-200 mx-2" />
                      <div className={`text-center ${order.shipped_at ? 'text-primary-600' : ''}`}>
                        <div className={`w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center text-xs ${
                          order.shipped_at ? 'bg-primary-500 text-white' : 'bg-gray-200'
                        }`}>
                          {order.shipped_at ? '✓' : '4'}
                        </div>
                        배송중
                      </div>
                      <div className="flex-1 h-0.5 bg-gray-200 mx-2" />
                      <div className={`text-center ${order.completed_at ? 'text-primary-600' : ''}`}>
                        <div className={`w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center text-xs ${
                          order.completed_at ? 'bg-primary-500 text-white' : 'bg-gray-200'
                        }`}>
                          {order.completed_at ? '✓' : '5'}
                        </div>
                        배송완료
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 회원가입 유도 */}
          <div className="mt-8 bg-gradient-to-r from-primary-50 to-blue-50 rounded-3xl p-6 text-center">
            <h3 className="font-bold text-lg mb-2">더 편하게 주문하고 싶으신가요?</h3>
            <p className="text-gray-600 text-sm mb-4">
              회원가입하시면 주문 내역이 자동 저장되고<br />
              다음 주문 시 더 빠르게 주문하실 수 있어요!
            </p>
            <Link
              href="/signup"
              className="inline-block px-6 py-3 bg-white text-primary-600 font-bold rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              회원가입하기 (30초)
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}

