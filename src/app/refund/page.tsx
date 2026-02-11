'use client'

import Link from 'next/link'
import Header from '@/components/Header'

export default function RefundPage() {
  return (
    <>
      <Header />
      
      <main className="pt-24 pb-16 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">
              환불 규정
            </h1>
            <p className="text-gray-500 text-lg">메달프로젝트 서비스 환불 정책 안내</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
            
            {/* 1. 환불 기본 원칙 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
                환불 기본 원칙
              </h2>
              <div className="bg-gray-50 rounded-2xl p-5 space-y-3 text-gray-700">
                <p>메달프로젝트는 고객님의 만족을 최우선으로 생각합니다.</p>
                <p>주문제작 상품의 특성상 아래 환불 규정에 따라 처리됩니다.</p>
              </div>
            </section>

            {/* 2. 환불 가능한 경우 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
                환불 가능한 경우
              </h2>
              <div className="bg-green-50 rounded-2xl p-5 border border-green-200">
                <h3 className="font-semibold text-green-800 mb-3">✓ 100% 환불</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>제품 하자 (인쇄 불량, 파손 등)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>주문 내용과 다른 제품 배송</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* 3. 환불 불가능한 경우 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center text-sm font-bold">3</span>
                환불 불가능한 경우
              </h2>
              <div className="bg-red-50 rounded-2xl p-5 border border-red-200">
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✕</span>
                    <span>상품 발송 후 단순 변심에 의한 취소</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✕</span>
                    <span>고객 제공 디자인 파일의 오류로 인한 문제</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✕</span>
                    <span>고객 부주의로 인한 제품 파손</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✕</span>
                    <span>수령 후 7일 경과</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✕</span>
                    <span>색상이 화면과 다른 경우 (수작업 조색 특성상 차이 발생 가능)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✕</span>
                    <span>칠이 까진 경우 (사용 중 마모)</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* 4. 환불 절차 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">4</span>
                환불 절차
              </h2>
              <div className="bg-gray-50 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">1</div>
                    <p className="text-sm font-medium">환불 요청</p>
                    <p className="text-xs text-gray-500">이메일/전화</p>
                  </div>
                  <div className="text-gray-300 text-2xl hidden sm:block">→</div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">2</div>
                    <p className="text-sm font-medium">검토</p>
                    <p className="text-xs text-gray-500">1~2 영업일</p>
                  </div>
                  <div className="text-gray-300 text-2xl hidden sm:block">→</div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">3</div>
                    <p className="text-sm font-medium">승인/반려</p>
                    <p className="text-xs text-gray-500">결과 안내</p>
                  </div>
                  <div className="text-gray-300 text-2xl hidden sm:block">→</div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">4</div>
                    <p className="text-sm font-medium">환불 완료</p>
                    <p className="text-xs text-gray-500">3~5 영업일</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. 교환 안내 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">5</span>
                교환 안내
              </h2>
              <div className="bg-gray-50 rounded-2xl p-5 space-y-3 text-gray-700">
                <p>제품 하자 시 <strong>동일 제품으로 무상 교환</strong>해 드립니다.</p>
                <p>교환 요청 시 제품 사진을 함께 보내주시면 빠른 처리가 가능합니다.</p>
              </div>
            </section>

            {/* 6. 문의처 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">6</span>
                환불/교환 문의
              </h2>
              <div className="bg-primary-50 rounded-2xl p-5 border border-primary-200">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">이메일</p>
                    <p className="font-semibold text-gray-900">hello.medalproject@gmail.com</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">전화</p>
                    <p className="font-semibold text-gray-900">0502-1910-3343</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm text-gray-500 mb-1">운영시간</p>
                    <p className="font-semibold text-gray-900">평일 09:00 - 18:00 (주말/공휴일 휴무)</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 시행일 */}
            <div className="text-center text-sm text-gray-400 pt-4 border-t border-gray-100">
              본 환불 규정은 2025년 1월 1일부터 시행됩니다.
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <Link 
              href="/" 
              className="inline-block px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              ← 홈으로 돌아가기
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}

