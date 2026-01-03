import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// 타입 정의
export type Profile = {
  id: string
  email: string
  name: string | null
  phone: string | null
  address: string | null
  created_at: string
}

export type Order = {
  id: string
  user_id: string | null  // 비회원 주문 시 null
  guest_email: string | null  // 비회원 주문 시 이메일 저장
  order_number: string
  status: 'pending' | 'confirmed' | 'producing' | 'shipping' | 'completed' | 'cancelled'
  paint_type: string
  metal_color: string
  size: number
  quantity: number
  design_url: string | null
  design_name: string | null
  unit_price: number
  discount_amount: number
  total_price: number
  shipping_name: string | null
  shipping_phone: string | null
  shipping_zonecode: string | null
  shipping_address: string | null
  shipping_address_detail: string | null
  shipping_memo: string | null
  payment_method: string | null
  created_at: string
  paid_at: string | null
  shipped_at: string | null
  completed_at: string | null
}

export type CartItem = {
  id: string
  user_id: string
  paint_type: string
  metal_color: string
  size: number
  quantity: number
  design_url: string | null
  design_name: string | null
  created_at: string
}

export type Template = {
  id: string
  name: string
  icon: string
  category: string
  is_premium: boolean
}

export type ReferenceItem = {
  id: string
  title: string
  description: string | null
  image_url: string
  paint_type: string
  metal_color: string
  size: string
  is_featured: boolean
  display_order: number
  created_at: string
}

// 사용자 디자인 (금형 재사용을 위한 저장된 디자인)
export type UserDesign = {
  id: string
  user_id: string
  design_url: string
  design_name: string
  memo: string | null
  preview_url: string | null
  mold_completed: boolean
  created_at: string
}

// 금형비
export const MOLD_FEE = 90000

// 가격 계산 유틸리티 - 뱃지 종류별 추가 비용
// ⚠️ 가격은 나중에 실제 값으로 교체 필요
export const priceTable: Record<string, { base: number; addon: number; name: string }> = {
  'normal': { base: 3500, addon: 0, name: '일반칠' },
  'normal_epoxy': { base: 3500, addon: 300, name: '일반칠 + 에폭시' },
  'resin': { base: 3500, addon: 200, name: '수지칠' },
  'no_paint': { base: 3500, addon: 0, name: '칠없음' },
  '3d': { base: 3500, addon: 500, name: '3D 입체' },
  'uv_print': { base: 3500, addon: 400, name: 'UV인쇄' },
  'custom': { base: 3500, addon: 0, name: '기타' }, // 별도 견적
  // 기존 호환성 유지
  'epoxy': { base: 3500, addon: 300, name: '에폭시' },
}

// 기존 paint_type 값에 대한 한글 변환 (마이그레이션 전 호환성)
export const legacyPaintTypeLabels: Record<string, string> = {
  'soft-enamel': '소프트 에나멜',
  'hard-enamel': '하드 에나멜',
  'printed': '프린트 뱃지',
  'acrylic': '아크릴 뱃지',
}

// paint_type을 한글로 변환하는 헬퍼 함수
export function getPaintTypeName(paintType: string): string {
  return priceTable[paintType as keyof typeof priceTable]?.name 
    || legacyPaintTypeLabels[paintType] 
    || paintType
}

// 도금 색상 한글 변환
export const metalColorLabels: Record<string, string> = {
  gold: '금도금',
  silver: '은도금',
  'rose-gold': '로즈골드',
  'black-nickel': '흑니켈',
}

export function getMetalColorName(metalColor: string): string {
  return metalColorLabels[metalColor] || metalColor
}

export const sizeAddon: Record<number, number> = {
  30: 0,
  40: 600,
  50: 900,
  60: 1300,
  70: 1600,
  80: 2100,
  90: 2600,
  100: 3000,
}

export function calculatePrice(
  paintType: string,
  size: number,
  quantity: number
): { unitPrice: number; discount: number; total: number; discountPerUnit: number; sizeAddonPrice: number } {
  const typePrice = priceTable[paintType as keyof typeof priceTable] || priceTable['normal']
  const sizeAddonPrice = sizeAddon[size] || 0
  const baseUnitPrice = typePrice.base + typePrice.addon + sizeAddonPrice

  // 수량별 개당 할인 금액
  let discountPerUnit = 0
  if (quantity >= 5000) discountPerUnit = 1500
  else if (quantity >= 1000) discountPerUnit = 1300
  else if (quantity >= 500) discountPerUnit = 1200
  else if (quantity >= 300) discountPerUnit = 600
  else if (quantity >= 100) discountPerUnit = 300
  // 1~99개는 할인 없음

  const unitPrice = baseUnitPrice - discountPerUnit
  const discount = discountPerUnit * quantity
  const total = unitPrice * quantity

  return { unitPrice, discount, total, discountPerUnit, sizeAddonPrice }
}

// 배송비 계산
export const SHIPPING_FEE = 3000 // 기본 배송비
export const FREE_SHIPPING_THRESHOLD = 50000 // 무료배송 기준 금액

export function calculateShippingFee(totalPrice: number): number {
  return totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
}

// 주문 상태 한글 변환
export const statusLabels: Record<string, string> = {
  pending: '결제 대기',
  confirmed: '결제 완료',
  producing: '제작 중',
  shipping: '배송 중',
  completed: '배송 완료',
  cancelled: '취소됨',
}

export const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  producing: 'bg-blue-100 text-blue-800',
  shipping: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
}
