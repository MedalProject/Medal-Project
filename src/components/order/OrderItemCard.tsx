'use client'

/**
 * 주문 항목 카드 컴포넌트
 * 
 * 주문 목록에 추가된 개별 항목을 표시합니다.
 * 수량 변경, 삭제 기능을 제공합니다.
 * 새로 추가 시 하이라이트 애니메이션이 적용됩니다.
 */

import type { OrderItem } from '@/types/order'
import { getMetalColorName, getPaintTypeName } from '@/utils/order'
import { calculatePrice, MOLD_FEE } from '@/lib/supabase'

interface OrderItemCardProps {
  item: OrderItem
  onQuantityChange: (id: string, quantity: number) => void
  onRemove: (id: string) => void
}

export default function OrderItemCard({ 
  item, 
  onQuantityChange, 
  onRemove 
}: OrderItemCardProps) {
  // 가격 계산
  const itemPrice = calculatePrice(item.paintType, item.size, item.quantity)
  const moldFee = item.isNewMold ? MOLD_FEE : 0
  const itemTotal = itemPrice.total + moldFee

  // 수량 감소
  const handleDecrease = () => {
    onQuantityChange(item.id, item.quantity - 1)
  }

  // 수량 증가
  const handleIncrease = () => {
    onQuantityChange(item.id, item.quantity + 1)
  }

  // 직접 입력
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value) || 1
    onQuantityChange(item.id, value)
  }

  return (
    <div className="bg-white border border-emerald-200 rounded-2xl p-4 animate-highlight-fade shadow-sm">
      {/* 상단: 디자인명 & 옵션 정보 */}
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
        
        {/* 삭제 버튼 */}
        <button
          onClick={() => onRemove(item.id)}
          className="text-gray-400 hover:text-red-500 text-xl transition-colors"
          aria-label="항목 삭제"
        >
          ✕
        </button>
      </div>
      
      {/* 하단: 수량 조절 & 가격 */}
      <div className="flex items-center justify-between mt-4">
        {/* 수량 입력 */}
        <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
          <button
            onClick={handleDecrease}
            className="w-10 h-10 text-lg hover:bg-primary-500 hover:text-white transition-colors"
            aria-label="수량 감소"
          >
            −
          </button>
          <input
            type="number"
            value={item.quantity}
            onChange={handleInputChange}
            className="w-16 h-10 text-center font-bold bg-white border-0"
            min="1"
          />
          <button
            onClick={handleIncrease}
            className="w-10 h-10 text-lg hover:bg-primary-500 hover:text-white transition-colors"
            aria-label="수량 증가"
          >
            +
          </button>
        </div>
        
        {/* 가격 표시 */}
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
}

