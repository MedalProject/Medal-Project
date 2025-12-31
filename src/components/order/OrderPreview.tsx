'use client'

import Link from 'next/link'
import Image from 'next/image'
import { calculatePrice, calculateShippingFee, FREE_SHIPPING_THRESHOLD, MOLD_FEE } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { OrderItem } from '@/types/order'
import { METAL_COLORS } from '@/constants/order'

interface OrderPreviewProps {
  orderItems: OrderItem[]
  totalPrice: number
  totalMoldFee: number
  totalQuantity: number
  price: {
    unitPrice: number
    discount: number
    total: number
    discountPerUnit: number
    sizeAddonPrice: number
  }
  quantity: number
  designFile: File | null
  metalColor: string
  user: User | null
  loading: boolean
  handleOrder: () => void
  handleAddToCart: () => void
  handleDownloadQuote: () => void
  onRemoveItem?: (id: string) => void  // 주문 요약에서 항목 삭제
}

export default function OrderPreview({
  orderItems,
  totalPrice,
  totalMoldFee,
  totalQuantity,
  price,
  quantity,
  designFile,
  metalColor,
  user,
  loading,
  handleOrder,
  handleAddToCart,
  handleDownloadQuote,
  onRemoveItem,
}: OrderPreviewProps) {
  // 배송비 계산은 금형비 제외한 순수 상품가 기준
  const productPrice = totalPrice - totalMoldFee
  const shippingFee = calculateShippingFee(productPrice)

  return (
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
              {orderItems.map((item) => {
                const itemPrice = calculatePrice(item.paintType, item.size, item.quantity)
                const moldFee = item.isNewMold ? MOLD_FEE : 0
                return (
                  <div key={item.id} className="group flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <p className="font-medium text-sm truncate">{item.designName}</p>
                        {item.isNewMold && (
                          <span className="text-xs text-amber-600">🔧</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{item.quantity}개</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <p className="font-semibold text-sm">₩{(itemPrice.total + moldFee).toLocaleString()}</p>
                      {/* 삭제 버튼 - 모바일: 항상 표시 / 데스크톱: 호버 시 표시 */}
                      {onRemoveItem && (
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all"
                          title="삭제"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 총 금액 */}
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
                {shippingFee === 0 ? (
                  <span className="text-green-400">무료</span>
                ) : (
                  <span>₩{shippingFee.toLocaleString()}</span>
                )}
              </div>
              {productPrice > 0 && productPrice < FREE_SHIPPING_THRESHOLD && (
                <p className="text-xs text-blue-400 mb-3">
                  💡 ₩{(FREE_SHIPPING_THRESHOLD - productPrice).toLocaleString()} 더 담으면 무료배송!
                </p>
              )}
              <div className="border-t border-gray-700 pt-4 mt-4">
                <div className="flex justify-between items-end">
                  <span className="text-gray-400">총 결제 금액</span>
                  <span className="font-display text-3xl font-bold text-amber-400">
                    ₩{(totalPrice + shippingFee).toLocaleString()}
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
                  {/* 선택된 도금 이미지 표시 */}
                  {(() => {
                    const selectedMetal = METAL_COLORS.find(m => m.id === metalColor)
                    return selectedMetal?.image ? (
                      <div className="relative w-40 h-40 mb-4 badge-float">
                        <Image
                          src={selectedMetal.image}
                          alt={selectedMetal.name}
                          fill
                          className="object-contain drop-shadow-2xl"
                          sizes="160px"
                        />
                      </div>
                    ) : (
                      <div className={`w-32 h-32 rounded-full ${selectedMetal?.class} shadow-2xl flex items-center justify-center mb-4 badge-float`}>
                        <span className="text-amber-900 font-bold text-sm">DESIGN</span>
                      </div>
                    )
                  })()}
                  <p className="font-medium text-gray-700 mb-1">
                    {METAL_COLORS.find(m => m.id === metalColor)?.name} 선택됨
                  </p>
                  <p className="text-sm text-gray-500 mb-3">디자인 파일을 업로드해주세요</p>
                  <p className="text-xs text-gray-400">AI 파일만 지원</p>
                </div>
              )}
            </div>

            {/* 가격 표시 */}
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

        {/* CTA 버튼 */}
        <div className="mt-6 space-y-3">
          {/* 주요 주문 버튼 */}
          <button
            onClick={handleOrder}
            disabled={loading || orderItems.length === 0}
            className="w-full py-4 bg-gradient-to-r from-primary-500 to-blue-400 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '처리 중...' : 
             orderItems.length === 0 ? '항목을 추가해주세요' :
             user ? `${orderItems.length}건 바로 주문하기` : `⚡ ${orderItems.length}건 빠른 주문하기`}
          </button>
          
          {/* 두 번째 버튼: 로그인 여부에 따라 다른 동작 */}
          <button
            onClick={handleAddToCart}
            disabled={loading || orderItems.length === 0}
            className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold text-lg hover:border-primary-500 hover:text-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {user ? (
              // 로그인 시: 장바구니에 담기
              orderItems.length === 0 ? '🛒 장바구니에 담기' : `🛒 ${orderItems.length}건 장바구니에 담기`
            ) : (
              // 비로그인 시: 로그인하고 주문하기 (클릭 시 로그인 페이지로 이동)
              '👤 로그인하고 주문하기'
            )}
          </button>

          {/* 견적서 다운로드 버튼 */}
          <button
            onClick={handleDownloadQuote}
            disabled={orderItems.length === 0}
            className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>📄</span>
            견적서 다운로드 (PDF)
          </button>

          {/* 비로그인 안내 */}
          {!user && orderItems.length > 0 && (
            <p className="text-xs text-gray-500 text-center">
              ✓ 빠른 주문: 회원가입 없이 3분 완료
            </p>
          )}
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
  )
}

