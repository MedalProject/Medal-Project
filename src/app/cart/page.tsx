'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { createClient, calculatePrice, priceTable, calculateShippingFee, FREE_SHIPPING_THRESHOLD } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const metalColors = [
  { id: 'gold', name: '금도금' },
  { id: 'silver', name: '은도금' },
]

type CartItem = {
  id: string
  user_id: string
  paint_type: string
  metal_color: string
  size: number
  quantity: number
  design_url: string | null
  design_name: string | null
  created_at: string
}

export default function CartPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [user, setUser] = useState<User | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [ordering, setOrdering] = useState(false)
  const [toast, setToast] = useState('')

  // Check auth and load cart
  useEffect(() => {
    const loadCart = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const { data, error } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        
        if (data) {
          setCartItems(data)
        }
      }
      setLoading(false)
    }
    
    loadCart()
  }, [])

  // Calculate totals
  const totalPrice = cartItems.reduce((sum, item) => {
    const itemPrice = calculatePrice(item.paint_type, item.size, item.quantity)
    return sum + itemPrice.total
  }, 0)

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  // Update quantity
  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return
    
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('id', id)
    
    if (!error) {
      setCartItems(cartItems.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      ))
    }
  }

  // Remove item
  const handleRemoveItem = async (id: string) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id)
    
    if (!error) {
      setCartItems(cartItems.filter(item => item.id !== id))
      showToast('항목이 삭제되었습니다.')
    }
  }

  // Clear cart
  const handleClearCart = async () => {
    if (!user) return
    if (!confirm('장바구니를 비우시겠습니까?')) return
    
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
    
    if (!error) {
      setCartItems([])
      showToast('장바구니가 비워졌습니다.')
    }
  }

  // Order all items - checkout 페이지로 이동
  const handleOrderAll = () => {
    if (cartItems.length === 0) return
    router.push('/checkout')
  }

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(''), 3000)
  }

  const getPaintTypeName = (type: string) => {
    return priceTable[type as keyof typeof priceTable]?.name || type
  }

  const getMetalColorName = (color: string) => {
    return metalColors.find(m => m.id === color)?.name || color
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="pt-24 pb-16 px-4 bg-gray-50 min-h-screen">
          <div className="max-w-4xl mx-auto text-center py-20">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">장바구니를 불러오는 중...</p>
          </div>
        </main>
      </>
    )
  }

  if (!user) {
    return (
      <>
        <Header />
        <main className="pt-24 pb-16 px-4 bg-gray-50 min-h-screen">
          <div className="max-w-4xl mx-auto text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">
              🛒
            </div>
            <h1 className="text-2xl font-bold mb-4">로그인이 필요합니다</h1>
            <p className="text-gray-500 mb-8">장바구니를 이용하려면 먼저 로그인해주세요.</p>
            <Link
              href="/login"
              className="inline-block px-8 py-4 bg-primary-500 text-white rounded-xl font-bold hover:bg-primary-600 transition-colors"
            >
              로그인하기
            </Link>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      
      <main className="pt-24 pb-16 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">장바구니</h1>
              <p className="text-gray-500">{cartItems.length}개의 상품이 담겨있습니다</p>
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={handleClearCart}
                className="text-sm text-gray-400 hover:text-red-500 transition-colors"
              >
                장바구니 비우기
              </button>
            )}
          </div>

          {cartItems.length === 0 ? (
            // Empty cart
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">
                🛒
              </div>
              <h2 className="text-xl font-bold mb-3">장바구니가 비어있습니다</h2>
              <p className="text-gray-500 mb-8">원하는 메달을 장바구니에 담아보세요!</p>
              <Link
                href="/order"
                className="inline-block px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                메달 만들러 가기 →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => {
                  const itemPrice = calculatePrice(item.paint_type, item.size, item.quantity)
                  return (
                    <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm">
                      <div className="flex items-start gap-4">
                        {/* Design Preview */}
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">🏷️</span>
                        </div>
                        
                        {/* Item Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-gray-900 truncate">
                                {item.design_name || '디자인 파일'}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {getPaintTypeName(item.paint_type)} / {getMetalColorName(item.metal_color)} / {item.size}mm
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-gray-400 hover:text-red-500 text-xl transition-colors flex-shrink-0"
                            >
                              ✕
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                className="w-10 h-10 text-lg hover:bg-primary-500 hover:text-white transition-colors"
                              >
                                −
                              </button>
                              <span className="w-12 text-center font-bold">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                className="w-10 h-10 text-lg hover:bg-primary-500 hover:text-white transition-colors"
                              >
                                +
                              </button>
                            </div>
                            <p className="font-bold text-xl text-gray-900">
                              ₩{itemPrice.total.toLocaleString()}
                            </p>
                          </div>
                          
                          {itemPrice.discountPerUnit > 0 && (
                            <p className="text-sm text-green-600 mt-2">
                              🎉 대량 할인 적용: 개당 -₩{itemPrice.discountPerUnit.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-3xl p-6 shadow-sm sticky top-24">
                  <h3 className="font-bold text-lg mb-6">주문 요약</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>상품 수</span>
                      <span>{cartItems.length}개</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>총 수량</span>
                      <span>{totalQuantity.toLocaleString()}개</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>배송비</span>
                      {calculateShippingFee(totalPrice) === 0 ? (
                        <span className="text-green-600">무료</span>
                      ) : (
                        <span>₩{calculateShippingFee(totalPrice).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  
                  {totalPrice > 0 && totalPrice < FREE_SHIPPING_THRESHOLD && (
                    <p className="text-sm text-blue-600 mb-4">
                      💡 ₩{(FREE_SHIPPING_THRESHOLD - totalPrice).toLocaleString()} 더 담으면 무료배송!
                    </p>
                  )}
                  
                  <div className="border-t border-gray-100 pt-4 mb-6">
                    <div className="flex justify-between items-end">
                      <span className="text-gray-600">총 결제 금액</span>
                      <span className="font-display text-3xl font-bold text-primary-600">
                        ₩{(totalPrice + calculateShippingFee(totalPrice)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleOrderAll}
                    disabled={ordering}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-white rounded-xl font-bold text-lg shadow-lg shadow-amber-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
                  >
                    {ordering ? '주문 처리 중...' : `${cartItems.length}건 주문하기`}
                  </button>
                  
                  <Link
                    href="/order"
                    className="block text-center mt-4 text-gray-500 hover:text-primary-500 transition-colors"
                  >
                    + 더 담으러 가기
                  </Link>

                  <p className="text-center text-sm text-gray-400 mt-4">
                    🚀 예상 발송일: 20일 이내
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 right-8 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">✓</div>
          {toast}
        </div>
      )}
    </>
  )
}

