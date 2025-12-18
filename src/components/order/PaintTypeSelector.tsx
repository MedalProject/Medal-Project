'use client'

/**
 * 칠 종류 선택 컴포넌트
 * 
 * 일반 / 에폭시 / UV프린팅 등의 도장 타입을 선택합니다.
 */

import { priceTable } from '@/lib/supabase'

interface PaintTypeSelectorProps {
  value: string
  onChange: (value: string) => void
}

// 도장 타입별 아이콘 매핑
const PAINT_TYPE_ICONS: Record<string, string> = {
  normal: '🖌️',
  epoxy: '💧',
  printing: '✨',
}

export default function PaintTypeSelector({ value, onChange }: PaintTypeSelectorProps) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center text-xl">
          🎨
        </div>
        <div>
          <h2 className="font-bold text-lg">칠 종류</h2>
          <p className="text-gray-500 text-sm">원하는 칠 종류를 선택하세요</p>
        </div>
      </div>

      {/* 선택 버튼 그리드 */}
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(priceTable).map(([key, paintInfo]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`p-4 rounded-xl border-2 transition-all text-center ${
              value === key
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            <div className="text-2xl mb-2">
              {PAINT_TYPE_ICONS[key] || '🎨'}
            </div>
            <div className="font-semibold text-sm">{paintInfo.name}</div>
            <div className="text-xs text-gray-500 mt-1">
              {paintInfo.addon === 0 ? '+₩0' : `+₩${paintInfo.addon.toLocaleString()}`}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

