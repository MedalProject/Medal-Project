'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { createClient, calculatePrice, priceTable, calculateShippingFee, FREE_SHIPPING_THRESHOLD, MOLD_FEE, UserDesign } from '@/lib/supabase'

const metalColors = [
  { id: 'gold', name: '금도금', class: 'metal-gold' },
  { id: 'silver', name: '은도금', class: 'metal-silver' },
]

const sizes = [
  { size: 30, label: '30×30mm 이하', addon: 0 },
  { size: 40, label: '40×40mm 이하', addon: 600 },
  { size: 50, label: '50×50mm 이하', addon: 900 },
  { size: 60, label: '60×60mm 이하', addon: 1300 },
  { size: 70, label: '70×70mm 이하', addon: 1600 },
  { size: 80, label: '80×80mm 이하', addon: 2100 },
  { size: 90, label: '90×90mm 이하', addon: 2600 },
  { size: 100, label: '100×100mm 이하', addon: 3000 },
]

// 주문 항목 타입
type OrderItem = {
  id: string
  file: File | null          // 신규 디자인일 때만 사용
  designId: string | null    // 기존 디자인 재사용 시
  designUrl: string | null   // 기존 디자인 URL
  designName: string         // 파일명 또는 디자인명
  isNewMold: boolean         // 신규 금형 여부 (금형비 부과)
  paintType: string
  metalColor: string
  size: number
  quantity: number
}

