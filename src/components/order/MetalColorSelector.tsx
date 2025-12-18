'use client'

/**
 * 도금 색상 선택 컴포넌트
 * 
 * 금도금 / 은도금 등의 도금 색상을 선택합니다.
 */

import { METAL_COLORS } from '@/constants/order'

interface MetalColorSelectorProps {
  value: string
  onChange: (value: string) => void
}

export default function MetalColorSelector({ value, onChange }: MetalColorSelectorProps) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center text-xl">
          🪙
        </div>
        <div>
          <h2 className="font-bold text-lg">도금 색상</h2>
          <p className="text-gray-500 text-sm">원하는 도금 색상을 선택하세요</p>
        </div>
      </div>

      {/* 선택 버튼 그리드 */}
      <div className="grid grid-cols-2 gap-3">
        {METAL_COLORS.map((metal) => (
          <button
            key={metal.id}
            onClick={() => onChange(metal.id)}
            className={`p-4 rounded-xl border-2 transition-all ${
              value === metal.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            {/* 도금 색상 미리보기 원 */}
            <div className={`w-10 h-10 rounded-full mx-auto mb-2 ${metal.class} shadow-md`} />
            <div className="text-sm font-medium">{metal.name}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

