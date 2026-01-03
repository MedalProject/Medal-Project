/**
 * 주문 페이지 관련 상수 정의
 * 
 * 도금 색상, 크기, 할인 구간 등의 상수를 정의합니다.
 * Magic Number 사용을 피하기 위해 이 파일의 상수를 사용하세요.
 */

import type { MetalColorOption, SizeOption, QuantityTier, PaintTypeOption } from '@/types/order'

// 뱃지 종류 옵션 (7종류) - 업계 표준 영문명 ID
// ⚠️ 이미지와 가격은 나중에 실제 값으로 교체 필요
export const PAINT_TYPES: PaintTypeOption[] = [
  {
    id: 'soft_enamel',
    name: '일반칠',
    description: '가장 기본, 도금선 살짝 높음',
    icon: '🖌️',
    color: 'from-amber-400 to-orange-500',
    priceAddon: 0,
  },
  {
    id: 'soft_enamel_epoxy',
    name: '일반칠 + 에폭시',
    description: '투명 코팅으로 고급스러움',
    icon: '💧',
    color: 'from-cyan-400 to-blue-500',
    priceAddon: 300,
  },
  {
    id: 'hard_enamel',
    name: '수지칠',
    description: '반투명, 부드러운 색감',
    icon: '🌈',
    color: 'from-purple-400 to-pink-500',
    priceAddon: 200,
  },
  {
    id: 'die_struck',
    name: '칠없음',
    description: '금속 질감만 (무도색)',
    icon: '⚙️',
    color: 'from-gray-400 to-gray-600',
    priceAddon: 0,
  },
  {
    id: '3d',
    name: '3D 입체',
    description: '양각으로 볼륨감',
    icon: '🏔️',
    color: 'from-emerald-400 to-teal-500',
    priceAddon: 500,
  },
  {
    id: 'printed',
    name: 'UV인쇄',
    description: '사진/그라데이션 표현',
    icon: '🖼️',
    color: 'from-rose-400 to-red-500',
    priceAddon: 400,
  },
  {
    id: 'custom',
    name: '기타',
    description: '카카오톡 문의',
    icon: '💬',
    color: 'from-yellow-400 to-amber-500',
    priceAddon: 0,
    isCustom: true,
  },
]

// 도금 색상 옵션 (8종류)
export const METAL_COLORS: MetalColorOption[] = [
  { id: 'gold', name: '금도금', class: 'metal-gold', image: '/plating/plating_gold.png' },
  { id: 'silver', name: '은도금', class: 'metal-silver', image: '/plating/plating_silver.png' },
  { id: 'copper', name: '동도금', class: 'metal-copper', image: '/plating/plating_copper.png' },
  { id: 'black_nickel', name: '흑니켈', class: 'metal-black-nickel', image: '/plating/plating_black_nickel.png' },
  { id: 'rose_gold', name: '로즈골드', class: 'metal-rose-gold', image: '/plating/plating_rose_gold.png' },
  { id: 'antique_gold', name: '앤틱 금', class: 'metal-antique-gold', image: '/plating/plating_antique_gold.png' },
  { id: 'antique_silver', name: '앤틱 은', class: 'metal-antique-silver', image: '/plating/plating_antique_silver.png' },
  { id: 'antique_copper', name: '앤틱 동', class: 'metal-antique-copper', image: '/plating/plating_antique_copper.png' },
]

// 크기 옵션 (lib/supabase.ts의 sizeAddon과 동기화 필요)
export const SIZES: SizeOption[] = [
  { size: 30, label: '30×30mm 이하', addon: 0 },
  { size: 40, label: '40×40mm 이하', addon: 600 },
  { size: 50, label: '50×50mm 이하', addon: 900 },
  { size: 60, label: '60×60mm 이하', addon: 1300 },
  { size: 70, label: '70×70mm 이하', addon: 1600 },
  { size: 80, label: '80×80mm 이하', addon: 2100 },
  { size: 90, label: '90×90mm 이하', addon: 2600 },
  { size: 100, label: '100×100mm 이하', addon: 3000 },
]

// 수량별 할인 구간 (lib/supabase.ts의 calculatePrice와 동기화)
export const QUANTITY_TIERS: QuantityTier[] = [
  { min: 1, max: 99, discount: 0, label: '1~99개' },
  { min: 100, max: 299, discount: 300, label: '100~299개' },
  { min: 300, max: 499, discount: 600, label: '300~499개' },
  { min: 500, max: 999, discount: 1200, label: '500~999개' },
  { min: 1000, max: 4999, discount: 1300, label: '1,000~4,999개' },
  { min: 5000, max: Infinity, discount: 1500, label: '5,000개 이상' },
]

// 빠른 수량 추가 버튼 값
export const QUICK_QUANTITY_OPTIONS = [10, 100, 1000]

// 파일 업로드 설정
export const FILE_UPLOAD_CONFIG = {
  maxSize: 50 * 1024 * 1024, // 50MB
  allowedExtensions: ['ai'],
  allowedMimeTypes: ['application/postscript'],
}

