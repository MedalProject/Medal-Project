'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { createClient, calculatePrice, priceTable, calculateShippingFee, FREE_SHIPPING_THRESHOLD } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

// 도금 색상 옵션
const metalColors = [
  { id: 'gold', name: '금도금' },
  { id: 'silver', name: '은도금' },
]

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

// 장바구니 아이템 타입
type CheckoutItem = {
  id: string
  paint_type: string
  metal_color: string
  size: number
  quantity: number
  design_url: string | null
  design_name: string | null
}

export default function CheckoutPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [user, setUser] = useState<User | null>(null)
  const [items, setItems] = useState<CheckoutItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState('')

  // 배송지 정보
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    zonecode: '',
    address: '',
    addressDetail: '',
    memo: '',
  })

  // 결제 방법
  const [paymentMethod, setPaymentMethod] = useState('bank')

  useEffect(() => {
    const loadCheckoutData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }
      
      setUser(user)

      // 장바구니에서 아이템 불러오기
      const { data: cartItems } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (cartItems && cartItems.length > 0) {
        setItems(cartItems)
      } else {
        // 장바구니가 비어있으면 localStorage에서 임시 주문 확인
        const tempOrder = localStorage.getItem('tempCheckoutItems')
        if (tempOrder) {
          setItems(JSON.parse(tempOrder))
        }
      }

      setLoading(false)
    }

    loadCheckoutData()
  }, [])

  // 총 금액 계산
  const totalPrice = items.reduce((sum, item) => {
    const itemPrice = calculatePrice(item.paint_type, item.size, item.quantity)
    return sum + itemPrice.total
  }, 0)

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)

  const getPaintTypeName = (type: string) => {
    return priceTable[type as keyof typeof priceTable]?.name || type
  }

  const getMetalColorName = (color: string) => {
    return metalColors.find(m => m.id === color)?.name || color
  }

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(''), 3000)
  }

  // 주소 검색 (다음 우편번호 API)
  const handleAddressSearch = () => {
    if (typeof window !== 'undefined' && window.daum) {
      new window.daum.Postcode({
        oncomplete: function(data: DaumPostcodeData) {
          setShippingInfo(prev => ({
            ...prev,
            zonecode: data.zonecode,
            address: data.address,
          }))
        }
      }).open()
    } else {
      showToast('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
    }
  }

  // 폼 유효성 검사
  const isFormValid = () => {
    return (
      shippingInfo.name.trim() !== '' &&
      shippingInfo.phone.trim() !== '' &&
      shippingInfo.address.trim() !== '' &&
      items.length > 0
    )
  }

  // 주문 완료
  const handleSubmitOrder = async () => {
    if (!user) return
    
    if (!isFormValid()) {
      showToast('배송지 정보를 모두 입력해주세요.')
      return
    }

    setSubmitting(true)

    try {
      for (const item of items) {
        const orderNumber = `HB${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
        const itemPrice = calculatePrice(item.paint_type, item.size, item.quantity)

        const { error } = await supabase.from('orders').insert({
          user_id: user.id,
          order_number: orderNumber,
          paint_type: item.paint_type,
          metal_color: item.metal_color,
          size: item.size,
          quantity: item.quantity,
          design_url: item.design_url,
          design_name: item.design_name,
          unit_price: itemPrice.unitPrice,
          discount_amount: itemPrice.discount,
          total_price: itemPrice.total,
          status: 'pending',
          // 배송지 정보
          shipping_name: shippingInfo.name,
          shipping_phone: shippingInfo.phone,
          shipping_zonecode: shippingInfo.zonecode,
          shipping_address: shippingInfo.address,
          shipping_address_detail: shippingInfo.addressDetail,
          shipping_memo: shippingInfo.memo,
          payment_method: paymentMethod,
        })

        if (error) throw error
      }

      // 장바구니 비우기
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)

      // localStorage 임시 데이터 삭제
      localStorage.removeItem('tempCheckoutItems')

      showToast('주문이 완료되었습니다!')
      
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (error) {
      console.error('Order error:', error)
      showToast('주문 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="pt-24 pb-16 px-4 bg-gray-50 min-h-screen">
          <div className="max-w-4xl mx-auto text-center py-20">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">주문 정보를 불러오는 중...</p>
          </div>
        </main>
      </>
    )
  }

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="pt-24 pb-16 px-4 bg-gray-50 min-h-screen">
          <div className="max-w-4xl mx-auto text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">
              📦
            </div>
            <h1 className="text-2xl font-bold mb-4">주문할 상품이 없습니다</h1>
            <p className="text-gray-500 mb-8">뱃지를 만들어 주문해주세요.</p>
            <Link
              href="/order"
              className="inline-block px-8 py-4 bg-gradient-to-r from-primary-500 to-blue-400 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
              뱃지 만들러 가기 →
            </Link>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      {/* 다음 우편번호 API 스크립트 */}
      <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" async />
      
      <Header />
      
      <main className="pt-24 pb-16 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          {/* 페이지 헤더 */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">주문/결제</h1>
            <p className="text-gray-500">배송지와 결제 정보를 입력해주세요</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 왼쪽: 배송지 & 결제 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 배송지 정보 */}
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">📍</span>
                  배송지 정보
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        받는 분 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.name}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="이름을 입력해주세요"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        연락처 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
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
                        value={shippingInfo.zonecode}
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
                      value={shippingInfo.address}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 mb-2"
                      placeholder="주소를 검색해주세요"
                    />
                    <input
                      type="text"
                      value={shippingInfo.addressDetail}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, addressDetail: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="상세주소를 입력해주세요"
                    />
                  </div>

                </div>
              </div>

              {/* 결제 방법 */}
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">💳</span>
                  결제 방법
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'bank', name: '계좌이체', icon: '🏦' },
                    { id: 'card', name: '신용카드', icon: '💳' },
                    { id: 'kakao', name: '카카오페이', icon: '💛' },
                    { id: 'naver', name: '네이버페이', icon: '💚' },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        paymentMethod === method.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{method.icon}</div>
                      <div className={`text-sm font-medium ${
                        paymentMethod === method.id ? 'text-primary-600' : 'text-gray-600'
                      }`}>
                        {method.name}
                      </div>
                    </button>
                  ))}
                </div>

                {paymentMethod === 'bank' && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-blue-800">
                      <strong>입금 계좌:</strong> 신한은행 110-123-456789 (예금주: 바로해)
                    </p>
                    <p className="text-sm text-blue-600 mt-1">
                      주문 후 24시간 이내 입금해주세요.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 오른쪽: 주문 요약 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 shadow-sm sticky top-24">
                <h2 className="font-bold text-lg mb-6">주문 상품</h2>

                <div className="space-y-4 max-h-64 overflow-y-auto mb-6">
                  {items.map((item, index) => {
                    const itemPrice = calculatePrice(item.paint_type, item.size, item.quantity)
                    return (
                      <div key={item.id || index} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
                        <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                          🏷️
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {item.design_name || '디자인 파일'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {getPaintTypeName(item.paint_type)} / {getMetalColorName(item.metal_color)} / {item.size}mm
                          </p>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-gray-400">{item.quantity}개</span>
                            <span className="text-sm font-bold">₩{itemPrice.total.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="space-y-2 py-4 border-t border-gray-100">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>상품 수</span>
                    <span>{items.length}개</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>총 수량</span>
                    <span>{totalQuantity.toLocaleString()}개</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>배송비</span>
                    {calculateShippingFee(totalPrice) === 0 ? (
                      <span className="text-green-600">무료</span>
                    ) : (
                      <span>₩{calculateShippingFee(totalPrice).toLocaleString()}</span>
                    )}
                  </div>
                </div>
                
                {totalPrice > 0 && totalPrice < FREE_SHIPPING_THRESHOLD && (
                  <p className="text-sm text-blue-600 pb-4">
                    💡 ₩{(FREE_SHIPPING_THRESHOLD - totalPrice).toLocaleString()} 더 담으면 무료배송!
                  </p>
                )}

                <div className="py-4 border-t border-gray-100">
                  <div className="flex justify-between items-end">
                    <span className="font-medium">총 결제 금액</span>
                    <span className="font-display text-2xl font-bold text-primary-600">
                      ₩{(totalPrice + calculateShippingFee(totalPrice)).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSubmitOrder}
                  disabled={submitting || !isFormValid()}
                  className="w-full py-4 bg-gradient-to-r from-primary-500 to-blue-400 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                >
                  {submitting ? '주문 처리 중...' : `₩${(totalPrice + calculateShippingFee(totalPrice)).toLocaleString()} 결제하기`}
                </button>

                <p className="text-center text-xs text-gray-400 mt-4">
                  주문 완료 시 <Link href="/refund" className="text-primary-500 hover:underline">환불규정</Link>에 동의하는 것으로 간주됩니다.
                </p>

                <p className="text-center text-sm text-gray-500 mt-3">
                  🚀 예상 발송일: 20일 이내
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 right-8 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-fade-in">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">✓</div>
          {toast}
        </div>
      )}
    </>
  )
}

