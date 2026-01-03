/**
 * 마이페이지 관련 타입 정의
 */

// 배송지 타입
export type Address = {
  id: string
  user_id: string
  name: string
  phone: string
  zonecode: string
  address: string
  address_detail: string
  is_default: boolean
  created_at: string
}

// 배송지 폼 타입
export type AddressFormData = {
  name: string
  phone: string
  zonecode: string
  address: string
  address_detail: string
  is_default: boolean
}

// 프로필 타입
export type ProfileData = {
  name: string
  phone: string
}

// 비밀번호 변경 폼 타입
export type PasswordFormData = {
  current: string
  new: string
  confirm: string
}

// 탭 타입
export type MyPageTab = 'profile' | 'password' | 'address' | 'withdraw'

// Toast 타입
export type ToastType = 'success' | 'error'

// 다음 우편번호 API 타입 정의
export interface DaumPostcodeData {
  zonecode: string
  address: string
  addressType: string
  bname: string
  buildingName: string
}

export interface DaumPostcode {
  new (options: {
    oncomplete: (data: DaumPostcodeData) => void
  }): { open: () => void }
}

// Window 확장 타입
declare global {
  interface Window {
    daum?: {
      Postcode: DaumPostcode
    }
  }
}









