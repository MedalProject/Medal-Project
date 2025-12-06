'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { createClient, calculatePrice, priceTable } from '@/lib/supabase'

const metalColors = [
  { id: 'gold', name: '금도금', class: 'metal-gold' },
  { id: 'silver', name: '은도금', class: 'metal-silver' },
]

const sizes = [
  { size: 30, label: '30×30mm 이하', addon: 0, popular: true },
  { size: 40, label: '40×40mm 이하', addon: 1200 },
  { size: 50, label: '50×50mm 이하', addon: 2500 },
]

export default function OrderPage() {
  const router = useRouter()
  const supabase = createClient()
  
  // State
  const [user, setUser] = useState<any>(null)
  const [badgeType, setBadgeType] = useState('normal')
  const [metalColor, setMetalColor] = useState('gold')
  const [size, setSize] = useState(30)
  const [quantity, setQuantity] = useState(10)
  const [designIcon, setDesignIcon] = useState('📤')
  const [designFile, setDesignFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  // Check auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  // Calculate price
  const price = calculatePrice(badgeType, size, quantity)

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const fileExt = file.name.split('.').pop()?.toLowerCase()
      
      // 지원 파일 형식 확인
      if (fileExt === 'pdf' || fileExt === 'ai' || fileExt === 'psd') {
        setDesignFile(file)
        
        if (fileExt === 'pdf') {
          setDesignIcon('📄')
        } else if (fileExt === 'ai') {
          setDesignIcon('🎨')
        } else if (fileExt === 'psd') {
          setDesignIcon('🖌️')
        }
        
        showToast('파일 업로드 완료!')
      } else {
        showToast('PDF, AI, PSD 파일만 업로드 가능합니다.')
      }
    }
  }

  // Show toast
  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(''), 3000)
  }

  // Handle order
  const handleOrder = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!designFile) {
      showToast('디자인 파일을 업로드해주세요.')
      return
    }

    setLoading(true)

    try {
      // Upload design file if exists
      let designUrl = null
      if (designFile) {
        const fileExt = designFile.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('designs')
          .upload(fileName, designFile)

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('designs')
            .getPublicUrl(fileName)
          designUrl = publicUrl
        }
      }

      // Generate order number
      const orderNumber = `BF${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`

      // Create order
      const { error } = await supabase.from('orders').insert({
        user_id: user.id,
        order_number: orderNumber,
        badge_type: badgeType,
        metal_color: metalColor,
        size: size,
        quantity: quantity,
        design_url: designUrl,
        design_name: designFile?.name || designIcon,
        unit_price: price.unitPrice,
        discount_amount: price.discount,
        total_price: price.total,
        status: 'pending',
      })

      if (error) throw error

      showToast('주문이 생성되었습니다!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Order error:', error)
      showToast('주문 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      
      <main className="pt-24 pb-16 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">
              나만의 뱃지 만들기
            </h1>
            <p className="text-gray-500 text-lg">디자인 파일 업로드 후 옵션을 선택하세요</p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Options Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upload Section */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 bg-primary-100 rounded-xl flex items-center justify-center text-xl">🎨</div>
                  <div>
                    <h2 className="font-bold text-lg">디자인 업로드</h2>
                    <p className="text-gray-500 text-sm">디자인 파일을 업로드해주세요</p>
                  </div>
                </div>

                <label className="block border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-all">
                  <input type="file" className="hidden" accept=".pdf,.ai,.psd,application/pdf,application/postscript" onChange={handleFileChange} />
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                    📤
                  </div>
                  <p className="font-semibold mb-2">디자인 파일을 드래그하거나 클릭하세요</p>
                  <p className="text-gray-400 text-sm">PDF, AI, PSD 파일 지원 (최대 50MB)</p>
                  {designFile && (
                    <div className="mt-4 space-y-2">
                      <p className="text-primary-600 font-medium">✓ {designFile.name}</p>
                      <p className="text-gray-500 text-xs">
                        크기: {(designFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {/* Paint Type */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center text-xl">🎨</div>
                  <div>
                    <h2 className="font-bold text-lg">칠 종류</h2>
                    <p className="text-gray-500 text-sm">원하는 칠 종류를 선택하세요</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(priceTable).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => setBadgeType(key)}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
                        badgeType === key
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">
                        {key === 'normal' ? '🖌️' : key === 'epoxy' ? '💧' : '✨'}
                      </div>
                      <div className="font-semibold text-sm">{value.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {value.addon === 0 ? '+₩0' : `+₩${value.addon.toLocaleString()}`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Metal Color */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center text-xl">🪙</div>
                  <div>
                    <h2 className="font-bold text-lg">도금 색상</h2>
                    <p className="text-gray-500 text-sm">실시간으로 미리보기에 반영됩니다</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {metalColors.map((metal) => (
                    <button
                      key={metal.id}
                      onClick={() => setMetalColor(metal.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        metalColor === metal.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full mx-auto mb-2 ${metal.class} shadow-md`} />
                      <div className="text-sm font-medium">{metal.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center text-xl">📐</div>
                  <div>
                    <h2 className="font-bold text-lg">크기 선택</h2>
                    <p className="text-gray-500 text-sm">크기에 따라 추가요금이 발생합니다</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {sizes.map((s) => (
                    <button
                      key={s.size}
                      onClick={() => setSize(s.size)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        size === s.size
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="font-semibold text-sm mb-1">{s.label}</div>
                      <div className="text-xs text-gray-500">
                        {s.addon === 0 ? '기본' : `+₩${s.addon.toLocaleString()}`}
                        {s.popular && ' · 인기'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center text-xl">📦</div>
                  <div>
                    <h2 className="font-bold text-lg">수량</h2>
                    <p className="text-gray-500 text-sm">많이 주문할수록 더 많이 할인됩니다</p>
                  </div>
                </div>

                {/* 수량 입력 */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 10))}
                      className="w-12 h-12 text-xl hover:bg-primary-500 hover:text-white transition-colors"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-24 h-12 text-center font-bold text-lg bg-white border-0"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 10)}
                      className="w-12 h-12 text-xl hover:bg-primary-500 hover:text-white transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-gray-500 text-sm">개</span>
                </div>

                {/* 수량별 할인 테이블 */}
                <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">📊 수량별 할인 혜택</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { min: 1, max: 99, discount: 0, label: '1~99개' },
                      { min: 100, max: 299, discount: 300, label: '100~299개' },
                      { min: 300, max: 499, discount: 600, label: '300~499개' },
                      { min: 500, max: 999, discount: 1200, label: '500~999개' },
                      { min: 1000, max: 4999, discount: 1300, label: '1,000~4,999개' },
                      { min: 5000, max: Infinity, discount: 1500, label: '5,000개 이상' },
                    ].map((tier) => {
                      const isActive = quantity >= tier.min && quantity <= tier.max
                      return (
                        <button
                          key={tier.label}
                          onClick={() => setQuantity(tier.min)}
                          className={`p-3 rounded-xl text-center transition-all ${
                            isActive
                              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                              : 'bg-white border border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <div className={`text-xs mb-1 ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                            {tier.label}
                          </div>
                          <div className={`font-bold ${isActive ? 'text-white' : 'text-gray-900'}`}>
                            {tier.discount === 0 ? '기본가' : `-₩${tier.discount.toLocaleString()}`}
                          </div>
                          {tier.discount > 0 && (
                            <div className={`text-xs ${isActive ? 'text-white/80' : 'text-green-600'}`}>
                              개당 할인
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 현재 적용된 할인 */}
                {price.discountPerUnit > 0 && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
                      🎉
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-green-800">대량 할인 적용 중!</p>
                      <p className="text-sm text-green-600">
                        개당 <span className="font-bold">₩{price.discountPerUnit.toLocaleString()}</span> 할인 → 
                        총 <span className="font-bold text-green-700">₩{price.discount.toLocaleString()}</span> 절약
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Preview Column */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 shadow-sm sticky top-24">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <span className="text-primary-500">●</span>
                  실시간 미리보기
                </h3>

                {/* Badge Preview */}
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'linear-gradient(90deg, transparent 49.5%, #000 49.5%, #000 50.5%, transparent 50.5%), linear-gradient(0deg, transparent 49.5%, #000 49.5%, #000 50.5%, transparent 50.5%)',
                    backgroundSize: '20px 20px'
                  }} />
                  
                  {designFile ? (
                    // 파일 업로드 완료 상태
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                      <div className={`w-32 h-32 rounded-2xl shadow-2xl flex items-center justify-center mb-4 ${
                        designFile.name.endsWith('.pdf') ? 'bg-gradient-to-br from-green-400 to-emerald-600' :
                        designFile.name.endsWith('.ai') ? 'bg-gradient-to-br from-orange-400 to-pink-500' :
                        'bg-gradient-to-br from-blue-400 to-cyan-500'
                      }`}>
                        <span className="text-6xl">{designIcon}</span>
                      </div>
                      <p className="font-bold text-lg mb-2">
                        {designFile.name.endsWith('.pdf') ? 'PDF 파일' :
                         designFile.name.endsWith('.ai') ? 'Illustrator 파일' :
                         'Photoshop 파일'}
                      </p>
                      <p className="text-sm text-gray-600 mb-1 truncate max-w-full px-4">{designFile.name}</p>
                      <p className="text-xs text-gray-500 mb-4">
                        {(designFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center gap-2">
                        <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</span>
                        파일 업로드 완료
                      </div>
                    </div>
                  ) : (
                    // 파일 업로드 대기 상태
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                      <div className={`w-32 h-32 rounded-full ${metalColors.find(m => m.id === metalColor)?.class} shadow-2xl flex items-center justify-center mb-4 badge-float`}>
                        <span className="text-5xl">📤</span>
                      </div>
                      <p className="font-medium text-gray-600 mb-2">디자인 파일을 업로드해주세요</p>
                      <p className="text-xs text-gray-400">PDF, AI, PSD 파일 지원</p>
                    </div>
                  )}
                </div>

                {/* Price Display */}
                <div className="bg-gray-900 rounded-2xl p-6 text-white">
                  <div className="flex justify-between text-sm text-gray-400 mb-3">
                    <span>단가 (크기 추가요금 포함)</span>
                    <span>₩{price.unitPrice.toLocaleString()}</span>
                  </div>
                  {price.sizeAddonPrice > 0 && (
                    <div className="flex justify-between text-sm text-gray-500 mb-3 text-xs">
                      <span className="pl-2">└ 크기 추가요금</span>
                      <span>+₩{price.sizeAddonPrice.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-400 mb-3">
                    <span>수량</span>
                    <span>× {quantity}개</span>
                  </div>
                  {price.discountPerUnit > 0 && (
                    <div className="flex justify-between text-sm text-green-400 mb-3">
                      <span>대량 할인 (개당 -₩{price.discountPerUnit.toLocaleString()})</span>
                      <span>-₩{price.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-700 pt-4 mt-4">
                    <div className="flex justify-between items-end">
                      <span className="text-gray-400">총 예상 금액</span>
                      <span className="font-display text-3xl font-bold text-amber-400">
                        ₩{price.total.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-right text-xs text-gray-500 mt-2">
                      개당 ₩{Math.round(price.total / quantity).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={handleOrder}
                  disabled={loading}
                  className="w-full mt-6 py-4 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {loading ? '주문 처리 중...' : user ? '주문하기' : '로그인하고 주문하기'}
                </button>

                <p className="text-center text-sm text-gray-500 mt-4">
                  🚀 예상 배송일: 7일 이내
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 right-8 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up z-50">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">✓</div>
          {toast}
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </>
  )
}
