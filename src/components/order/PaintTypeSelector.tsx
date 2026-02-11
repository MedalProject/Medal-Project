'use client'

/**
 * 메달 종류 선택 컴포넌트
 * 
 * 일반칠, 에폭시, 수지칠, 칠없음, 3D 입체, UV인쇄, 기타 등의 메달 타입을 선택합니다.
 * 선택 시 하단에 상세 정보와 이미지를 표시합니다.
 */

import { useState } from 'react'
import Image from 'next/image'
import { PAINT_TYPES } from '@/constants/order'
import type { PaintType } from '@/types/order'

interface PaintTypeSelectorProps {
  value: string
  onChange: (value: string) => void
  onCustomSelect?: () => void  // "기타" 선택 시 카카오톡 문의로 유도
}

export default function PaintTypeSelector({ value, onChange, onCustomSelect }: PaintTypeSelectorProps) {
  const [hoveredType, setHoveredType] = useState<PaintType | null>(null)
  const [imageError, setImageError] = useState<Record<string, boolean>>({})

  // 현재 선택된 타입 정보
  const selectedType = PAINT_TYPES.find(t => t.id === value)

  // 옵션 클릭 핸들러
  const handleClick = (typeId: PaintType, isCustom?: boolean) => {
    if (isCustom) {
      // "기타" 선택 시 카카오톡 채널로 이동
      if (onCustomSelect) {
        onCustomSelect()
      } else {
        window.open('http://pf.kakao.com/_RHxjxdn/chat', '_blank')
      }
      return
    }
    onChange(typeId)
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center text-xl">
          🎨
        </div>
        <div>
          <h2 className="font-bold text-lg">메달 종류</h2>
          <p className="text-gray-500 text-sm">원하시는 제작 방식을 선택하세요</p>
        </div>
      </div>

      {/* 선택 버튼 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {PAINT_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => handleClick(type.id, type.isCustom)}
            onMouseEnter={() => setHoveredType(type.id)}
            onMouseLeave={() => setHoveredType(null)}
            className={`relative p-4 rounded-xl border-2 transition-all ${
              value === type.id && !type.isCustom
                ? 'border-primary-500 bg-primary-50 shadow-md'
                : 'border-gray-200 hover:border-primary-300 hover:shadow-sm'
            }`}
          >
            {/* 그라데이션 아이콘 배경 */}
            <div className={`w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br ${type.color} 
                            flex items-center justify-center text-xl shadow-sm`}>
              {type.icon}
            </div>

            {/* 이름 */}
            <div className="font-semibold text-sm text-center">{type.name}</div>

            {/* 추가 비용 표시 */}
            {!type.isCustom && (
              <div className={`text-xs text-center mt-1 ${
                type.priceAddon > 0 ? 'text-primary-600' : 'text-gray-400'
              }`}>
                {type.priceAddon === 0 ? '기본가' : `+₩${type.priceAddon.toLocaleString()}`}
              </div>
            )}

            {/* 기타 옵션일 경우 "문의" 표시 */}
            {type.isCustom && (
              <div className="text-xs text-amber-600 text-center mt-1 font-medium">
                카카오톡 문의
              </div>
            )}

            {/* 툴팁 (호버 시) */}
            {hoveredType === type.id && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 
                              bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-20
                              animate-tooltip-fade shadow-lg">
                {type.description}
                <div className="absolute top-full left-1/2 -translate-x-1/2 
                                border-4 border-transparent border-t-gray-900" />
              </div>
            )}

            {/* 선택됨 체크 표시 */}
            {value === type.id && !type.isCustom && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary-500 rounded-full 
                              flex items-center justify-center text-white text-xs shadow-md">
                ✓
              </div>
            )}
          </button>
        ))}
      </div>

      {/* 선택된 종류 상세 정보 */}
      {selectedType && !selectedType.isCustom && (
        <div className="mt-6 p-5 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-5">
            {/* 이미지 영역 */}
            <div className="sm:w-40 flex-shrink-0">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-inner">
                {selectedType.image && !imageError[selectedType.id] ? (
                  <Image
                    src={selectedType.image}
                    alt={selectedType.name}
                    fill
                    className="object-cover"
                    onError={() => setImageError(prev => ({ ...prev, [selectedType.id]: true }))}
                  />
                ) : (
                  // Placeholder: 그라데이션 배경 + 아이콘
                  <div className={`w-full h-full bg-gradient-to-br ${selectedType.color} 
                                  flex items-center justify-center`}>
                    <span className="text-5xl">{selectedType.icon}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 텍스트 정보 */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedType.color} 
                                flex items-center justify-center text-sm`}>
                  {selectedType.icon}
                </span>
                <h3 className="font-bold text-lg">{selectedType.name}</h3>
                {selectedType.priceAddon > 0 && (
                  <span className="text-sm text-primary-600 font-medium">
                    +₩{selectedType.priceAddon.toLocaleString()}
                  </span>
                )}
              </div>

              {/* 상세 설명 bullet points */}
              <ul className="space-y-2 mb-4">
                {selectedType.detailedDescription.map((desc, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-primary-500 mt-0.5">✓</span>
                    <span>{desc}</span>
                  </li>
                ))}
              </ul>

              {/* 추천 용도 */}
              <div className="flex items-center gap-2 text-sm">
                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                  💡 추천
                </span>
                <span className="text-gray-600">{selectedType.recommendation}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 안내 문구 */}
      <p className="text-xs text-gray-400 text-center mt-4">
        💡 각 옵션에 마우스를 올리면 간단한 설명을 볼 수 있어요
      </p>
    </div>
  )
}
