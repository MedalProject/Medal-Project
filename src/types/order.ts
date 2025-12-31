/**
 * 주문 페이지 관련 타입 정의
 * 
 * 이 파일은 주문 프로세스에서 사용되는 모든 타입을 정의합니다.
 * 다른 파일에서 import해서 사용하세요.
 */

// 주문 항목 타입
export type OrderItem = {
  id: string
  file: File | null          // 신규 디자인일 때만 사용
  designId: string | null    // 기존 디자인 재사용 시
  designUrl: string | null   // 기존 디자인 URL
  designName: string         // 파일명 또는 디자인명
  isNewMold: boolean         // 신규 금형 여부 (금형비 부과)
  paintType: string
  metalColor: string
  size: number
  quantity: number
}

// 도금 색상 옵션 타입
export type MetalColorOption = {
  id: string
  name: string
  class: string
  image?: string  // 도금 샘플 이미지 경로
}

// 크기 옵션 타입
export type SizeOption = {
  size: number
  label: string
  addon: number
}

// 수량별 할인 구간 타입
export type QuantityTier = {
  min: number
  max: number
  discount: number
  label: string
}

// Toast 알림 타입
export type ToastType = 'success' | 'error'

// 디자인 모드 (신규 / 기존)
export type DesignMode = 'new' | 'existing'

