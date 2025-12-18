/**
 * 주문 페이지 유틸리티 함수
 * 
 * 순수 함수들을 모아둔 파일입니다.
 * React state에 의존하지 않는 헬퍼 함수들만 포함합니다.
 */

import { METAL_COLORS, SIZES } from '@/constants/order'
import { priceTable } from '@/lib/supabase'

/**
 * 도금 색상 ID를 한글 이름으로 변환
 * @param colorId - 색상 ID (예: 'gold', 'silver')
 * @returns 한글 색상명 (예: '금도금', '은도금')
 */
export function getMetalColorName(colorId: string): string {
  return METAL_COLORS.find(metal => metal.id === colorId)?.name || colorId
}

/**
 * 도장 타입을 한글 이름으로 변환
 * @param paintType - 도장 타입 ID (예: 'normal', 'soft', 'printing')
 * @returns 한글 도장명
 */
export function getPaintTypeName(paintType: string): string {
  return priceTable[paintType as keyof typeof priceTable]?.name || paintType
}

/**
 * 크기(mm)를 라벨로 변환
 * @param size - 크기 (30, 40, 50, ...)
 * @returns 라벨 (예: '30×30mm 이하')
 */
export function getSizeLabel(size: number): string {
  return SIZES.find(s => s.size === size)?.label || `${size}×${size}mm`
}

/**
 * 고유 ID 생성 (주문 항목용)
 * @returns 고유 문자열 ID
 */
export function generateOrderItemId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * 파일 확장자 검증
 * @param fileName - 파일명
 * @param allowedExtensions - 허용된 확장자 배열 (기본: ['ai'])
 * @returns 유효 여부
 */
export function isValidFileExtension(
  fileName: string, 
  allowedExtensions: string[] = ['ai']
): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase()
  return extension ? allowedExtensions.includes(extension) : false
}

/**
 * 파일 크기가 제한 이내인지 확인
 * @param fileSize - 파일 크기 (bytes)
 * @param maxSize - 최대 크기 (기본: 50MB)
 * @returns 유효 여부
 */
export function isValidFileSize(
  fileSize: number, 
  maxSize: number = 50 * 1024 * 1024
): boolean {
  return fileSize <= maxSize
}

/**
 * 숫자를 한국 원화 포맷으로 변환
 * @param amount - 금액
 * @returns 포맷된 문자열 (예: '12,500원')
 */
export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString()}원`
}

