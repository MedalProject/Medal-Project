'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { createClient, calculatePrice, priceTable } from '@/lib/supabase'

const metalColors = [
  { id: 'gold', name: '금도금', class: 'metal-gold' },
  { id: 'silver', name: '은도금', class: 'metal-silver' },
  { id: 'rose-gold', name: '로즈골드', class: 'metal-rose-gold' },
  { id: 'black-nickel', name: '흑니켈', class: 'metal-black-nickel' },
]

const sizes = [
  { size: 20, label: '20mm' },
  { size: 25, label: '25mm', popular: true },
  { size: 30, label: '30mm' },
  { size: 40, label: '40mm' },
]

const templates = ['⭐', '❤️', '🌟', '🎵', '🔥', '💎', '🌈', '🚀', '🎯', '🏆', '🎨', '💡']

export default function OrderPage() {
  const router = useRouter()
  const supabase = createClient()
  
  // State
  const [user, setUser] = useState<any>(null)
  const [badgeType, setBadgeType] = useState('soft-enamel')
  const [metalColor, setMetalColor] = useState('gold')
  const [size, setSize] = useState(25)
  const [quantity, setQuantity] = useState(10)
  const [designIcon, setDesignIcon] = useState('⭐')
  const [designFile, setDesignFile] = useState<File | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
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
      setDesignFile(file)
      setDesignIcon('🖼️')
      showToast('디자인 파일이 선택되었습니다!')
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
            <p className="text-gray-500 text-lg">3단계로 간편하게 완성하세요</p>
          </div>

          {/* Step Progress */}
          <div className="flex justify-center gap-4 mb-12">
            {['디자인', '옵션 선택', '결제'].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  i === 0 ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-lg shadow-primary-500/30' : 'bg-gray-200 text-gray-500'
                }`}>
                  {i + 1}
                </div>
                <span className={`font-medium hidden sm:block ${i === 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step}
                </span>
                {i < 2 && <div className="w-12 h-1 bg-gray-200 rounded hidden sm:block" />}
              </div>
            ))}
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
                    <p className="text-gray-500 text-sm">이미지를 업로드하거나 템플릿을 선택하세요</p>
                  </div>
                </div>

                <label className="block border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-all">
                  <input type="file" className="hidden" accept=".pdf,.ai,.psd" onChange={handleFileChange} />
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                    📤
                  </div>
                  <p className="font-semibold mb-2">디자인 파일을 드래그하거나 클릭하세요</p>
                  <p className="text-gray-400 text-sm">PDF, AI, PSD 파일 지원 (최대 50MB)</p>
                  {designFile && (
                    <p className="mt-4 text-primary-600 font-medium">✓ {designFile.name}</p>
                  )}
                </label>

                <div className="my-6 text-center text-gray-400 text-sm">또는</div>

                <button
                  onClick={() => setShowTemplates(true)}
                  className="w-full py-4 border-2 border-primary-500 text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-colors"
                >
                  🎯 템플릿에서 선택하기
                </button>
              </div>

              {/* Badge Type */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center text-xl">✨</div>
                  <div>
                    <h2 className="font-bold text-lg">뱃지 타입</h2>
                    <p className="text-gray-500 text-sm">원하는 제작 방식을 선택하세요</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
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
                      <div className="text-3xl mb-2">
                        {key === 'soft-enamel' ? '🎖️' : key === 'hard-enamel' ? '💎' : key === 'printed' ? '🖨️' : '💠'}
                      </div>
                      <div className="font-semibold text-sm">{value.name}</div>
                      <div className="text-xs text-gray-500 mt-1">₩{value.base.toLocaleString()}~</div>
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

                <div className="grid grid-cols-4 gap-3">
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
                    <p className="text-gray-500 text-sm">가장 인기 있는 크기는 25mm입니다</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
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
                      <div className="font-display text-2xl font-bold">{s.size}</div>
                      <div className="text-xs text-gray-500">mm {s.popular && '· 인기'}</div>
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
                    <p className="text-gray-500 text-sm">많이 주문할수록 단가가 낮아집니다</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 text-xl hover:bg-primary-500 hover:text-white transition-colors"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 h-12 text-center font-bold text-lg bg-white border-0"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 text-xl hover:bg-primary-500 hover:text-white transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex gap-2">
                    {[1, 10, 50, 100].map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuantity(q)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:border-primary-500 hover:text-primary-600 transition-colors"
                      >
                        {q}개
                      </button>
                    ))}
                  </div>
                </div>

                {price.discountPercent > 0 && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-lg">
                      🎉
                    </div>
                    <div>
                      <p className="font-semibold text-green-700">대량 할인 적용!</p>
                      <p className="text-sm text-green-600">{quantity}개 이상 주문 시 {price.discountPercent}% 할인</p>
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
                  <div className={`w-40 h-40 rounded-full ${metalColors.find(m => m.id === metalColor)?.class} shadow-2xl flex flex-col items-center justify-center badge-float`}>
                    <span className="text-5xl mb-1">{designIcon}</span>
                    <span className="text-xs font-bold opacity-70">YOUR DESIGN</span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="bg-gray-900 rounded-2xl p-6 text-white">
                  <div className="flex justify-between text-sm text-gray-400 mb-3">
                    <span>기본 단가</span>
                    <span>₩{price.unitPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 mb-3">
                    <span>수량</span>
                    <span>× {quantity}개</span>
                  </div>
                  {price.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-400 mb-3">
                      <span>대량 할인 ({price.discountPercent}%)</span>
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

      {/* Template Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowTemplates(false)}>
          <div className="bg-white rounded-3xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl">템플릿 선택</h3>
              <button onClick={() => setShowTemplates(false)} className="w-10 h-10 bg-gray-100 rounded-full text-xl hover:bg-gray-200 transition-colors">
                ×
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {templates.map((icon) => (
                <button
                  key={icon}
                  onClick={() => {
                    setDesignIcon(icon)
                    setDesignFile(null)
                    setShowTemplates(false)
                    showToast('템플릿이 적용되었습니다!')
                  }}
                  className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center text-4xl hover:bg-primary-100 hover:scale-105 transition-all"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