export default function OrderPage() {
  const router = useRouter()
  const supabase = createClient()
  
  // State
  const [user, setUser] = useState<any>(null)
  const [paintType, setPaintType] = useState('normal')
  const [metalColor, setMetalColor] = useState('gold')
  const [size, setSize] = useState(30)
  const [quantity, setQuantity] = useState(1)
  const [designFile, setDesignFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [uploadHighlight, setUploadHighlight] = useState(false)
  
  // 디자인 선택 관련 상태
  const [designMode, setDesignMode] = useState<'new' | 'existing'>('new')
  const [userDesigns, setUserDesigns] = useState<UserDesign[]>([])
  const [selectedDesign, setSelectedDesign] = useState<UserDesign | null>(null)
  const [designsLoading, setDesignsLoading] = useState(false)
  
  // 주문 항목 목록
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  
  // 업로드 영역 ref
  const uploadRef = useRef<HTMLLabelElement>(null)

  // Check auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        loadUserDesigns(user.id)
      }
    })
  }, [])

  // 사용자의 기존 디자인 목록 로드
  const loadUserDesigns = async (userId: string) => {
    setDesignsLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_designs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        // 테이블이 없는 경우 빈 배열로 처리
        console.log('user_designs table not found or error:', error.message)
        setUserDesigns([])
        return
      }
      setUserDesigns(data || [])
    } catch (error) {
      console.error('Failed to load user designs:', error)
      setUserDesigns([])
    } finally {
      setDesignsLoading(false)
    }
  }

  // Calculate price for current selection
  const price = calculatePrice(paintType, size, quantity)

  // Calculate total price for all items (금형비 포함)
  const totalPrice = orderItems.reduce((sum, item) => {
    const itemPrice = calculatePrice(item.paintType, item.size, item.quantity)
    const moldFee = item.isNewMold ? MOLD_FEE : 0
    return sum + itemPrice.total + moldFee
  }, 0)

  // 금형비 총합
  const totalMoldFee = orderItems.reduce((sum, item) => {
    return sum + (item.isNewMold ? MOLD_FEE : 0)
  }, 0)

  const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0)

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const fileExt = file.name.split('.').pop()?.toLowerCase()
      
      if (fileExt === 'ai') {
        setDesignFile(file)
        showToast('파일 업로드 완료!')
      } else {
        showToast('AI 파일만 업로드 가능합니다.', 'error')
      }
    }
  }

  // 항목 추가
  const handleAddItem = () => {
    // 신규 디자인 모드일 때
    if (designMode === 'new') {
      if (!designFile) {
        showToast('⚠️ 디자인 파일을 먼저 업로드해주세요!', 'error')
        highlightUpload()
        return
      }

      const newItem: OrderItem = {
        id: Date.now().toString(),
        file: designFile,
        designId: null,
        designUrl: null,
        designName: designFile.name,
        isNewMold: true,
        paintType,
        metalColor,
        size,
        quantity: quantity || 1,
      }

      setOrderItems([...orderItems, newItem])
      setDesignFile(null)
      setQuantity(1)
      showToast('항목이 추가되었습니다! (신규 금형)')
      
      // 파일 입력 초기화
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } 
    // 기존 디자인 재사용 모드일 때
    else {
      if (!selectedDesign) {
        showToast('⚠️ 재사용할 디자인을 선택해주세요!', 'error')
        return
      }

      const newItem: OrderItem = {
        id: Date.now().toString(),
        file: null,
        designId: selectedDesign.id,
        designUrl: selectedDesign.design_url,
        designName: selectedDesign.design_name,
        isNewMold: false,
        paintType,
        metalColor,
        size,
        quantity: quantity || 1,
      }

      setOrderItems([...orderItems, newItem])
      setSelectedDesign(null)
      setQuantity(1)
      showToast('항목이 추가되었습니다! (기존 금형 재사용)')
    }
  }

  // 항목 삭제
  const handleRemoveItem = (id: string) => {
    setOrderItems(orderItems.filter(item => item.id !== id))
    showToast('항목이 삭제되었습니다.')
  }

  // 항목 수량 변경
  const handleItemQuantityChange = (id: string, newQuantity: number) => {
    setOrderItems(orderItems.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
    ))
  }

  // Show toast
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast(message)
    setToastType(type)
    setTimeout(() => setToast(''), 3000)
  }

  // 업로드 영역 하이라이트 + 스크롤
  const highlightUpload = () => {
    setUploadHighlight(true)
    setTimeout(() => setUploadHighlight(false), 2000)
    
    // 업로드 영역으로 부드럽게 스크롤
    uploadRef.current?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    })
  }

  // 디자인 파일 업로드 및 user_designs에 저장
  const uploadAndSaveDesign = async (file: File, userId: string): Promise<{ designUrl: string; designId: string | null } | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('designs')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('designs')
        .getPublicUrl(fileName)

      // user_designs 테이블에 저장 시도 (테이블이 없으면 스킵)
      let designId: string | null = null
      try {
        const { data: designData, error: designError } = await supabase
          .from('user_designs')
          .insert({
            user_id: userId,
            design_url: publicUrl,
            design_name: file.name,
            memo: null,
            preview_url: null,
            mold_completed: false,
          })
          .select()
          .single()

        if (!designError && designData) {
          designId = designData.id
        }
      } catch (e) {
        // user_designs 테이블이 없는 경우 무시
        console.log('user_designs table not found, skipping...')
      }

      return { designUrl: publicUrl, designId }
    } catch (error) {
      console.error('Design upload error:', error)
      return null
    }
  }

  // 장바구니에 담기
  const handleAddToCart = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    if (orderItems.length === 0) {
      showToast('장바구니에 담을 항목을 추가해주세요.')
      return
    }

    setLoading(true)

    try {
      for (const item of orderItems) {
        let designUrl = item.designUrl
        let designId = item.designId

        // 신규 디자인인 경우 업로드 및 저장
        if (item.isNewMold && item.file) {
          const result = await uploadAndSaveDesign(item.file, user.id)
          if (result) {
            designUrl = result.designUrl
            designId = result.designId
          }
        }

        // Add to cart (design_id, is_new_mold는 DB 스키마 업데이트 후 활성화)
        const { error } = await supabase.from('cart_items').insert({
          user_id: user.id,
          paint_type: item.paintType,
          metal_color: item.metalColor,
          size: item.size,
          quantity: item.quantity,
          design_url: designUrl,
          design_name: item.designName,
          // design_id: designId,        // TODO: DB 스키마 업데이트 후 활성화
          // is_new_mold: item.isNewMold, // TODO: DB 스키마 업데이트 후 활성화
        })

        if (error) throw error
      }

      showToast('장바구니에 담았습니다!')
      setOrderItems([])
      // 디자인 목록 새로고침
      loadUserDesigns(user.id)
    } catch (error) {
      console.error('Cart error:', error)
      showToast('장바구니 추가 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // Handle order - 장바구니에 담고 checkout으로 이동
  const handleOrder = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    if (orderItems.length === 0) {
      showToast('주문할 항목을 추가해주세요.')
      return
    }

    setLoading(true)

    try {
      // 먼저 장바구니에 모든 항목 추가
      for (const item of orderItems) {
        let designUrl = item.designUrl
        let designId = item.designId

        // 신규 디자인인 경우 업로드 및 저장
        if (item.isNewMold && item.file) {
          const result = await uploadAndSaveDesign(item.file, user.id)
          if (result) {
            designUrl = result.designUrl
            designId = result.designId
          }
        }

        // Add to cart (design_id, is_new_mold는 DB 스키마 업데이트 후 활성화)
        const { error } = await supabase.from('cart_items').insert({
          user_id: user.id,
          paint_type: item.paintType,
          metal_color: item.metalColor,
          size: item.size,
          quantity: item.quantity,
          design_url: designUrl,
          design_name: item.designName,
          // design_id: designId,        // TODO: DB 스키마 업데이트 후 활성화
          // is_new_mold: item.isNewMold, // TODO: DB 스키마 업데이트 후 활성화
        })

        if (error) throw error
      }

      // checkout 페이지로 이동
      router.push('/checkout')
    } catch (error) {
      console.error('Order error:', error)
      showToast('주문 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const getPaintTypeName = (type: string) => {
    return priceTable[type as keyof typeof priceTable]?.name || type
  }

  const getMetalColorName = (color: string) => {
    return metalColors.find(m => m.id === color)?.name || color
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
              {/* Design Selection Section */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 bg-primary-100 rounded-xl flex items-center justify-center text-xl">🎨</div>
                  <div>
                    <h2 className="font-bold text-lg">디자인 선택</h2>
                    <p className="text-gray-500 text-sm">신규 디자인 또는 기존 디자인을 선택하세요</p>
                  </div>
                </div>

                {/* 디자인 모드 선택 */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={() => {
                      setDesignMode('new')
                      setSelectedDesign(null)
                    }}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      designMode === 'new'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-2xl">📤</div>
                      <div className="font-semibold">신규 디자인</div>
                    </div>
                    <p className="text-sm text-gray-500">새 파일 업로드</p>
                    <p className="text-sm font-medium text-amber-600 mt-2">
                      +₩{MOLD_FEE.toLocaleString()} 금형비
                    </p>
                  </button>
                  
                  <button
                    onClick={() => {
                      if (!user) {
                        showToast('로그인 후 이용 가능합니다.', 'error')
                        return
                      }
                      setDesignMode('existing')
                      setDesignFile(null)
                    }}
                    disabled={!user}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      designMode === 'existing'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-2xl">📁</div>
                      <div className="font-semibold">기존 디자인</div>
                    </div>
                    <p className="text-sm text-gray-500">이전 주문 재사용</p>
                    <p className="text-sm font-medium text-green-600 mt-2">
                      금형비 무료
                    </p>
                  </button>
                </div>

                {/* 신규 디자인 - 파일 업로드 */}
                {designMode === 'new' && (
                  <label 
                    ref={uploadRef}
                    className={`block border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    uploadHighlight 
                      ? 'border-red-500 bg-red-50 animate-pulse' 
                      : 'border-gray-200 hover:border-primary-400 hover:bg-primary-50/50'
                  }`}>
                    <input type="file" className="hidden" accept=".ai,application/postscript" onChange={handleFileChange} />
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 ${
                      uploadHighlight 
                        ? 'bg-red-500' 
                        : 'bg-gradient-to-r from-primary-500 to-blue-400'
                    }`}>
                      {uploadHighlight ? '⚠️' : '📤'}
                    </div>
                    <p className={`font-semibold mb-2 ${uploadHighlight ? 'text-red-600' : ''}`}>
                      {uploadHighlight ? '👆 여기를 클릭해서 파일을 업로드하세요!' : '디자인 파일을 드래그하거나 클릭하세요'}
                    </p>
                    <p className="text-gray-400 text-sm">AI 파일만 지원 (최대 50MB)</p>
                    {designFile && (
                      <div className="mt-4 space-y-2">
                        <p className="text-primary-600 font-medium">✓ {designFile.name}</p>
                        <p className="text-gray-500 text-xs">
                          크기: {(designFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    )}
                  </label>
                )}

                {/* 기존 디자인 - 디자인 목록 */}
                {designMode === 'existing' && (
                  <div className="space-y-3">
                    {designsLoading ? (
                      <div className="text-center py-8 text-gray-500">
                        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                        디자인 목록을 불러오는 중...
                      </div>
                    ) : userDesigns.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-2xl">
                        <div className="text-4xl mb-3">📭</div>
                        <p className="text-gray-500 font-medium">저장된 디자인이 없습니다</p>
                        <p className="text-gray-400 text-sm mt-1">
                          신규 디자인으로 첫 주문을 진행해주세요
                        </p>
                        <button
                          onClick={() => setDesignMode('new')}
                          className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors"
                        >
                          신규 디자인 업로드하기
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-500 mb-3">
                          재사용할 디자인을 선택하세요 ({userDesigns.length}개)
                        </p>
                        <div className="max-h-64 overflow-y-auto space-y-2">
                          {userDesigns.map((design) => (
                            <button
                              key={design.id}
                              onClick={() => setSelectedDesign(design)}
                              className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                                selectedDesign?.id === design.id
                                  ? 'border-primary-500 bg-primary-50'
                                  : 'border-gray-200 hover:border-primary-300'
                              }`}
                            >
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                                {design.preview_url ? (
                                  <img src={design.preview_url} alt="" className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                  '🎨'
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{design.design_name}</p>
                                <p className="text-sm text-gray-500">
                                  {new Date(design.created_at).toLocaleDateString('ko-KR')}
                                </p>
                                {design.memo && (
                                  <p className="text-xs text-gray-400 truncate mt-1">{design.memo}</p>
                                )}
                              </div>
                              {selectedDesign?.id === design.id && (
                                <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm">
                                  ✓
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                        {selectedDesign && (
                          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                            <div className="flex items-center gap-2 text-green-700">
                              <span className="text-lg">✓</span>
                              <span className="font-medium">선택됨: {selectedDesign.design_name}</span>
                            </div>
                            <p className="text-sm text-green-600 mt-1">
                              기존 금형을 사용하여 금형비가 부과되지 않습니다
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* 금형비 안내 */}
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">💡</span>
                    <div className="text-sm">
                      <p className="font-medium text-amber-800">금형비 안내</p>
                      <p className="text-amber-700 mt-1">
                        새로운 디자인은 금형 제작이 필요하여 <strong>₩{MOLD_FEE.toLocaleString()}</strong>의 금형비가 부과됩니다.
                        동일한 디자인으로 재주문 시에는 금형비가 부과되지 않습니다.
                      </p>
                    </div>
                  </div>
                </div>
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
                      onClick={() => setPaintType(key)}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
                        paintType === key
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
                    <p className="text-gray-500 text-sm">원하는 도금 색상을 선택하세요</p>
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
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center text-xl">📦</div>
                  <div>
                    <h2 className="font-bold text-lg">수량</h2>
                    <p className="text-gray-500 text-sm">많이 주문할수록 더 많이 할인됩니다</p>
                  </div>
                </div>

                {/* 수량 입력 */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, (quantity || 1) - 1))}
                      className="w-12 h-12 text-xl hover:bg-primary-500 hover:text-white transition-colors"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity || ''}
                      onChange={(e) => {
                        const val = e.target.value
                        if (val === '') {
                          setQuantity(0)
                        } else {
                          setQuantity(parseInt(val) || 0)
                        }
                      }}
                      onBlur={() => {
                        if (!quantity || quantity < 1) {
                          setQuantity(1)
                        }
                      }}
                      className="w-24 h-12 text-center font-bold text-lg bg-white border-0 no-spinner"
                      min="1"
                    />
                    <button
                      onClick={() => setQuantity((quantity || 0) + 1)}
                      className="w-12 h-12 text-xl hover:bg-primary-500 hover:text-white transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-gray-500 text-sm">개</span>
                </div>

                {/* 빠른 수량 추가 */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="text-sm text-gray-500">빠른 추가:</span>
                  {[10, 100, 1000].map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuantity((quantity || 0) + q)}
                      className="px-4 py-2 rounded-xl text-sm font-bold bg-primary-50 text-primary-600 hover:bg-primary-500 hover:text-white transition-all"
                    >
                      +{q.toLocaleString()}
                    </button>
                  ))}
                  <button
                    onClick={() => setQuantity(1)}
                    className="px-4 py-2 rounded-xl text-sm font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all"
                  >
                    초기화
                  </button>
                </div>

                {/* 수량별 할인 안내 */}
                <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">수량별 할인 혜택 (자동 적용)</p>
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
                        <div
                          key={tier.label}
                          className={`p-3 rounded-xl text-center transition-all ${
                            isActive
                              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                              : 'bg-white border border-gray-200'
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
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 현재 적용된 할인 */}
                {price.discountPerUnit > 0 && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl flex items-center gap-3 mb-4">
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

                {/* 현재 선택 예상 가격 */}
                <div className="bg-gray-900 rounded-2xl p-5 text-white">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>{getPaintTypeName(paintType)} / {getMetalColorName(metalColor)} / {size}mm</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>단가</span>
                    <span>₩{price.unitPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>수량</span>
                    <span>× {quantity || 1}개</span>
                  </div>
                  {price.discountPerUnit > 0 && (
                    <div className="flex justify-between text-sm text-green-400 mb-2">
                      <span>할인</span>
                      <span>-₩{price.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-700 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">예상 금액</span>
                      <span className="font-display text-2xl font-bold text-amber-400">
                        ₩{price.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 항목 추가 버튼 */}
              <button
                onClick={handleAddItem}
                className="w-full py-4 bg-primary-500 text-white rounded-2xl font-bold text-lg hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-2xl">+</span>
                주문 목록에 추가하기
              </button>

              {/* 추가된 항목 목록 */}
              {orderItems.length > 0 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-11 h-11 bg-primary-100 rounded-xl flex items-center justify-center text-xl">🛒</div>
                    <div>
                      <h2 className="font-bold text-lg">주문 목록</h2>
                      <p className="text-gray-500 text-sm">{orderItems.length}개의 디자인이 추가되었습니다</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {orderItems.map((item, index) => {
                      const itemPrice = calculatePrice(item.paintType, item.size, item.quantity)
                      const moldFee = item.isNewMold ? MOLD_FEE : 0
                      const itemTotal = itemPrice.total + moldFee
                      return (
                        <div key={item.id} className="border border-gray-200 rounded-2xl p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900 truncate">{item.designName}</p>
                                {item.isNewMold ? (
                                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                                    신규금형
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                    재사용
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                {getPaintTypeName(item.paintType)} / {getMetalColorName(item.metalColor)} / {item.size}mm
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-gray-400 hover:text-red-500 text-xl transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                              <button
                                onClick={() => handleItemQuantityChange(item.id, item.quantity - 1)}
                                className="w-10 h-10 text-lg hover:bg-primary-500 hover:text-white transition-colors"
                              >
                                −
                              </button>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleItemQuantityChange(item.id, parseInt(e.target.value) || 1)}
                                className="w-16 h-10 text-center font-bold bg-white border-0"
                                min="1"
                              />
                              <button
                                onClick={() => handleItemQuantityChange(item.id, item.quantity + 1)}
                                className="w-10 h-10 text-lg hover:bg-primary-500 hover:text-white transition-colors"
                              >
                                +
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-gray-900">
                                ₩{itemTotal.toLocaleString()}
                              </p>
                              {item.isNewMold && (
                                <p className="text-xs text-amber-600">
                                  (금형비 ₩{MOLD_FEE.toLocaleString()} 포함)
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Preview Column */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 shadow-sm sticky top-24">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <span className="text-primary-500">●</span>
                  {orderItems.length > 0 ? '주문 요약' : '실시간 미리보기'}
                </h3>

                {orderItems.length > 0 ? (
                  // 주문 요약 보기
                  <>
                    <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                      {orderItems.map((item, index) => {
                        const itemPrice = calculatePrice(item.paintType, item.size, item.quantity)
                        const moldFee = item.isNewMold ? MOLD_FEE : 0
                        return (
                          <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1">
                                <p className="font-medium text-sm truncate">{item.designName}</p>
                                {item.isNewMold && (
                                  <span className="text-xs text-amber-600">🔧</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">{item.quantity}개</p>
                            </div>
                            <p className="font-semibold text-sm ml-2">₩{(itemPrice.total + moldFee).toLocaleString()}</p>
                          </div>
                        )
                      })}
                    </div>

                    {/* Total Price */}
                    <div className="bg-gray-900 rounded-2xl p-6 text-white">
                      <div className="flex justify-between text-sm text-gray-400 mb-3">
                        <span>총 디자인</span>
                        <span>{orderItems.length}개</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-400 mb-3">
                        <span>총 수량</span>
                        <span>{totalQuantity.toLocaleString()}개</span>
                      </div>
                      {totalMoldFee > 0 && (
                        <div className="flex justify-between text-sm text-amber-400 mb-3">
                          <span>금형비 ({orderItems.filter(i => i.isNewMold).length}건)</span>
                          <span>₩{totalMoldFee.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm text-gray-400 mb-3">
                        <span>배송비</span>
                        {calculateShippingFee(totalPrice) === 0 ? (
                          <span className="text-green-400">무료</span>
                        ) : (
                          <span>₩{calculateShippingFee(totalPrice).toLocaleString()}</span>
                        )}
                      </div>
                      {totalPrice > 0 && totalPrice < FREE_SHIPPING_THRESHOLD && (
                        <p className="text-xs text-blue-400 mb-3">
                          💡 ₩{(FREE_SHIPPING_THRESHOLD - totalPrice).toLocaleString()} 더 담으면 무료배송!
                        </p>
                      )}
                      <div className="border-t border-gray-700 pt-4 mt-4">
                        <div className="flex justify-between items-end">
                          <span className="text-gray-400">총 결제 금액</span>
                          <span className="font-display text-3xl font-bold text-amber-400">
                            ₩{(totalPrice + calculateShippingFee(totalPrice)).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  // 미리보기 (기존)
                  <>
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: 'linear-gradient(90deg, transparent 49.5%, #000 49.5%, #000 50.5%, transparent 50.5%), linear-gradient(0deg, transparent 49.5%, #000 49.5%, #000 50.5%, transparent 50.5%)',
                        backgroundSize: '20px 20px'
                      }} />
                      
                      {designFile ? (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                          <p className="font-bold text-xl text-gray-800 mb-3">
                            {designFile.name.toLowerCase().endsWith('.pdf') ? 'PDF 파일' :
                             designFile.name.toLowerCase().endsWith('.ai') ? 'Illustrator 파일' :
                             'Photoshop 파일'}
                          </p>
                          <p className="text-base text-gray-700 mb-2 truncate max-w-full px-4">{designFile.name}</p>
                          <p className="text-sm text-gray-500 mb-6">
                            {(designFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <div className="px-5 py-3 bg-green-100 text-green-700 rounded-xl text-base font-medium flex items-center gap-2">
                            <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                            파일 업로드 완료
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                          <div className={`w-32 h-32 rounded-full ${metalColors.find(m => m.id === metalColor)?.class} shadow-2xl flex items-center justify-center mb-4 badge-float`}>
                            <span className="text-amber-900 font-bold text-sm">DESIGN</span>
                          </div>
                          <p className="font-medium text-gray-600 mb-2">디자인 파일을 업로드해주세요</p>
                          <p className="text-xs text-gray-400">AI 파일만 지원</p>
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
                          <span className="text-gray-400">예상 금액</span>
                          <span className="font-display text-3xl font-bold text-amber-400">
                            ₩{price.total.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-right text-xs text-gray-500 mt-2">
                          개당 ₩{quantity > 0 ? Math.round(price.total / quantity).toLocaleString() : 0}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* CTA Buttons */}
                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleOrder}
                    disabled={loading || orderItems.length === 0}
                    className="w-full py-4 bg-gradient-to-r from-primary-500 to-blue-400 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '처리 중...' : 
                     !user ? '로그인하고 주문하기' : 
                     orderItems.length === 0 ? '항목을 추가해주세요' :
                     `${orderItems.length}건 바로 주문하기`}
                  </button>
                  
                  <button
                    onClick={handleAddToCart}
                    disabled={loading || orderItems.length === 0}
                    className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold text-lg hover:border-primary-500 hover:text-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {orderItems.length === 0 ? '🛒 장바구니에 담기' : `🛒 ${orderItems.length}건 장바구니에 담기`}
                  </button>
                </div>

                <p className="text-center text-sm text-gray-500 mt-4">
                  🚀 예상 발송일: 20일 이내
                </p>

                <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                  <Link 
                    href="/refund" 
                    className="text-sm text-gray-400 hover:text-primary-500 transition-colors"
                  >
                    환불규정 확인하기 →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 ${
          toastType === 'error' 
            ? 'bg-red-600 text-white animate-shake' 
            : 'bg-gray-900 text-white animate-slide-up'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            toastType === 'error' ? 'bg-white text-red-600' : 'bg-green-500 text-white'
          }`}>
            {toastType === 'error' ? '!' : '✓'}
          </div>
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
