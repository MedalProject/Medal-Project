/**
 * 주문 페이지 관련 타입 정의
 * 
 * 이 파일은 주문 프로세스에서 사용되는 모든 타입을 정의합니다.
 * 다른 파일에서 import해서 사용하세요.
 */

// 뱃지 종류 (칠 타입) - 업계 표준 영문명
export type PaintType = 
  | 'soft_enamel'       // 일반칠
  | 'soft_enamel_epoxy' // 일반칠 + 에폭시
  | 'hard_enamel'       // 수지칠
  | 'die_struck'        // 칠없음
  | '3d'                // 3D 입체
  | 'printed'           // UV인쇄
  | 'custom'            // 기타 (카카오톡 문의)

// 뱃지 종류 옵션 타입
export type PaintTypeOption = {
  id: PaintType
  name: string           // 표시 이름
  description: string    // 짧은 툴팁 설명
  detailedDescription: string[]  // 상세 설명 (bullet points)
  recommendation: string // 추천 용도
  image?: string         // 샘플 이미지 경로
  icon: string           // 이모지 아이콘
  color: string          // 배경 그라데이션 색상
  priceAddon: number     // 추가 비용 (원)
  isCustom?: boolean     // 기타 옵션 여부 (카카오톡 문의)
}

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

