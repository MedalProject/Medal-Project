'use client'

/**
 * 수량 입력 컴포넌트
 * 
 * 수량 입력, 빠른 추가 버튼, 수량별 할인 안내를 포함합니다.
 */

import { QUANTITY_TIERS, QUICK_QUANTITY_OPTIONS } from '@/constants/order'

interface PriceInfo {
  unitPrice: number
  discountPerUnit: number
  discount: number
  total: number
}

interface QuantityInputProps {
  value: number
  onChange: (value: number) => void
  price: PriceInfo
  paintTypeName: string
  metalColorName: string
  size: number
}

export default function QuantityInput({
  value,
  onChange,
  price,
  paintTypeName,
  metalColorName,
  size,
}: QuantityInputProps) {
  // 수량 감소
  const handleDecrease = () => {
    onChange(Math.max(1, (value || 1) - 1))
  }

  // 수량 증가
  const handleIncrease = () => {
    onChange((value || 0) + 1)
  }

  // 직접 입력
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value
    if (inputValue === '') {
      onChange(0)
    } else {
      onChange(parseInt(inputValue) || 0)
    }
  }

  // 포커스 아웃 시 최소값 보장
  const handleBlur = () => {
    if (!value || value < 1) {
      onChange(1)
    }
  }

  // 빠른 추가
  const handleQuickAdd = (amount: number) => {
    onChange((value || 0) + amount)
  }

  // 초기화
  const handleReset = () => {
    onChange(1)
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center text-xl">
          📦
        </div>
        <div>
          <h2 className="font-bold text-lg">수량</h2>
          <p className="text-gray-500 text-sm">많이 주문할수록 더 많이 할인됩니다</p>
        </div>
      </div>

      {/* 수량 입력 */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
          <button
            onClick={handleDecrease}
            className="w-12 h-12 text-xl hover:bg-primary-500 hover:text-white transition-colors"
          >
            −
          </button>
          <input
            type="number"
            value={value || ''}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className="w-24 h-12 text-center font-bold text-lg bg-white border-0 no-spinner"
            min="1"
          />
          <button
            onClick={handleIncrease}
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
        {QUICK_QUANTITY_OPTIONS.map((amount) => (
          <button
            key={amount}
            onClick={() => handleQuickAdd(amount)}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-primary-50 text-primary-600 hover:bg-primary-500 hover:text-white transition-all"
          >
            +{amount.toLocaleString()}
          </button>
        ))}
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-xl text-sm font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all"
        >
          초기화
        </button>
      </div>

      {/* 수량별 할인 안내 */}
      <div className="bg-gray-50 rounded-2xl p-4 mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">
          수량별 할인 혜택 (자동 적용)
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {QUANTITY_TIERS.map((tier) => {
            const isActive = value >= tier.min && value <= tier.max
            return (
              <div
                key={tier.label}
                className={`p-3 rounded-xl text-center transition-all ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-lg shadow-amber-500/30'
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
          <span>{paintTypeName} / {metalColorName} / {size}mm</span>
        </div>
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>단가</span>
          <span>₩{price.unitPrice.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>수량</span>
          <span>× {value || 1}개</span>
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
  )
}

