'use client'

/**
 * 도금 색상 선택 컴포넌트
 * 
 * 8가지 도금 색상 중 선택합니다.
 * 실제 도금 샘플 이미지를 보여줍니다.
 */

import Image from 'next/image'
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

      {/* 선택 버튼 그리드 - 4열 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {METAL_COLORS.map((metal) => (
          <button
            key={metal.id}
            onClick={() => onChange(metal.id)}
            className={`p-3 rounded-xl border-2 transition-all ${
              value === metal.id
                ? 'border-primary-500 bg-primary-50 shadow-md'
                : 'border-gray-200 hover:border-primary-300 hover:shadow-sm'
            }`}
          >
            {/* 도금 샘플 이미지 */}
            <div className="relative w-16 h-16 mx-auto mb-2">
              {metal.image ? (
                <Image
                  src={metal.image}
                  alt={metal.name}
                  fill
                  className="object-contain"
                  sizes="64px"
                />
              ) : (
                // 이미지가 없을 경우 폴백 (CSS 그라디언트)
                <div className={`w-full h-full rounded-full ${metal.class} shadow-md`} />
              )}
            </div>
            <div className="text-xs sm:text-sm font-medium text-center">{metal.name}</div>
            {/* 선택 표시 */}
            {value === metal.id && (
              <div className="mt-1 text-primary-500 text-xs font-bold">✓ 선택됨</div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

