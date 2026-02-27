'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Image from 'next/image'
import { calculatePrice, calculateShippingFee } from '@/lib/supabase'

// ─── 메달 스타일 (vastgifts Step 1 동일) ─────────────────────────────
const MEDAL_STYLES = [
  {
    id: 'soft_enamel',
    name: '일반칠',
    english: 'Soft Enamel',
    gradient: 'from-amber-300 to-yellow-500',
    emoji: '🏅',
  },
  {
    id: 'die_struck',
    name: '다이캐스트',
    english: 'Die Cast',
    gradient: 'from-gray-300 to-gray-500',
    emoji: '🥇',
  },
  {
    id: '3d',
    name: '3D 다이캐스트',
    english: '3D Die Cast',
    gradient: 'from-amber-400 to-orange-600',
    emoji: '🎖️',
  },
]

// ─── 메달 사이즈 (vastgifts Step 2 동일) ─────────────────────────────
// priceSize: 기존 calculatePrice에 매핑되는 크기 값
const MEDAL_SIZES = [
  { value: 40, label: '44.5mm', priceSize: 40 },
  { value: 50, label: '50.8mm', priceSize: 50 },
  { value: 60, label: '63.5mm', priceSize: 60 },
  { value: 70, label: '69.9mm (인기)', priceSize: 70 },
  { value: 80, label: '76.2mm', priceSize: 80 },
  { value: 0, label: '알아서 결정해주세요', priceSize: 70 },
]

// ─── 리본 고리 타입 (vastgifts Step 3 동일) ──────────────────────────
const RIBBON_TYPES = [
  { id: 'round', name: '고리형', english: 'Round Shape', emoji: '🔗' },
  { id: 'wide_sewn', name: '넓은 리본 - 봉제형', english: 'Sewn to Fit', emoji: '🎀' },
  { id: 'wide_free', name: '넓은 리본 - 자유형', english: 'Free-Moving Ribbon', emoji: '🎗️' },
]

const RIBBON_WIDTHS = [
  { value: '19mm', label: '19.1mm' },
  { value: '25mm', label: '25.4mm (가장 인기)' },
  { value: '32mm', label: '31.8mm' },
  { value: '38mm', label: '38.1mm' },
]

const RIBBON_LENGTHS = [
  { value: '37cm', label: '36.8cm' },
  { value: '41cm', label: '40.6cm (가장 인기)' },
  { value: '46cm', label: '45.7cm' },
]

// ─── 도금 색상 (vastgifts Step 4 동일 6종) ───────────────────────────
const METAL_FINISHES = [
  { id: 'gold', name: '금도금', english: 'Gold', image: '/plating/plating_gold.png', cssColor: 'bg-gradient-to-br from-yellow-300 to-amber-500' },
  { id: 'silver', name: '은도금', english: 'Silver (Nickel)', image: '/plating/plating_silver.png', cssColor: 'bg-gradient-to-br from-gray-200 to-gray-400' },
  { id: 'copper', name: '동도금', english: 'Bronze (Copper)', image: '/plating/plating_copper.png', cssColor: 'bg-gradient-to-br from-amber-600 to-orange-800' },
  { id: 'antique_gold', name: '앤틱 금', english: 'Antique Gold', image: '/plating/plating_antique_gold.png', cssColor: 'bg-gradient-to-br from-yellow-600 to-amber-800' },
  { id: 'antique_silver', name: '앤틱 은', english: 'Antique Silver', image: '/plating/plating_antique_silver.png', cssColor: 'bg-gradient-to-br from-gray-400 to-gray-600' },
  { id: 'antique_copper', name: '앤틱 동', english: 'Antique Bronze (Copper)', image: '/plating/plating_antique_copper.png', cssColor: 'bg-gradient-to-br from-orange-700 to-amber-900' },
]

