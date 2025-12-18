'use client'

import { RefObject } from 'react'
import { MOLD_FEE, UserDesign } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { DesignMode, ToastType } from '@/types/order'

interface DesignSelectorProps {
  user: User | null
  designMode: DesignMode
  setDesignMode: (mode: DesignMode) => void
  designFile: File | null
  setDesignFile: (file: File | null) => void
  selectedDesign: UserDesign | null
  setSelectedDesign: (design: UserDesign | null) => void
  userDesigns: UserDesign[]
  designsLoading: boolean
  showToast: (message: string, type?: ToastType) => void
  uploadHighlight: boolean
  uploadRef: RefObject<HTMLLabelElement | null>
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function DesignSelector({
  user,
  designMode,
  setDesignMode,
  designFile,
  setDesignFile,
  selectedDesign,
  setSelectedDesign,
  userDesigns,
  designsLoading,
  showToast,
  uploadHighlight,
  uploadRef,
  handleFileChange,
}: DesignSelectorProps) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm">
      {/* 섹션 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 bg-primary-100 rounded-xl flex items-center justify-center text-xl">🎨</div>
        <div>
          <h2 className="font-bold text-lg">디자인 선택</h2>
          <p className="text-gray-500 text-sm">신규 디자인 또는 기존 디자인을 선택하세요</p>
        </div>
      </div>

      {/* 디자인 모드 선택 */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => {
            setDesignMode('new')
            setSelectedDesign(null)
          }}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            designMode === 'new'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-primary-300'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="text-2xl">📤</div>
            <div className="font-semibold">신규 디자인</div>
          </div>
          <p className="text-sm text-gray-500">새 파일 업로드</p>
          <p className="text-sm font-medium text-amber-600 mt-2">
            +₩{MOLD_FEE.toLocaleString()} 금형비
          </p>
        </button>
        
        <button
          onClick={() => {
            if (!user) {
              showToast('로그인 후 이용 가능합니다.', 'error')
              return
            }
            setDesignMode('existing')
            setDesignFile(null)
          }}
          disabled={!user}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            designMode === 'existing'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-primary-300'
          } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="text-2xl">📁</div>
            <div className="font-semibold">기존 디자인</div>
          </div>
          <p className="text-sm text-gray-500">이전 주문 재사용</p>
          <p className="text-sm font-medium text-green-600 mt-2">
            금형비 무료
          </p>
        </button>
      </div>

      {/* 신규 디자인 - 파일 업로드 */}
      {designMode === 'new' && (
        <label 
          ref={uploadRef}
          className={`block border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          uploadHighlight 
            ? 'border-red-500 bg-red-50 animate-pulse' 
            : 'border-gray-200 hover:border-primary-400 hover:bg-primary-50/50'
        }`}>
          <input type="file" className="hidden" accept=".ai,application/postscript" onChange={handleFileChange} />
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 ${
            uploadHighlight 
              ? 'bg-red-500' 
              : 'bg-gradient-to-r from-primary-500 to-blue-400'
          }`}>
            {uploadHighlight ? '⚠️' : '📤'}
          </div>
          <p className={`font-semibold mb-2 ${uploadHighlight ? 'text-red-600' : ''}`}>
            {uploadHighlight ? '👆 여기를 클릭해서 파일을 업로드하세요!' : '디자인 파일을 드래그하거나 클릭하세요'}
          </p>
          <p className="text-gray-400 text-sm">AI 파일만 지원 (최대 50MB)</p>
          {designFile && (
            <div className="mt-4 space-y-2">
              <p className="text-primary-600 font-medium">✓ {designFile.name}</p>
              <p className="text-gray-500 text-xs">
                크기: {(designFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}
        </label>
      )}

      {/* 기존 디자인 - 디자인 목록 */}
      {designMode === 'existing' && (
        <div className="space-y-3">
          {designsLoading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-3"></div>
              디자인 목록을 불러오는 중...
            </div>
          ) : userDesigns.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-2xl">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-500 font-medium">저장된 디자인이 없습니다</p>
              <p className="text-gray-400 text-sm mt-1">
                신규 디자인으로 첫 주문을 진행해주세요
              </p>
              <button
                onClick={() => setDesignMode('new')}
                className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors"
              >
                신규 디자인 업로드하기
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-3">
                재사용할 디자인을 선택하세요 ({userDesigns.length}개)
              </p>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {userDesigns.map((design) => (
                  <button
                    key={design.id}
                    onClick={() => setSelectedDesign(design)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                      selectedDesign?.id === design.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                      {design.preview_url ? (
                        <img src={design.preview_url} alt="" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        '🎨'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{design.design_name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(design.created_at).toLocaleDateString('ko-KR')}
                      </p>
                      {design.memo && (
                        <p className="text-xs text-gray-400 truncate mt-1">{design.memo}</p>
                      )}
                    </div>
                    {selectedDesign?.id === design.id && (
                      <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm">
                        ✓
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {selectedDesign && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-2 text-green-700">
                    <span className="text-lg">✓</span>
                    <span className="font-medium">선택됨: {selectedDesign.design_name}</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    기존 금형을 사용하여 금형비가 부과되지 않습니다
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 금형비 안내 */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div className="text-sm">
            <p className="font-medium text-amber-800">금형비 안내</p>
            <p className="text-amber-700 mt-1">
              새로운 디자인은 금형 제작이 필요하여 <strong>₩{MOLD_FEE.toLocaleString()}</strong>의 금형비가 부과됩니다.
              동일한 디자인으로 재주문 시에는 금형비가 부과되지 않습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

