'use client'

/**
 * 크기 선택 컴포넌트
 * 
 * 배지 크기를 선택합니다. 크기에 따라 추가 요금이 부과됩니다.
 */

import { SIZES } from '@/constants/order'

interface SizeSelectorProps {
  value: number
  onChange: (value: number) => void
}

export default function SizeSelector({ value, onChange }: SizeSelectorProps) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center text-xl">
          📐
        </div>
        <div>
          <h2 className="font-bold text-lg">크기 선택</h2>
          <p className="text-gray-500 text-sm">크기에 따라 추가요금이 발생합니다</p>
        </div>
      </div>

      {/* 선택 버튼 그리드 */}
      <div className="grid grid-cols-3 gap-3">
        {SIZES.map((sizeOption) => (
          <button
            key={sizeOption.size}
            onClick={() => onChange(sizeOption.size)}
            className={`p-4 rounded-xl border-2 transition-all ${
              value === sizeOption.size
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            <div className="font-semibold text-sm mb-1">{sizeOption.label}</div>
            <div className="text-xs text-gray-500">
              {sizeOption.addon === 0 ? '기본' : `+₩${sizeOption.addon.toLocaleString()}`}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