// ─── 포장 방식 (vastgifts Step 5 동일) ───────────────────────────────
const PACKING_OPTIONS = [
  { id: 'clear_bag', name: '투명 봉투', english: 'Clear Bag', price: 0, tag: '무료', emoji: '🛍️' },
  { id: 'plastic_box', name: '플라스틱 케이스', english: 'Plastic Box', price: 500, tag: '+₩500', emoji: '📦' },
  { id: 'velvet_bag', name: '벨벳 주머니', english: 'Velvet Bag', price: 800, tag: '+₩800', emoji: '👝' },
  { id: 'velvet_box', name: '벨벳 케이스', english: 'Velvet Box', price: 1500, tag: '+₩1,500', emoji: '🎁' },
]

const ACCEPTED_FILES = '.jpeg,.jpg,.png,.pdf,.psd,.ai,.eps,.svg'
const MAX_FILE_SIZE = 10 * 1024 * 1024

export default function OrderPage() {
  const router = useRouter()
  // ─── Step 1: 메달 스타일 ───
  const [medalStyle, setMedalStyle] = useState('')
  // ─── Step 2: 사이즈 & 수량 ───
  const [size, setSize] = useState(0)
  const [quantity, setQuantity] = useState<number | ''>('')
  // ─── Step 3: 리본 고리 타입 ───
  const [ribbonType, setRibbonType] = useState('')
  const [ribbonWidth, setRibbonWidth] = useState('')
  const [ribbonLength, setRibbonLength] = useState('')
  // ─── Step 4: 도금 색상 ───
  const [metalFinish, setMetalFinish] = useState('')
  // ─── Step 5: 포장 방식 ───
  const [packing, setPacking] = useState('')
  // ─── Step 6: 디자인 파일 ───
  const [artworkFile, setArtworkFile] = useState<File | null>(null)
  const [notes, setNotes] = useState('')
  const [purpose, setPurpose] = useState('')
  // ─── UI 상태 ───
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  // ─── 실시간 가격 계산 ─────────────────────────────────────────────
  const selectedSize = MEDAL_SIZES.find(s => s.value === size)
  const priceSize = selectedSize?.priceSize || 70
  const paintType = medalStyle || 'soft_enamel'
  const qty = typeof quantity === 'number' && quantity > 0 ? quantity : 1
  const price = calculatePrice(paintType, priceSize, qty)
  const packingPrice = (PACKING_OPTIONS.find(p => p.id === packing)?.price || 0) * qty
  const shippingFee = calculateShippingFee(price.total + packingPrice)
  const totalEstimate = price.total + packingPrice + shippingFee

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_FILE_SIZE) {
      alert('파일 크기가 10MB를 초과합니다.')
      return
    }
    setArtworkFile(file)
  }

  // 비회원 바로 주문하기 - localStorage에 저장 후 checkout으로 이동
  const handleDirectOrder = () => {
    if (!medalStyle) { alert('Step 1: 메달 스타일을 선택해주세요.'); return }
    if (!quantity) { alert('Step 2: 수량을 입력해주세요.'); return }
    if (!metalFinish) { alert('Step 4: 도금 색상을 선택해주세요.'); return }

    const checkoutItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      paint_type: medalStyle,
      metal_color: metalFinish,
      size: priceSize,
      quantity: qty,
      design_url: null,
      design_name: artworkFile?.name || null,
    }

    localStorage.setItem('tempCheckoutItems', JSON.stringify([checkoutItem]))
    router.push('/checkout')
  }

  // ─── 스텝 헤더 공통 컴포넌트 ──────────────────────────────────────
  const StepHeader = ({ step, title, english, required = true }: { step: number; title: string; english: string; required?: boolean }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">{step}</div>
      <div>
        <h2 className="text-lg font-bold">
          {title} {required && <span className="text-red-500">*</span>}
        </h2>
        <p className="text-sm text-gray-400">{english}</p>
      </div>
    </div>
  )

  return (
    <>
      <Header />
      <main className="pt-20 bg-gray-50 min-h-screen">
        {/* ─── Hero ─────────────────────────────────────────────── */}
        <div className="bg-gray-900 text-white py-14 sm:py-20">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <p className="text-amber-400 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-4">
              Medal Manufacturing
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold mb-5">메달 제작하기</h1>
            <p className="text-gray-400 leading-relaxed">
              원하는 옵션을 선택하고 <span className="text-amber-400 font-medium">바로 주문</span>하세요.
              <br className="hidden sm:block" />
              실시간으로 예상 가격을 확인할 수 있습니다. 회원가입 없이 주문 가능합니다.
            </p>
          </div>
        </div>

        {/* ─── 비회원 주문 안내 배너 ─────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 pt-8 sm:pt-10">
          <div className="bg-white border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">👤</div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 text-sm">회원가입 없이 바로 주문할 수 있습니다</p>
              <p className="text-xs text-gray-500 mt-0.5">옵션 선택 → 주문하기 → 배송지 입력 → 결제 순서로 진행됩니다</p>
            </div>
          </div>
        </div>

        {/* ─── Form + Sidebar ───────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">

              {/* ─── 좌측: 폼 영역 ──────────────────────────────── */}
              <div className="lg:col-span-2 space-y-12">

                {/* ═══ Step 1: 메달 스타일 ═══════════════════════ */}
                <section>
                  <StepHeader step={1} title="메달 스타일 선택" english="Select Medal Style" />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {MEDAL_STYLES.map((style) => (
                      <button type="button" key={style.id} onClick={() => setMedalStyle(style.id)}
                        className={`relative rounded-2xl border-2 overflow-hidden transition-all group ${
                          medalStyle === style.id ? 'border-gray-900 shadow-lg ring-1 ring-gray-900' : 'border-gray-200 hover:border-gray-400'
                        }`}>
                        {/* ⚠️ 실제 메달 사진으로 교체 필요 (public/medal-styles/) */}
                        <div className={`aspect-[4/3] bg-gradient-to-br ${style.gradient} flex items-center justify-center`}>
                          <span className="text-6xl drop-shadow-lg group-hover:scale-110 transition-transform">{style.emoji}</span>
                        </div>
                        <div className="p-4 bg-white">
                          <p className="font-bold text-sm">{style.name}</p>
                          <p className="text-xs text-gray-400">{style.english}</p>
                        </div>
                        {medalStyle === style.id && (
                          <div className="absolute top-3 right-3 w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">✓</div>
                        )}
                      </button>
                    ))}
                  </div>
                </section>

                {/* ═══ Step 2: 사이즈 & 수량 ═════════════════════ */}
                <section>
                  <StepHeader step={2} title="사이즈, 수량 선택" english="Select Size, Quantity" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">메달 사이즈 <span className="text-red-500">*</span></label>
                      <select value={size} onChange={(e) => setSize(Number(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all">
                        <option value="" disabled>사이즈를 선택하세요...</option>
                        {MEDAL_SIZES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">수량 <span className="text-red-500">*</span></label>
                      <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                        placeholder="수량을 입력하세요"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all no-spinner"
                        min="1" />
                    </div>
                  </div>
                </section>

                {/* ═══ Step 3: 리본 고리 타입 ═════════════════════ */}
                <section>
                  <StepHeader step={3} title="리본 고리 타입 선택" english="Select Ribbon Loop Type" />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {RIBBON_TYPES.map((ribbon) => (
                      <button type="button" key={ribbon.id} onClick={() => setRibbonType(ribbon.id)}
                        className={`relative rounded-2xl border-2 overflow-hidden transition-all ${
                          ribbonType === ribbon.id ? 'border-gray-900 shadow-lg ring-1 ring-gray-900' : 'border-gray-200 hover:border-gray-400'
                        }`}>
                        {/* ⚠️ 실제 리본 사진으로 교체 필요 (public/ribbon/) */}
                        <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                          <span className="text-5xl">{ribbon.emoji}</span>
                        </div>
                        <div className="p-4 bg-white text-center">
                          <p className="font-bold text-sm">{ribbon.name}</p>
                          <p className="text-xs text-gray-400">{ribbon.english}</p>
                        </div>
                        {ribbonType === ribbon.id && (
                          <div className="absolute top-3 right-3 w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">✓</div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">리본 너비 <span className="text-red-500">*</span></label>
                      <select value={ribbonWidth} onChange={(e) => setRibbonWidth(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all">
                        <option value="" disabled>너비를 선택하세요...</option>
                        {RIBBON_WIDTHS.map((w) => (
                          <option key={w.value} value={w.value}>{w.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">리본 길이 <span className="text-red-500">*</span></label>
                      <select value={ribbonLength} onChange={(e) => setRibbonLength(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all">
                        <option value="" disabled>길이를 선택하세요...</option>
                        {RIBBON_LENGTHS.map((l) => (
                          <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </section>

                {/* ═══ Step 4: 도금 색상 ═════════════════════════ */}
                <section>
                  <StepHeader step={4} title="도금 색상 선택" english="Select Metal Finish" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {METAL_FINISHES.map((metal) => (
                      <button type="button" key={metal.id} onClick={() => setMetalFinish(metal.id)}
                        className={`relative rounded-2xl border-2 overflow-hidden transition-all ${
                          metalFinish === metal.id ? 'border-gray-900 shadow-lg ring-1 ring-gray-900' : 'border-gray-200 hover:border-gray-400'
                        }`}>
                        <div className="aspect-square bg-white flex items-center justify-center p-3">
                          {metal.image && !imageErrors[metal.id] ? (
                            <div className="relative w-full h-full">
                              <Image src={metal.image} alt={metal.name} fill className="object-contain" sizes="150px"
                                onError={() => setImageErrors(prev => ({ ...prev, [metal.id]: true }))} />
                            </div>
                          ) : (
                            <div className={`w-20 h-20 rounded-full ${metal.cssColor} shadow-inner`} />
                          )}
                        </div>
                        <div className="p-3 bg-white border-t border-gray-100 text-center">
                          <p className="font-bold text-sm">{metal.name}</p>
                          <p className="text-xs text-gray-400">{metal.english}</p>
                        </div>
                        {metalFinish === metal.id && (
                          <div className="absolute top-3 right-3 w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">✓</div>
                        )}
                      </button>
                    ))}
                  </div>
                </section>

                {/* ═══ Step 5: 포장 방식 ═════════════════════════ */}
                <section>
                  <StepHeader step={5} title="포장 방식 선택" english="Choose Packing" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {PACKING_OPTIONS.map((pack) => (
                      <button type="button" key={pack.id} onClick={() => setPacking(pack.id)}
                        className={`relative rounded-2xl border-2 overflow-hidden transition-all ${
                          packing === pack.id ? 'border-gray-900 shadow-lg ring-1 ring-gray-900' : 'border-gray-200 hover:border-gray-400'
                        }`}>
                        {/* ⚠️ 실제 포장 사진으로 교체 필요 (public/packing/) */}
                        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                          <span className="text-4xl">{pack.emoji}</span>
                        </div>
                        <div className="p-3 bg-white border-t border-gray-100 text-center">
                          <p className="font-bold text-xs sm:text-sm">{pack.name}</p>
                          <p className="text-xs text-gray-400">{pack.english}</p>
                          <span className={`inline-block mt-1.5 text-xs font-bold px-2 py-0.5 rounded-full ${
                            pack.price === 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}>{pack.tag}</span>
                        </div>
                        {packing === pack.id && (
                          <div className="absolute top-3 right-3 w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">✓</div>
                        )}
                      </button>
                    ))}
                  </div>
                </section>

                {/* ═══ Step 6: 디자인 파일 ═══════════════════════ */}
                <section>
                  <StepHeader step={6} title="디자인 파일 업로드" english="Artwork Request" required={false} />

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">디자인 파일 업로드</label>
                      <label className="block border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all">
                        <input type="file" className="hidden" accept={ACCEPTED_FILES} onChange={handleFileChange} />
                        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">📁</div>
                        {artworkFile ? (
                          <div>
                            <p className="font-semibold text-green-600">✓ {artworkFile.name}</p>
                            <p className="text-xs text-gray-400 mt-1">{(artworkFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setArtworkFile(null) }}
                              className="mt-2 text-xs text-red-500 hover:underline">파일 삭제</button>
                          </div>
                        ) : (
                          <div>
                            <p className="font-semibold text-gray-700">파일을 업로드하세요</p>
                            <p className="text-xs text-gray-400 mt-1">지원 형식: JPEG, JPG, PNG, PDF, PSD, AI, EPS, SVG</p>
                            <p className="text-xs text-gray-400">최대 파일 크기: 10MB</p>
                          </div>
                        )}
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">참고사항 / 요청사항</label>
                      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                        placeholder="디자인에 대한 참고사항이나 특별 요청사항을 적어주세요"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">맞춤 메달의 용도는 무엇인가요?</label>
                      <textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} rows={2}
                        placeholder="예: 마라톤 대회 시상, 기업 행사, 졸업 기념 등"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none" />
                    </div>
                  </div>
                </section>

                {/* ─── 주문 버튼 ─────────────────────────────────── */}
                <div className="pt-4">
                  <button type="button" onClick={handleDirectOrder}
                    className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl">
                    주문하기 →
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-3">
                    회원가입 없이 바로 주문 가능 · 배송지 입력 후 결제가 진행됩니다
                  </p>
                </div>
              </div>

              {/* ─── 우측: 실시간 견적 사이드바 (PC) ──────────── */}
              <div className="hidden lg:block">
                <div className="sticky top-24 space-y-4">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <h3 className="font-bold text-sm text-gray-900">주문 요약</h3>
                    </div>

                    <div className="space-y-3 text-sm mb-5">
                      <div className="flex justify-between">
                        <span className="text-gray-500">메달 스타일</span>
                        <span className="font-medium">{MEDAL_STYLES.find(s => s.id === medalStyle)?.name || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">사이즈</span>
                        <span className="font-medium">{selectedSize ? selectedSize.label.split('=')[1]?.trim() || selectedSize.label : '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">수량</span>
                        <span className="font-medium">{qty > 0 ? `${qty}개` : '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">도금 색상</span>
                        <span className="font-medium">{METAL_FINISHES.find(m => m.id === metalFinish)?.name || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">포장</span>
                        <span className="font-medium">{PACKING_OPTIONS.find(p => p.id === packing)?.name || '-'}</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                      <div className="flex justify-between text-gray-500">
                        <span>제작비 (단가 ₩{price.unitPrice.toLocaleString()} × {qty})</span>
                        <span>₩{price.total.toLocaleString()}</span>
                      </div>
                      {packingPrice > 0 && (
                        <div className="flex justify-between text-gray-500">
                          <span>포장비</span>
                          <span>₩{packingPrice.toLocaleString()}</span>
                        </div>
                      )}
                      {price.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>수량 할인</span>
                          <span>-₩{price.discount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-500">
                        <span>배송비</span>
                        <span>{shippingFee === 0 ? '무료' : `₩${shippingFee.toLocaleString()}`}</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 mt-4 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">예상 총액</span>
                        <span className="text-2xl font-extrabold text-gray-900">₩{totalEstimate.toLocaleString()}</span>
                      </div>
                      {price.discount > 0 && (
                        <p className="text-xs text-amber-600 text-right mt-1">수량 할인 -₩{price.discount.toLocaleString()} 적용</p>
                      )}
                    </div>
                  </div>

                  <button type="button" onClick={handleDirectOrder}
                    className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg">
                    주문하기 →
                  </button>

                  <p className="text-xs text-gray-400 text-center">
                    배송지 입력 후 결제가 진행됩니다
                  </p>
                </div>
              </div>
            </div>
        </div>

        {/* ─── 모바일 플로팅 가격 바 ─────────────────────────────── */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                예상 총액
              </p>
              <p className="text-xl font-extrabold text-gray-900">₩{totalEstimate.toLocaleString()}</p>
            </div>
            <button type="button" onClick={handleDirectOrder}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all">
              주문하기
            </button>
          </div>
        </div>
        <div className="lg:hidden h-20" />
      </main>
    </>
  )
}
