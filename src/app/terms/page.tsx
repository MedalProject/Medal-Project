'use client'

import Link from 'next/link'
import Header from '@/components/Header'

export default function TermsPage() {
  return (
    <>
      <Header />
      
      <main className="pt-24 pb-16 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto">
          {/* 페이지 헤더 */}
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">
              서비스 이용약관
            </h1>
            <p className="text-gray-500 text-lg">메달프로젝트 서비스 이용 약관</p>
          </div>

          {/* 콘텐츠 */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
            
            {/* 서문 */}
            <section>
              <div className="bg-primary-50 rounded-2xl p-5 border border-primary-200 text-gray-700">
                <p>
                  본 약관은 메달프로젝트(이하 &quot;회사&quot;)가 제공하는 서비스의 
                  이용조건 및 절차, 회사와 이용자의 권리, 의무 및 책임사항을 규정합니다.
                </p>
              </div>
            </section>

            {/* 1. 목적 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
                목적
              </h2>
              <div className="bg-gray-50 rounded-2xl p-5 text-gray-700">
                <p>
                  본 약관은 회사가 운영하는 웹사이트(medal-project.vercel.app)에서 
                  제공하는 메달 등 주문제작 서비스(이하 &quot;서비스&quot;)의 이용과 관련하여 
                  회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                </p>
              </div>
            </section>

            {/* 2. 용어의 정의 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
                용어의 정의
              </h2>
              <div className="bg-gray-50 rounded-2xl p-5 space-y-3 text-gray-700">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span><strong>&quot;서비스&quot;</strong>란 회사가 제공하는 메달 등 주문제작 서비스를 말합니다.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span><strong>&quot;이용자&quot;</strong>란 본 약관에 동의하고 서비스를 이용하는 모든 회원 및 비회원을 말합니다.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span><strong>&quot;회원&quot;</strong>이란 회사에 개인정보를 제공하고 회원등록을 한 자를 말합니다.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* 3. 서비스 제공 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">3</span>
                서비스 제공
              </h2>
              <div className="bg-gray-50 rounded-2xl p-5 text-gray-700">
                <p className="mb-3">회사는 다음과 같은 서비스를 제공합니다:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>메달 등 주문제작 상품 판매</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>주문 내역 조회 및 관리</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>기타 회사가 정하는 서비스</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* 4. 회원가입 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">4</span>
                회원가입
              </h2>
              <div className="bg-gray-50 rounded-2xl p-5 space-y-3 text-gray-700">
                <p>
                  회원가입은 이용자가 약관 내용에 동의를 한 후 회원가입 신청을 하고, 
                  회사가 이를 승낙함으로써 이루어집니다.
                </p>
                <p>
                  회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 거부하거나 
                  사후에 이용계약을 해지할 수 있습니다:
                </p>
                <ul className="space-y-1 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">-</span>
                    <span>타인의 명의를 이용한 경우</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">-</span>
                    <span>허위 정보를 기재한 경우</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">-</span>
                    <span>기타 회원으로 등록하는 것이 부적절한 경우</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* 5. 주문 및 결제 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">5</span>
                주문 및 결제
              </h2>
              <div className="bg-gray-50 rounded-2xl p-5 space-y-3 text-gray-700">
                <p>
                  이용자는 서비스 내에서 다음과 같은 방법으로 결제할 수 있습니다:
                </p>
                <ul className="space-y-1 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>신용카드 결제</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>계좌이체</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>기타 회사가 제공하는 결제 수단</span>
                  </li>
                </ul>
                <p className="text-sm text-gray-500 mt-3">
                  주문제작 상품의 특성상, 결제 완료 후 제작이 시작되면 
                  단순 변심에 의한 취소가 어려울 수 있습니다.
                </p>
              </div>
            </section>

            {/* 6. 환불 규정 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">6</span>
                환불 규정
              </h2>
              <div className="bg-gray-50 rounded-2xl p-5 text-gray-700">
                <p className="mb-3">
                  환불에 관한 세부 사항은{' '}
                  <Link href="/refund" className="text-primary-600 underline hover:text-primary-700">
                    환불 규정 페이지
                  </Link>
                  를 참조하시기 바랍니다.
                </p>
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 text-sm">
                  <p className="font-semibold text-yellow-800 mb-1">⚠️ 주문제작 상품 안내</p>
                  <p className="text-yellow-700">
                    주문제작 상품은 제작 시작 후 단순 변심에 의한 환불이 불가합니다.
                  </p>
                </div>
              </div>
            </section>

            {/* 7. 서비스 변경 및 중단 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">7</span>
                서비스 변경 및 중단
              </h2>
              <div className="bg-gray-50 rounded-2xl p-5 space-y-3 text-gray-700">
                <p>
                  회사는 운영상, 기술상의 필요에 따라 서비스를 변경할 수 있습니다.
                </p>
                <p>
                  회사는 다음 각 호에 해당하는 경우 서비스의 전부 또는 일부를 
                  제한하거나 중단할 수 있습니다:
                </p>
                <ul className="space-y-1 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">-</span>
                    <span>시스템 점검, 교체 등 기술적 필요</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">-</span>
                    <span>천재지변, 국가비상사태 등 불가항력적 사유</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">-</span>
                    <span>기타 회사가 서비스를 제공할 수 없는 사유 발생</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* 8. 이용자의 의무 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">8</span>
                이용자의 의무
              </h2>
              <div className="bg-red-50 rounded-2xl p-5 border border-red-200">
                <p className="font-semibold text-red-800 mb-3">이용자는 다음 행위를 하여서는 안 됩니다:</p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✕</span>
                    <span>신청 또는 변경 시 허위 내용을 등록하는 행위</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✕</span>
                    <span>타인의 정보를 도용하는 행위</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✕</span>
                    <span>회사가 게시한 정보를 변경하는 행위</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✕</span>
                    <span>회사와 기타 제3자의 저작권 등 지적재산권을 침해하는 행위</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✕</span>
                    <span>기타 불법적이거나 부당한 행위</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* 9. 책임의 제한 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">9</span>
                책임의 제한
              </h2>
              <div className="bg-gray-50 rounded-2xl p-5 space-y-3 text-gray-700">
                <p>
                  회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 
                  불가항력적인 사유로 인한 서비스 제공 불가에 대해 책임을 지지 않습니다.
                </p>
                <p>
                  회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여 
                  책임을 지지 않습니다.
                </p>
              </div>
            </section>

            {/* 10. 분쟁 해결 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">10</span>
                분쟁 해결
              </h2>
              <div className="bg-gray-50 rounded-2xl p-5 space-y-3 text-gray-700">
                <p>
                  서비스 이용과 관련하여 분쟁이 발생한 경우, 
                  회사와 이용자는 분쟁의 해결을 위해 성실히 협의합니다.
                </p>
                <p>
                  협의가 이루어지지 않을 경우, 관할법원은 민사소송법에 따른 
                  관할법원으로 합니다.
                </p>
              </div>
            </section>

            {/* 11. 문의처 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">11</span>
                문의처
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
              본 서비스 이용약관은 2025년 1월 1일부터 시행됩니다.
            </div>
          </div>

          {/* 뒤로가기 버튼 */}
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









