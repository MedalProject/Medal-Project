/**
 * 주문 페이지 관련 상수 정의
 * 
 * 도금 색상, 크기, 할인 구간 등의 상수를 정의합니다.
 * Magic Number 사용을 피하기 위해 이 파일의 상수를 사용하세요.
 */

import type { MetalColorOption, SizeOption, QuantityTier, PaintTypeOption } from '@/types/order'

// 메달 종류 옵션 (7종류) - 업계 표준 영문명 ID
// ⚠️ 이미지는 나중에 실제 값으로 교체 필요 (public/badge-types/ 폴더)
export const PAINT_TYPES: PaintTypeOption[] = [
  {
    id: 'soft_enamel',
    name: '일반칠',
    description: '가장 기본, 도금선 살짝 높음',
    detailedDescription: [
      '도금선이 색상보다 살짝 높아 입체감이 느껴집니다',
      '가장 대중적이고 인기있는 제작 방식입니다',
      '선명한 색상 표현이 가능합니다',
    ],
    recommendation: '단체 메달, 행사용, 기념품',
    image: '/badge-types/soft_enamel.png',
    icon: '🖌️',
    color: 'from-amber-400 to-orange-500',
    priceAddon: 0,
  },
  {
    id: 'soft_enamel_epoxy',
    name: '일반칠 + 에폭시',
    description: '투명 코팅으로 고급스러움',
    detailedDescription: [
      '일반칠 위에 투명한 에폭시 코팅을 추가합니다',
      '표면이 매끄럽고 광택이 나서 고급스럽습니다',
      '코팅으로 인해 내구성이 향상됩니다',
    ],
    recommendation: '프리미엄 메달, 선물용, VIP 기념품',
    image: '/badge-types/soft_enamel_epoxy.png',
    icon: '💧',
    color: 'from-cyan-400 to-blue-500',
    priceAddon: 300,
  },
  {
    id: 'hard_enamel',
    name: '수지칠',
    description: '반투명, 부드러운 색감',
    detailedDescription: [
      '표면을 연마하여 도금선과 색상이 같은 높이입니다',
      '매끄러운 촉감과 고급스러운 외관을 제공합니다',
      '반투명한 색감으로 부드러운 느낌을 줍니다',
    ],
    recommendation: '고급 브랜드 메달, 수집용, 한정판',
    image: '/badge-types/hard_enamel.png',
    icon: '🌈',
    color: 'from-purple-400 to-pink-500',
    priceAddon: 500,
  },
  {
    id: 'printed',
    name: 'UV 인쇄',
    description: '사진/그라데이션 표현',
    detailedDescription: [
      '사진, 그라데이션, 복잡한 디자인 표현이 가능합니다',
      'UV 잉크로 선명한 풀컬러 인쇄를 제공합니다',
      '세밀한 디테일과 다양한 색상 표현에 적합합니다',
    ],
    recommendation: '캐릭터 메달, 포토 메달, 일러스트',
    image: '/badge-types/printed.png',
    icon: '🖼️',
    color: 'from-rose-400 to-red-500',
    priceAddon: 0,
  },
  {
    id: '3d',
    name: '3D 입체',
    description: '양각으로 볼륨감',
    detailedDescription: [
      '입체적인 양각 디자인으로 볼륨감을 표현합니다',
      '로고나 심볼을 돋보이게 하는데 효과적입니다',
      '독특하고 인상적인 메달을 원할 때 추천합니다',
    ],
    recommendation: '브랜드 로고, 마스코트, 특별 기념품',
    image: '/badge-types/3d.png',
    icon: '🏔️',
    color: 'from-emerald-400 to-teal-500',
    priceAddon: 500,
  },
  {
    id: 'die_struck',
    name: '칠없음',
    description: '금속 질감만 (무도색)',
    detailedDescription: [
      '색상 없이 금속 도금만으로 제작됩니다',
      '클래식하고 고급스러운 느낌을 줍니다',
      '심플한 로고나 텍스트 표현에 적합합니다',
    ],
    recommendation: '공식 메달, 클래식 디자인, 명패',
    image: '/badge-types/die_struck.png',
    icon: '⚙️',
    color: 'from-gray-400 to-gray-600',
    priceAddon: 0,
  },
  {
    id: 'custom',
    name: '기타',
    description: '카카오톡 문의',
    detailedDescription: [
      '위 옵션에 없는 특별한 제작 방식을 원하시나요?',
      '카카오톡으로 문의해주시면 상담해드립니다',
      '야광, 글리터, 스톤 등 특수 효과도 가능합니다',
    ],
    recommendation: '특수 효과, 맞춤 제작',
    image: '/badge-types/custom.png',
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

