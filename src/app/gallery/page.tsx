'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Header from '@/components/Header'
import { createClient, ReferenceItem, getPaintTypeName, getMetalColorName } from '@/lib/supabase'

export default function GalleryPage() {
  const [referenceItems, setReferenceItems] = useState<ReferenceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<ReferenceItem | null>(null)
  const supabase = createClient()

  // ESC 키로 모달 닫기
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSelectedItem(null)
    }
  }, [])

  useEffect(() => {
    if (selectedItem) {
      document.addEventListener('keydown', handleKeyDown)
      // 모달 열릴 때 스크롤 방지
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [selectedItem, handleKeyDown])

  useEffect(() => {
    fetchReferenceItems()
  }, [])

  const fetchReferenceItems = async () => {
    try {
      const { data, error } = await supabase
        .from('badge_references')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) throw error
      setReferenceItems(data || [])
    } catch (error) {
      console.error('Error fetching gallery:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      
      <main className="pt-24 pb-16 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">
              제작 사례 보기
            </h1>
            <p className="text-gray-500 text-lg">
              Hey Badge에서 제작된 다양한 뱃지들을 만나보세요
            </p>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-5">
                    <div className="h-5 bg-gray-200 rounded mb-2 w-3/4" />
                    <div className="h-4 bg-gray-200 rounded mb-4 w-full" />
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded-full w-16" />
                      <div className="h-6 bg-gray-200 rounded-full w-14" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : referenceItems.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📸</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">아직 등록된 사례가 없습니다</h3>
              <p className="text-gray-500">곧 멋진 제작 사례들이 추가될 예정이에요!</p>
            </div>
          ) : (
            /* Gallery Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {referenceItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
                >
                  {/* Image Area */}
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                    {item.description && (
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">{item.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                        {getPaintTypeName(item.paint_type)}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        {getMetalColorName(item.metal_color)}
                      </span>
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                        {item.size}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-primary-500 to-blue-400 rounded-3xl p-8 sm:p-12 text-white">
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4">
                나만의 뱃지를 만들어보세요!
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                AI 파일만 있으면 20일 이내에 고품질 뱃지를 받아보실 수 있습니다.
              </p>
              <a
                href="/order"
                className="inline-block px-8 py-4 bg-white text-primary-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                뱃지 만들기 →
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* 이미지 확대 모달 */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedItem(null)}
        >
          {/* 배경 딤 */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          {/* 모달 콘텐츠 */}
          <div
            className="relative max-w-4xl w-full max-h-[90vh] animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 닫기 버튼 */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors z-10"
              aria-label="닫기"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 이미지 */}
            <div className="relative aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
              <Image
                src={selectedItem.image_url}
                alt={selectedItem.title}
                fill
                className="object-contain p-4"
                sizes="(max-width: 1024px) 100vw, 896px"
                priority
              />
            </div>

            {/* 이미지 정보 */}
            <div className="mt-4 text-center">
              <h3 className="text-white text-xl font-bold mb-2">{selectedItem.title}</h3>
              <div className="flex justify-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm">
                  {getPaintTypeName(selectedItem.paint_type)}
                </span>
                <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm">
                  {getMetalColorName(selectedItem.metal_color)}
                </span>
                <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm">
                  {selectedItem.size}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
