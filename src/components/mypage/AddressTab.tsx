'use client'

/**
 * 배송지 관리 탭 컴포넌트
 */

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Address, AddressFormData, DaumPostcodeData } from '@/types/mypage'

interface AddressTabProps {
  userId: string
  initialAddresses: Address[]
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

// 초기 폼 상태
const INITIAL_FORM: AddressFormData = {
  name: '',
  phone: '',
  zonecode: '',
  address: '',
  address_detail: '',
  is_default: false,
}

export default function AddressTab({
  userId,
  initialAddresses,
  onSuccess,
  onError,
}: AddressTabProps) {
  const supabase = createClient()
  
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses)
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [form, setForm] = useState<AddressFormData>(INITIAL_FORM)
  const [isLoading, setIsLoading] = useState(false)

  // 주소 검색 (다음 우편번호 API)
  const handleAddressSearch = () => {
    if (typeof window !== 'undefined' && window.daum) {
      new window.daum.Postcode({
        oncomplete: function(data: DaumPostcodeData) {
          setForm(prev => ({
            ...prev,
            zonecode: data.zonecode,
            address: data.address,
          }))
        }
      }).open()
    }
  }

  // 배송지 저장
  const handleSaveAddress = async () => {
    if (!form.name || !form.phone || !form.address) {
      onError('필수 항목을 입력해주세요.')
      return
    }

    setIsLoading(true)
    try {
      // 기본 배송지로 설정 시 기존 기본 배송지 해제
      if (form.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', userId)
      }

      if (editingAddress) {
        // 수정
        const { error } = await supabase
          .from('addresses')
          .update({
            name: form.name,
            phone: form.phone,
            zonecode: form.zonecode,
            address: form.address,
            address_detail: form.address_detail,
            is_default: form.is_default,
          })
          .eq('id', editingAddress.id)

        if (error) throw error
        onSuccess('배송지가 수정되었습니다.')
      } else {
        // 추가
        const { error } = await supabase
          .from('addresses')
          .insert({
            user_id: userId,
            name: form.name,
            phone: form.phone,
            zonecode: form.zonecode,
            address: form.address,
            address_detail: form.address_detail,
            is_default: form.is_default,
          })

        if (error) throw error
        onSuccess('배송지가 추가되었습니다.')
      }

      // 목록 새로고침
      await refreshAddresses()
      resetForm()
    } catch (error) {
      onError('배송지 저장에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 배송지 삭제
  const handleDeleteAddress = async (id: string) => {
    if (!confirm('이 배송지를 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id)

      if (error) throw error

      setAddresses(addresses.filter(address => address.id !== id))
      onSuccess('배송지가 삭제되었습니다.')
    } catch (error) {
      onError('배송지 삭제에 실패했습니다.')
    }
  }

  // 배송지 수정 시작
  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setForm({
      name: address.name,
      phone: address.phone,
      zonecode: address.zonecode,
      address: address.address,
      address_detail: address.address_detail,
      is_default: address.is_default,
    })
    setShowForm(true)
  }

  // 목록 새로고침
  const refreshAddresses = async () => {
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    if (data) setAddresses(data)
  }

  // 폼 초기화
  const resetForm = () => {
    setShowForm(false)
    setEditingAddress(null)
    setForm(INITIAL_FORM)
  }

  // 새 배송지 추가 시작
  const handleAddNew = () => {
    setShowForm(true)
    setEditingAddress(null)
    setForm({
      ...INITIAL_FORM,
      is_default: addresses.length === 0,
    })
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-lg">배송지 관리</h2>
        {!showForm && (
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors"
          >
            + 새 배송지 추가
          </button>
        )}
      </div>

      {showForm ? (
        // 배송지 입력 폼
        <AddressForm
          form={form}
          setForm={setForm}
          isLoading={isLoading}
          isEditing={!!editingAddress}
          onSave={handleSaveAddress}
          onCancel={resetForm}
          onAddressSearch={handleAddressSearch}
        />
      ) : addresses.length === 0 ? (
        // 빈 상태
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
            📍
          </div>
          <p className="text-gray-500">등록된 배송지가 없습니다.</p>
        </div>
      ) : (
        // 배송지 목록
        <div className="space-y-3">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={handleEditAddress}
              onDelete={handleDeleteAddress}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// 배송지 입력 폼 서브컴포넌트
interface AddressFormComponentProps {
  form: AddressFormData
  setForm: React.Dispatch<React.SetStateAction<AddressFormData>>
  isLoading: boolean
  isEditing: boolean
  onSave: () => void
  onCancel: () => void
  onAddressSearch: () => void
}

function AddressForm({
  form,
  setForm,
  isLoading,
  isEditing,
  onSave,
  onCancel,
  onAddressSearch,
}: AddressFormComponentProps) {
  return (
    <div className="space-y-4">
      {/* 이름 & 연락처 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            받는 분 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="이름"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            연락처 <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="010-0000-0000"
          />
        </div>
      </div>

      {/* 주소 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          주소 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={form.zonecode}
            readOnly
            className="w-28 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50"
            placeholder="우편번호"
          />
          <button
            type="button"
            onClick={onAddressSearch}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            주소 검색
          </button>
        </div>
        <input
          type="text"
          value={form.address}
          readOnly
          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 mb-2"
          placeholder="주소"
        />
        <input
          type="text"
          value={form.address_detail}
          onChange={(e) => setForm({ ...form, address_detail: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="상세주소"
        />
      </div>

      {/* 기본 배송지 체크박스 */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.is_default}
          onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
          className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
        />
        <span className="text-sm text-gray-700">기본 배송지로 설정</span>
      </label>

      {/* 버튼 */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
        <button
          onClick={onSave}
          disabled={isLoading}
          className="flex-1 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
        >
          {isLoading ? '저장 중...' : isEditing ? '수정하기' : '추가하기'}
        </button>
      </div>
    </div>
  )
}

// 배송지 카드 서브컴포넌트
interface AddressCardProps {
  address: Address
  onEdit: (address: Address) => void
  onDelete: (id: string) => void
}

function AddressCard({ address, onEdit, onDelete }: AddressCardProps) {
  return (
    <div
      className={`p-4 border rounded-xl ${
        address.is_default ? 'border-primary-300 bg-primary-50' : 'border-gray-200'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{address.name}</span>
            {address.is_default && (
              <span className="px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                기본
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{address.phone}</p>
          <p className="text-sm text-gray-600 mt-1">
            [{address.zonecode}] {address.address} {address.address_detail}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(address)}
            className="text-sm text-gray-500 hover:text-primary-600"
          >
            수정
          </button>
          <button
            onClick={() => onDelete(address.id)}
            className="text-sm text-gray-500 hover:text-red-600"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  )
}







