'use client'

/**
 * 주문 항목 목록 컴포넌트
 * 
 * 주문 목록에 추가된 모든 항목을 표시합니다.
 * 각 항목의 수량 변경, 삭제 기능을 제공합니다.
 */

import type { OrderItem } from '@/types/order'
import OrderItemCard from './OrderItemCard'

interface OrderItemListProps {
  items: OrderItem[]
  onQuantityChange: (id: string, quantity: number) => void
  onRemove: (id: string) => void
}

export default function OrderItemList({ 
  items, 
  onQuantityChange, 
  onRemove 
}: OrderItemListProps) {
  // 항목이 없으면 렌더링하지 않음
  if (items.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 bg-primary-100 rounded-xl flex items-center justify-center text-xl">
          🛒
        </div>
        <div>
          <h2 className="font-bold text-lg">주문 목록</h2>
          <p className="text-gray-500 text-sm">{items.length}개의 디자인이 추가되었습니다</p>
        </div>
      </div>

      {/* 항목 목록 */}
      <div className="space-y-4">
        {items.map((item) => (
          <OrderItemCard
            key={item.id}
            item={item}
            onQuantityChange={onQuantityChange}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  )
}

