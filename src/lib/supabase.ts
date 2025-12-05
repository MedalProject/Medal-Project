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
  user_id: string
  order_number: string
  status: 'pending' | 'confirmed' | 'producing' | 'shipping' | 'completed' | 'cancelled'
  badge_type: string
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
  shipping_address: string | null
  shipping_memo: string | null
  created_at: string
  paid_at: string | null
  shipped_at: string | null
  completed_at: string | null
}

export type CartItem = {
  id: string
  user_id: string
  badge_type: string
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

// 가격 계산 유틸리티
export const priceTable = {
  'soft-enamel': { base: 3500, addon: 0, name: '소프트 에나멜' },
  'hard-enamel': { base: 4500, addon: 500, name: '하드 에나멜' },
  'printed': { base: 2500, addon: 0, name: '프린트 뱃지' },
  'acrylic': { base: 1500, addon: 0, name: '아크릴 뱃지' },
}

export const sizeMultiplier: Record<number, number> = {
  20: 0.9,
  25: 1,
  30: 1.2,
  40: 1.5,
}

export function calculatePrice(
  badgeType: string,
  size: number,
  quantity: number
): { unitPrice: number; discount: number; total: number; discountPercent: number } {
  const typePrice = priceTable[badgeType as keyof typeof priceTable] || priceTable['soft-enamel']
  const sizeMulti = sizeMultiplier[size] || 1
  const basePrice = Math.round(typePrice.base * sizeMulti)
  const unitPrice = basePrice + typePrice.addon

  let discountPercent = 0
  if (quantity >= 100) discountPercent = 30
  else if (quantity >= 50) discountPercent = 20
  else if (quantity >= 20) discountPercent = 10

  const subtotal = unitPrice * quantity
  const discount = Math.round(subtotal * (discountPercent / 100))
  const total = subtotal - discount

  return { unitPrice, discount, total, discountPercent }
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
  producing: 'bg-purple-100 text-purple-800',
  shipping: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
}
