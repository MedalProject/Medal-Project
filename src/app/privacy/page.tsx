'use client'

import Link from 'next/link'
import Header from '@/components/Header'

export default function PrivacyPage() {
  return (
    <>
      <Header />
      
      <main className="pt-24 pb-16 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto">
          {/* 페이지 헤더 */}
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">
              개인정보처리방침
            </h1>
            <p className="text-gray-500 text-lg">헤이뱃지 개인정보 보호 정책</p>
          </div>

          {/* 콘텐츠 */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
            
            {/* 서문 */}
            <section>
              <div className="bg-primary-50 rounded-2xl p-5 border border-primary-200 text-gray-700">
                <p>
                  헤이뱃지(이하 &quot;회사&quot;)는 정보통신망 이용촉진 및 정보보호 등에 관한 법률, 
                  개인정보보호법 등 관련 법령에 따라 이용자의 개인정보를 보호하고 있습니다.
                </p>
              </div>
            </section>

            {/* 1. 수집하는 개인정보 항목 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
                수집하는 개인정보 항목
              </h2>
              <div className="bg-gray-50 rounded-2xl p-5 space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">필수 수집 항목</h3>
                  <ul className="space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-primary-500 mt-1">•</span>
                      <span><strong>회원가입 시:</strong> 이메일, 비밀번호, 이름</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-500 mt-1">•</span>
                      <span><strong>소셜 로그인 시:</strong> 이메일, 이름, 프로필 이미지(선택)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-500 mt-1">•</span>
                      <span><strong>주문 시:</strong> 수령인 정보, 배송지 주소, 연락처</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-500 mt-1">•</span>
                      <span><strong>결제 시:</strong> 결제 정보(카드사를 통해 처리)</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">자동 수집 항목</h3>
                  <ul className="space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>IP 주소, 쿠키, 서비스 이용 기록, 접속 로그</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 2. 개인정보 수집 및 이용 목적 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
                개인정보 수집 및 이용 목적
              </h2>
              <div className="bg-gray-50 rounded-2xl p-5">
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>회원 가입 및 관리: 회원제 서비스 제공, 본인 확인</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>서비스 제공: 주문 처리, 제품 제작, 배송</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>결제 처리: 상품 결제 및 환불 처리</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>고객 지원: 문의 응대, 불만 처리</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>서비스 개선: 서비스 이용 분석 및 개선</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* 3. 개인정보 보유 및 이용 기간 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">3</span>
                개인정보 보유 및 이용 기간
              </h2>
              <div className="bg-gray-50 rounded-2xl p-5 space-y-3 text-gray-700">
                <p>회원 탈퇴 시 또는 수집 목적 달성 시 지체없이 파기합니다.</p>
                <p>단, 관계 법령에 따라 아래 기간 동안 보존됩니다:</p>
                <div className="bg-white rounded-xl p-4 mt-3 border border-gray-200">
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>계약 또는 청약철회 등에 관한 기록</span>
                      <span className="font-semibold">5년</span>
                    </li>
                    <li className="flex justify-between">
                      <span>대금결제 및 재화 등의 공급에 관한 기록</span>
                      <span className="font-semibold">5년</span>
                    </li>
                    <li className="flex justify-between">
                      <span>소비자 불만 또는 분쟁처리에 관한 기록</span>
                      <span className="font-semibold">3년</span>
                    </li>
                    <li className="flex justify-between">
                      <span>웹사이트 방문 기록</span>
                      <span className="font-semibold">3개월</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 4. 개인정보 제3자 제공 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">4</span>
                개인정보 제3자 제공
              </h2>
              <div className="bg-green-50 rounded-2xl p-5 border border-green-200 text-gray-700">
                <p className="font-semibold text-green-800 mb-2">원칙적으로 제3자에게 제공하지 않습니다.</p>
                <p className="text-sm">
                  단, 이용자의 동의가 있거나 법령의 규정에 의한 경우는 예외로 합니다.
                </p>
              </div>
            </section>

            {/* 5. 개인정보 처리 위탁 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">5</span>
                개인정보 처리 위탁
              </h2>
              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="text-gray-700 mb-3">서비스 제공을 위해 아래와 같이 개인정보 처리를 위탁합니다:</p>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-semibold">위탁 업체</th>
                        <th className="text-left py-2 font-semibold">위탁 업무</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600">
                      <tr className="border-b">
                        <td className="py-2">토스페이먼츠</td>
                        <td className="py-2">결제 처리</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">CJ대한통운, 한진택배 등</td>
                        <td className="py-2">배송 서비스</td>
                      </tr>
                      <tr>
                        <td className="py-2">Supabase</td>
                        <td className="py-2">클라우드 데이터 저장</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* 6. 이용자의 권리 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">6</span>
                이용자의 권리와 행사 방법
              </h2>
              <div className="bg-gray-50 rounded-2xl p-5 text-gray-700">
                <p className="mb-3">이용자는 언제든지 아래의 권리를 행사할 수 있습니다:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">✓</span>
                    <span>개인정보 열람 요청</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">✓</span>
                    <span>오류 등이 있을 경우 정정 요청</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">✓</span>
                    <span>삭제 요청</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">✓</span>
                    <span>처리 정지 요청</span>
                  </li>
                </ul>
                <p className="mt-3 text-sm text-gray-500">
                  위 권리 행사는 이메일(hello.heybadge@gmail.com)로 요청하실 수 있습니다.
                </p>
              </div>
            </section>

            {/* 7. 쿠키 사용 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">7</span>
                쿠키(Cookie) 사용
              </h2>
              <div className="bg-gray-50 rounded-2xl p-5 space-y-3 text-gray-700">
                <p>
                  회사는 이용자에게 맞춤 서비스를 제공하기 위해 쿠키를 사용합니다.
                </p>
                <p>
                  이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 
                  일부 서비스 이용에 제한이 있을 수 있습니다.
                </p>
              </div>
            </section>

            {/* 8. 개인정보 보호책임자 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">8</span>
                개인정보 보호책임자
              </h2>
              <div className="bg-primary-50 rounded-2xl p-5 border border-primary-200">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">담당자</p>
                    <p className="font-semibold text-gray-900">개인정보 보호책임자</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">이메일</p>
                    <p className="font-semibold text-gray-900">hello.heybadge@gmail.com</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">전화</p>
                    <p className="font-semibold text-gray-900">0502-1910-3343</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">운영시간</p>
                    <p className="font-semibold text-gray-900">평일 09:00 - 18:00</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 9. 개인정보처리방침 변경 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">9</span>
                개인정보처리방침 변경
              </h2>
              <div className="bg-gray-50 rounded-2xl p-5 text-gray-700">
                <p>
                  본 개인정보처리방침은 법령, 정책 또는 보안기술의 변경에 따라 
                  내용이 변경될 수 있습니다. 변경 시 웹사이트를 통해 공지합니다.
                </p>
              </div>
            </section>

            {/* 시행일 */}
            <div className="text-center text-sm text-gray-400 pt-4 border-t border-gray-100">
              본 개인정보처리방침은 2025년 1월 1일부터 시행됩니다.
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








