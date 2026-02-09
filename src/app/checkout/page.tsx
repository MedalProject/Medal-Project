'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import Link from 'next/link'
import Header from '@/components/Header'
import { createClient, calculatePrice, priceTable, calculateShippingFee, FREE_SHIPPING_THRESHOLD } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

// 도금 색상 옵션
const metalColors = [
  { id: 'gold', name: '금도금' },
  { id: 'silver', name: '은도금' },
]

const KCP_SITE_NAME = 'HEYBADGE'

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
    KCP_Pay_Execute_Web?: (form: HTMLFormElement) => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    GetField?: (form: HTMLFormElement, data: any) => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    m_Completepayment?: (FormOrJson: any, closeEvent: () => void) => void
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

type KcpRegisterResponse =
  | {
      flow: 'pc'
      orderNumber: string
      amount: number
      siteCd: string
      goodName: string
      payMethod: string
      retUrl: string
      pcScriptUrl: string
    }
  | {
      flow: 'mobile'
      orderNumber: string
      amount: number
      siteCd: string
      goodName: string
      payMethod: string
      approvalKey: string
      payUrl: string
      retUrl: string
    }

export default function CheckoutPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [user, setUser] = useState<User | null>(null)
  const [items, setItems] = useState<CheckoutItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

  // 비회원 주문용 이메일 상태
  const [guestEmail, setGuestEmail] = useState('')
  const [guestEmailConfirm, setGuestEmailConfirm] = useState('')
  const [emailError, setEmailError] = useState('')

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
  const [paymentMethod, setPaymentMethod] = useState('card')

  // KCP 결제 관련
  const kcpFormRef = useRef<HTMLFormElement>(null)
  const kcpMobileFormRef = useRef<HTMLFormElement>(null)
  const [kcpPayload, setKcpPayload] = useState<KcpRegisterResponse | null>(null)
  const [kcpScriptReady, setKcpScriptReady] = useState(false)
  const [shouldExecutePayment, setShouldExecutePayment] = useState(false)


  useEffect(() => {
    const loadCheckoutData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // 로그인한 경우 장바구니에서 아이템 불러오기
      if (user) {
        const { data: cartItems } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (cartItems && cartItems.length > 0) {
          setItems(cartItems)
        }
      }

      // localStorage에서 임시 주문 확인 (비로그인 주문 또는 백업)
      const tempOrder = localStorage.getItem('tempCheckoutItems')
      if (tempOrder) {
        const parsedItems = JSON.parse(tempOrder)
        if (parsedItems.length > 0) {
          setItems(parsedItems)
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

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast(message)
    setToastType(type)
    setTimeout(() => setToast(''), 3000)
  }

  const isMobileDevice = () => {
    if (typeof navigator === 'undefined') return false
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
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
      showToast('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.', 'error')
    }
  }

  // 이메일 유효성 검사
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // 이메일 확인 검증
  const validateGuestEmail = (): boolean => {
    // 로그인한 경우 검증 불필요
    if (user) return true

    if (!guestEmail) {
      setEmailError('이메일을 입력해주세요.')
      return false
    }

    if (!validateEmail(guestEmail)) {
      setEmailError('올바른 이메일 형식이 아닙니다.')
      return false
    }

    if (guestEmail !== guestEmailConfirm) {
      setEmailError('이메일이 일치하지 않습니다.')
      return false
    }

    setEmailError('')
    return true
  }

  const handlePaymentSuccess = (orderNumber: string, email?: string | null) => {
    localStorage.removeItem('tempCheckoutItems')
    const query = new URLSearchParams({ orderNumber })
    if (email) query.set('email', email)
    router.push(`/checkout/complete?${query.toString()}`)
  }

  const waitForKcpScript = (maxWait = 5000): Promise<boolean> => {
    return new Promise((resolve) => {
      if (kcpScriptReady && window.KCP_Pay_Execute_Web) {
        resolve(true)
        return
      }
      
      const startTime = Date.now()
      const checkInterval = setInterval(() => {
        if (kcpScriptReady && window.KCP_Pay_Execute_Web) {
          clearInterval(checkInterval)
          resolve(true)
        } else if (Date.now() - startTime > maxWait) {
          clearInterval(checkInterval)
          resolve(false)
        }
      }, 100)
    })
  }

  const startKcpPcPayment = async (data: Extract<KcpRegisterResponse, { flow: 'pc' }>) => {
    // 스크립트 로딩 대기
    const scriptLoaded = await waitForKcpScript()
    if (!scriptLoaded) {
      showToast('결제 모듈을 불러오지 못했습니다. 페이지를 새로고침해주세요.', 'error')
      return
    }

    // 이전 결제 세션의 잔여 데이터 초기화
    if (kcpFormRef.current) {
      const fieldsToReset = ['res_cd', 'res_msg', 'enc_data', 'enc_info', 'tran_cd']
      fieldsToReset.forEach(name => {
        const input = kcpFormRef.current?.querySelector(`input[name="${name}"]`) as HTMLInputElement
        if (input) input.value = ''
      })
    }

    // 상태 업데이트 후 useEffect에서 KCP 결제창 호출
    setKcpPayload(data)
    setShouldExecutePayment(true)
  }

  // kcpPayload가 폼에 반영된 후 결제창 호출
  useEffect(() => {
    if (!shouldExecutePayment || !kcpPayload || kcpPayload.flow !== 'pc') return

    setShouldExecutePayment(false)

    if (kcpFormRef.current && window.KCP_Pay_Execute_Web) {
      window.KCP_Pay_Execute_Web(kcpFormRef.current)
    } else {
      showToast('결제창 호출에 실패했습니다.', 'error')
    }
  }, [shouldExecutePayment, kcpPayload])

  const startKcpMobilePayment = (data: Extract<KcpRegisterResponse, { flow: 'mobile' }>) => {
    setKcpPayload(data)
    setTimeout(() => {
      const form = kcpMobileFormRef.current
      if (!form) {
        showToast('모바일 결제창 호출에 실패했습니다.', 'error')
        return
      }
      const payUrl = data.payUrl
      form.action = `${payUrl.substring(0, payUrl.lastIndexOf('/'))}/jsp/encodingFilter/encodingFilter.jsp`
      form.submit()
    }, 0)
  }

  useEffect(() => {
    if (!kcpPayload || kcpPayload.flow !== 'pc') return

    // KCP 문서 기준: m_Completepayment(FormOrJson, closeEvent)
    // - GetField()로 폼에 인증 데이터를 세팅
    // - res_cd == "0000" 일 때만 승인 진행
    // - 실패 시 closeEvent()로 결제창 닫기
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.m_Completepayment = async (FormOrJson: any, closeEvent: () => void) => {
      try {
        const form = kcpFormRef.current
        if (!form) {
          showToast('결제 결과를 확인할 수 없습니다.', 'error')
          if (closeEvent) closeEvent()
          return
        }

        // GetField: KCP JS가 제공하는 함수로, FormOrJson 데이터를 form에 세팅
        if (window.GetField) {
          window.GetField(form, FormOrJson)
        }

        // res_cd 확인 (결제 인증 결과)
        const resCd = (form.querySelector('input[name="res_cd"]') as HTMLInputElement)?.value
        const resMsg = (form.querySelector('input[name="res_msg"]') as HTMLInputElement)?.value

        if (resCd !== '0000') {
          alert('[' + resCd + '] ' + resMsg)
          if (closeEvent) closeEvent()
          return
        }

        // 인증 성공 시 승인 요청
        const encData = (form.querySelector('input[name="enc_data"]') as HTMLInputElement)?.value
        const encInfo = (form.querySelector('input[name="enc_info"]') as HTMLInputElement)?.value
        const tranCd = (form.querySelector('input[name="tran_cd"]') as HTMLInputElement)?.value

        if (!encData || !encInfo) {
          showToast('결제 인증값이 없습니다.', 'error')
          if (closeEvent) closeEvent()
          return
        }

        const response = await fetch('/api/kcp/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            orderNumber: kcpPayload.orderNumber,
            enc_data: encData,
            enc_info: encInfo,
            tran_cd: tranCd || '00100000',
          }),
        })

        const result = await response.json()
        if (!response.ok) {
          showToast(result?.error || '결제 승인에 실패했습니다.', 'error')
          return
        }

        handlePaymentSuccess(result.orderNumber, result.email)
      } catch (error) {
        console.error('KCP approve error:', error)
        showToast('결제 승인 처리 중 오류가 발생했습니다.', 'error')
      }
    }

    return () => {
      delete window.m_Completepayment
    }
  }, [kcpPayload])

  // 폼 유효성 검사
  const isFormValid = () => {
    // 비회원 이메일 검증
    if (!user) {
      if (!guestEmail || !validateEmail(guestEmail) || guestEmail !== guestEmailConfirm) {
        return false
      }
    }

    return (
      shippingInfo.name.trim() !== '' &&
      shippingInfo.phone.trim() !== '' &&
      shippingInfo.address.trim() !== '' &&
      items.length > 0
    )
  }

  // 주문 완료
  const handleSubmitOrder = async () => {
    // 이메일 검증
    if (!validateGuestEmail()) {
      return
    }
    
    if (!isFormValid()) {
      showToast('배송지 정보를 모두 입력해주세요.', 'error')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/kcp/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          items,
          shippingInfo,
          paymentMethod,
          guestEmail: user ? user.email : guestEmail,
          isMobile: isMobileDevice(),
        }),
      })

      const data = (await response.json()) as KcpRegisterResponse
      if (!response.ok) {
        // showToast(data?.error || '결제 요청에 실패했습니다.', 'error')
        return
      }

      if (data.flow === 'mobile') {
        startKcpMobilePayment(data)
      } else {
        await startKcpPcPayment(data)
      }
    } catch (error) {
      console.error('Order error:', error)
      showToast('결제 요청 중 오류가 발생했습니다.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // 로딩 상태
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

  // 주문할 상품이 없는 경우
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
      <Script
        // src="https://testspay.kcp.co.kr/plugin/kcp_spay_hub.js"
        src="https://spay.kcp.co.kr/plugin/kcp_spay_hub.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('KCP script loaded')
          setKcpScriptReady(true)
        }}
        onError={(e) => {
          console.error('KCP script load error:', e)
        }}
      />
      {/* 다음 우편번호 API 스크립트 */}
      <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" async />
      
      <Header />
      
      <main className="pt-24 pb-16 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          {/* 페이지 헤더 */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">주문/결제</h1>
            <p className="text-gray-500">
              {user ? '배송지와 결제 정보를 입력해주세요' : '주문 정보를 입력해주세요'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 왼쪽: 주문자 정보 & 배송지 & 결제 */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 주문자 이메일 (비회원용 또는 회원 표시용) */}
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">📧</span>
                  주문자 정보
                </h2>

                {user ? (
                  // 로그인한 경우: 이메일 표시만
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이메일
                    </label>
                    <input
                      type="email"
                      value={user.email || ''}
                      disabled
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      ✓ 로그인 계정: {user.email}
                    </p>
                  </div>
                ) : (
                  // 비로그인: 이메일 입력
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        이메일 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => {
                          setGuestEmail(e.target.value)
                          setEmailError('')
                        }}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                          emailError ? 'border-red-400' : 'border-gray-200'
                        }`}
                        placeholder="your@email.com"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        주문 확인 및 조회에 필요합니다
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        이메일 확인 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={guestEmailConfirm}
                        onChange={(e) => {
                          setGuestEmailConfirm(e.target.value)
                          setEmailError('')
                        }}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                          emailError ? 'border-red-400' : 'border-gray-200'
                        }`}
                        placeholder="이메일을 다시 입력해주세요"
                      />
                    </div>

                    {emailError && (
                      <p className="text-sm text-red-500">{emailError}</p>
                    )}

                    {/* 로그인 유도 (작게) */}
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        💡 이미 회원이신가요?{' '}
                        <Link href="/login" className="text-primary-600 font-medium hover:underline">
                          로그인하기
                        </Link>
                      </p>
                    </div>
                  </div>
                )}
              </div>

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

                <div className="grid grid-cols-1 gap-3">
                  <div className="p-4 rounded-xl border-2 border-primary-500 bg-primary-50 text-center">
                    <div className="text-2xl mb-1">💳</div>
                    <div className="text-sm font-medium text-primary-600">신용카드</div>
                  </div>
                </div>
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

      {/* KCP PC 결제용 폼 (문서 3.5.2 기준) */}
      <form ref={kcpFormRef} name="order_info" method="post" style={{ display: 'none' }}>
        {/* 필수 파라미터 */}
        <input type="hidden" name="site_cd" value={kcpPayload?.flow === 'pc' ? kcpPayload.siteCd : ''} />
        <input type="hidden" name="site_name" value={KCP_SITE_NAME} />
        <input type="hidden" name="pay_method" value={kcpPayload?.flow === 'pc' ? kcpPayload.payMethod : ''} />
        <input type="hidden" name="currency" value="WON" />
        <input type="hidden" name="ordr_idxx" value={kcpPayload?.flow === 'pc' ? kcpPayload.orderNumber : ''} />
        <input type="hidden" name="good_name" value={kcpPayload?.flow === 'pc' ? kcpPayload.goodName : ''} />
        <input type="hidden" name="good_mny" value={kcpPayload?.flow === 'pc' ? String(kcpPayload.amount) : ''} />
        <input type="hidden" name="good_expr" value="0" />
        <input type="hidden" name="shop_user_id" value={user?.id || guestEmail || ''} />
        {/* 주문자 정보 */}
        <input type="hidden" name="buyr_name" value={shippingInfo.name} />
        <input type="hidden" name="buyr_tel2" value={shippingInfo.phone} />
        <input type="hidden" name="buyr_mail" value={user?.email || guestEmail} />
        {/* KCP 결제창 스크립트 URL (리얼/테스트 구분) */}
        <input type="hidden" name="g_conf_js_url" value="https://spay.kcp.co.kr/plugin/kcp_spay_hub.js" />
        {/* Ret_URL - PC에서는 m_Completepayment 콜백으로 처리하지만 폼에 포함 */}
        <input type="hidden" name="Ret_URL" value={kcpPayload?.flow === 'pc' ? kcpPayload.retUrl : ''} />
        {/* KCP 결제창에서 세팅되는 인증 결과 필드 */}
        <input type="hidden" name="res_cd" value="" />
        <input type="hidden" name="res_msg" value="" />
        <input type="hidden" name="enc_data" value="" />
        <input type="hidden" name="enc_info" value="" />
        <input type="hidden" name="tran_cd" value="" />
      </form>

      {/* KCP 모바일 결제용 폼 */}
      <form ref={kcpMobileFormRef} method="post" style={{ display: 'none' }}>
        <input type="hidden" name="site_cd" value={kcpPayload?.flow === 'mobile' ? kcpPayload.siteCd : ''} />
        <input type="hidden" name="pay_method" value={kcpPayload?.flow === 'mobile' ? kcpPayload.payMethod : ''} />
        <input type="hidden" name="currency" value="410" />
        <input type="hidden" name="shop_name" value={KCP_SITE_NAME} />
        <input type="hidden" name="Ret_URL" value={kcpPayload?.flow === 'mobile' ? kcpPayload.retUrl : ''} />
        <input type="hidden" name="approval_key" value={kcpPayload?.flow === 'mobile' ? kcpPayload.approvalKey : ''} />
        <input type="hidden" name="PayUrl" value={kcpPayload?.flow === 'mobile' ? kcpPayload.payUrl : ''} />
        <input type="hidden" name="ordr_idxx" value={kcpPayload?.flow === 'mobile' ? kcpPayload.orderNumber : ''} />
        <input type="hidden" name="good_name" value={kcpPayload?.flow === 'mobile' ? kcpPayload.goodName : ''} />
        <input type="hidden" name="good_mny" value={kcpPayload?.flow === 'mobile' ? String(kcpPayload.amount) : ''} />
        <input type="hidden" name="buyr_name" value={shippingInfo.name} />
        <input type="hidden" name="buyr_tel2" value={shippingInfo.phone} />
        <input type="hidden" name="buyr_mail" value={user?.email || guestEmail} />
      </form>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-fade-in ${
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
