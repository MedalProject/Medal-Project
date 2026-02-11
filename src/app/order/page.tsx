'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { createClient, calculatePrice, calculateShippingFee, MOLD_FEE, UserDesign } from '@/lib/supabase'
import { generateQuotePDF } from '@/lib/generateQuotePDF'
import type { User } from '@supabase/supabase-js'

// 타입 & 상수 import
import type { OrderItem, DesignMode, ToastType } from '@/types/order'
import { getMetalColorName, getPaintTypeName, generateOrderItemId } from '@/utils/order'
import { 
  PaintTypeSelector, 
  MetalColorSelector, 
  SizeSelector, 
  QuantityInput, 
  OrderItemList,
  DesignSelector,
  OrderPreview 
} from '@/components/order'

export default function OrderPage() {
  const router = useRouter()
  const supabase = createClient()
  
  // State
  const [user, setUser] = useState<User | null>(null)
  const [paintType, setPaintType] = useState('soft_enamel')
  const [metalColor, setMetalColor] = useState('gold')
  const [size, setSize] = useState(30)
  const [quantity, setQuantity] = useState(1)
  const [designFile, setDesignFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [toastType, setToastType] = useState<ToastType>('success')
  const [uploadHighlight, setUploadHighlight] = useState(false)
  
  // 디자인 선택 관련 상태
  const [designMode, setDesignMode] = useState<DesignMode>('new')
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

  // 주문 목록으로 스크롤하는 함수
  const scrollToOrderList = () => {
    setTimeout(() => {
      const orderListElement = document.getElementById('order-item-list')
      if (orderListElement) {
        orderListElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
      }
    }, 100) // 상태 업데이트 후 스크롤
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
        id: generateOrderItemId(),
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
      showToast('✅ 주문 목록에 추가되었습니다!')
      
      // 파일 입력 초기화
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      
      // 주문 목록으로 스크롤
      scrollToOrderList()
    } 
    // 기존 디자인 재사용 모드일 때
    else {
      if (!selectedDesign) {
        showToast('⚠️ 재사용할 디자인을 선택해주세요!', 'error')
        return
      }

      const newItem: OrderItem = {
        id: generateOrderItemId(),
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
      showToast('✅ 주문 목록에 추가되었습니다! (금형 재사용)')
      
      // 주문 목록으로 스크롤
      scrollToOrderList()
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

  // 견적서 다운로드
  const handleDownloadQuote = async () => {
    if (orderItems.length === 0) {
      showToast('견적서를 다운로드하려면 항목을 추가해주세요.', 'error')
      return
    }

    showToast('견적서를 생성 중입니다...')

    const quoteItems = orderItems.map((item) => {
      const itemPrice = calculatePrice(item.paintType, item.size, item.quantity)
      return {
        name: '금속 메달',
        spec: `${getPaintTypeName(item.paintType)} / ${getMetalColorName(item.metalColor)} / ${item.size}mm`,
        quantity: item.quantity,
        unitPrice: itemPrice.unitPrice,
        amount: itemPrice.total,
        isNewMold: item.isNewMold,
      }
    })

    const shippingFee = calculateShippingFee(totalPrice - totalMoldFee)

    try {
      await generateQuotePDF({
        items: quoteItems,
        moldFee: totalMoldFee,
        moldCount: orderItems.filter(i => i.isNewMold).length,
        shippingFee,
        totalAmount: totalPrice + shippingFee,
      })

      showToast('견적서가 다운로드되었습니다!')
    } catch (error) {
      console.error('견적서 생성 오류:', error)
      showToast('견적서 생성 중 오류가 발생했습니다.', 'error')
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
    if (orderItems.length === 0) {
      showToast('주문할 항목을 추가해주세요.')
      return
    }

    setLoading(true)

    try {
      // 로그인한 경우: 장바구니에 저장
      if (user) {
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
      } else {
        // 비로그인 경우: localStorage에 임시 저장
        const tempItems = orderItems.map(item => ({
          id: item.id,
          paint_type: item.paintType,
          metal_color: item.metalColor,
          size: item.size,
          quantity: item.quantity,
          design_url: item.designUrl,
          design_name: item.designName,
        }))
        localStorage.setItem('tempCheckoutItems', JSON.stringify(tempItems))
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

  return (
    <>
      <Header />
      
      <main className="pt-24 pb-16 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">
              나만의 메달 만들기
            </h1>
            <p className="text-gray-500 text-lg">디자인 파일 업로드 후 옵션을 선택하세요</p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Options Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Design Selection Section */}
              <DesignSelector
                user={user}
                designMode={designMode}
                setDesignMode={setDesignMode}
                designFile={designFile}
                setDesignFile={setDesignFile}
                selectedDesign={selectedDesign}
                setSelectedDesign={setSelectedDesign}
                userDesigns={userDesigns}
                designsLoading={designsLoading}
                showToast={showToast}
                uploadHighlight={uploadHighlight}
                uploadRef={uploadRef}
                handleFileChange={handleFileChange}
              />

              {/* Paint Type */}
              <PaintTypeSelector value={paintType} onChange={setPaintType} />

              {/* Metal Color */}
              <MetalColorSelector value={metalColor} onChange={setMetalColor} />

              {/* Size */}
              <SizeSelector value={size} onChange={setSize} />

              {/* Quantity */}
              <QuantityInput
                value={quantity}
                onChange={setQuantity}
                price={price}
                paintTypeName={getPaintTypeName(paintType)}
                metalColorName={getMetalColorName(metalColor)}
                size={size}
              />

              {/* 항목 추가 버튼 */}
              <button
                onClick={handleAddItem}
                className="w-full py-4 bg-primary-500 text-white rounded-2xl font-bold text-lg hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-2xl">+</span>
                주문 목록에 추가하기
              </button>

              {/* 추가된 항목 목록 */}
              <OrderItemList
                items={orderItems}
                onQuantityChange={handleItemQuantityChange}
                onRemove={handleRemoveItem}
              />
            </div>

            {/* Preview Column */}
            <OrderPreview
              orderItems={orderItems}
              totalPrice={totalPrice}
              totalMoldFee={totalMoldFee}
              totalQuantity={totalQuantity}
              price={price}
              quantity={quantity}
              designFile={designFile}
              metalColor={metalColor}
              user={user}
              loading={loading}
              handleOrder={handleOrder}
              handleAddToCart={handleAddToCart}
              handleDownloadQuote={handleDownloadQuote}
              onRemoveItem={handleRemoveItem}
            />
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
