'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import KakaoChat from '@/components/KakaoChat'

export default function Home() {
  const [showFloatingCTA, setShowFloatingCTA] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  // FAQ 데이터
  const faqData = [
    {
      icon: '📦',
      question: '배송 기간은 얼마나 걸리나요?',
      answer: '주문 확정 후 20일 이내에 발송됩니다. 국내 자체 제작으로 빠르고 안전하게 배송해드려요.',
    },
    {
      icon: '📁',
      question: '어떤 파일 형식을 지원하나요?',
      answer: 'Adobe Illustrator(.ai) 파일을 권장합니다. 벡터 형식이어야 고품질 메달 제작이 가능해요.',
    },
    {
      icon: '🔢',
      question: '최소 주문 수량은?',
      answer: '1개부터 주문 가능합니다! 소량 주문도 부담 없이 진행하실 수 있어요.',
    },
  ]

  useEffect(() => {
    const handleScroll = () => {
      // Hero 섹션 높이(약 600px) 이후에 플로팅 버튼 표시
      setShowFloatingCTA(window.scrollY > 600)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              디자인을<br />
              <span className="gradient-text">현실로</span> 만드세요
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              AI 디자인 파일로 나만의 메달을 만들어 보세요.<br />
              실시간 가격 확인으로 투명한 견적을 받아보실 수 있습니다.
            </p>
            
            {/* Feature badges */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {[
                { icon: '✓', text: '비회원 주문 가능' },
                { icon: '✓', text: '최소 1개부터 주문' },
                { icon: '✓', text: '실시간 가격 확인' },
                { icon: '✓', text: '20일 이내 발송' },
              ].map((badge, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 shadow-md"
                >
                  <span className="text-green-500">{badge.icon}</span>
                  {badge.text}
                </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/order"
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-white rounded-2xl font-bold text-lg shadow-xl shadow-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/40 hover:-translate-y-1 transition-all btn-glow"
              >
                지금 만들어보기 →
              </Link>
              <Link
                href="/gallery"
                className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-bold text-lg hover:border-amber-500 hover:text-amber-600 transition-all"
              >
                제작 사례 보기
              </Link>
            </div>
          </div>

          {/* Badge Preview */}
          <div className="mt-16 flex justify-center">
            <div className="relative">
              {/* 메인 메달 이미지 - 배경 투명 효과 */}
              <div className="relative w-80 h-52 sm:w-[450px] sm:h-72 lg:w-[550px] lg:h-80 badge-float">
                <Image
                  src="/hero/hero_medal.png"
                  alt="메달프로젝트 실제 제작 사례"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              왜 메달프로젝트인가요?
            </h2>
            <p className="text-gray-600 text-lg">
              기존 메달 제작의 불편함을 모두 해결했습니다
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                icon: '🎯',
                title: '1개부터 주문',
                desc: '최소 주문량 걱정 없이 1개부터 원하는 만큼만 주문하세요',
                color: 'from-amber-500/20 to-yellow-400/20',
              },
              {
                icon: '💰',
                title: '투명한 가격',
                desc: '숨겨진 비용 없이 실시간으로 정확한 가격을 확인하세요',
                color: 'from-amber-500/20 to-orange-500/20',
              },
              {
                icon: '🎨',
                title: '간편한 주문',
                desc: 'AI 파일만 업로드하면 간편하게 주문할 수 있습니다',
                color: 'from-green-500/20 to-emerald-500/20',
              },
              {
                icon: '⚡',
                title: '20일 이내 발송',
                desc: '국내 제작으로 빠르고 안전하게 받아보세요',
                color: 'from-yellow-500/20 to-amber-400/20',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 sm:p-8 rounded-3xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 card-hover"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-3xl mb-5`}>
                  {feature.icon}
                </div>
                <h3 className="font-bold text-xl mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              이렇게 진행됩니다
            </h2>
            <p className="text-gray-600 text-lg">
              간단한 4단계로 나만의 메달을 완성하세요
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                icon: '📤',
                title: '디자인 업로드',
                desc: 'AI 파일을 업로드하면 바로 미리보기가 가능해요',
                color: 'from-amber-500 to-yellow-500',
              },
              {
                step: '02',
                icon: '🎨',
                title: '옵션 선택',
                desc: '칠 종류, 도금 색상, 크기를 선택하세요',
                color: 'from-purple-500 to-pink-500',
              },
              {
                step: '03',
                icon: '💳',
                title: '주문 & 결제',
                desc: '실시간 견적 확인 후 간편하게 결제하세요',
                color: 'from-amber-500 to-orange-500',
              },
              {
                step: '04',
                icon: '📦',
                title: '제작 & 배송',
                desc: '국내 제작으로 20일 이내 안전하게 배송해요',
                color: 'from-green-500 to-emerald-500',
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                {/* 연결선 (마지막 아이템 제외) */}
                {i < 3 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-gray-300 to-transparent" />
                )}
                
                <div className="relative bg-white rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                  {/* 단계 번호 */}
                  <div className={`absolute -top-4 -left-2 w-10 h-10 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                    {item.step}
                  </div>
                  
                  {/* 아이콘 */}
                  <div className="text-4xl mb-4 mt-2">{item.icon}</div>
                  
                  {/* 콘텐츠 */}
                  <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 추가 안내 */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-amber-50 rounded-full">
              <span className="text-amber-700 font-medium">💡 회원가입 없이도 바로 주문 가능해요!</span>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section - 무한 슬라이드 */}
      <section className="py-16 sm:py-24 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-12">
          <div className="text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              고객님들의 생생한 후기
            </h2>
            <p className="text-gray-600 text-lg">
              실제 주문하신 분들의 이야기를 들어보세요
            </p>
          </div>
        </div>

        {/* 무한 슬라이드 - 첫 번째 줄 (우→좌) */}
        <div className="relative mb-6">
          <div className="flex animate-scroll-left">
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex gap-6 pr-6">
                {[
                  { name: '김**', company: '스타트업 대표', rating: 5, text: '직원들 선물용으로 주문했는데 퀄리티가 정말 좋아요! 재주문 예정입니다.', badge: '금도금 30mm' },
                  { name: '이**', company: '마케팅 담당자', rating: 5, text: '행사용 메달 500개 주문했는데 배송도 빠르고 품질도 만족스러워요.', badge: '에폭시 40mm' },
                  { name: '박**', company: '동아리 회장', rating: 5, text: '동아리 메달 제작했어요. 가격도 합리적이고 결과물이 예뻐서 회원들 반응이 좋아요!', badge: '은도금 30mm' },
                  { name: '최**', company: '기업 HR팀', rating: 5, text: '신입사원 웰컴키트에 들어갈 메달로 주문했습니다. 디테일이 살아있어요.', badge: '금도금 50mm' },
                  { name: '정**', company: '팬클럽 운영자', rating: 5, text: '팬클럽 공식 메달로 제작했는데 회원들이 너무 좋아해요! 추가 주문 진행 중입니다.', badge: '에폭시 30mm' },
                ].map((review, i) => (
                  <div
                    key={`${setIndex}-${i}`}
                    className="flex-shrink-0 w-80 bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(review.rating)].map((_, j) => (
                        <span key={j} className="text-amber-400">⭐</span>
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4 leading-relaxed">"{review.text}"</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{review.name}</p>
                        <p className="text-sm text-gray-500">{review.company}</p>
                      </div>
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                        {review.badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* 무한 슬라이드 - 두 번째 줄 (좌→우) */}
        <div className="relative">
          <div className="flex animate-scroll-right">
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex gap-6 pr-6">
                {[
                  { name: '강**', company: '학교 선생님', rating: 5, text: '졸업 기념 메달로 주문했어요. 학생들이 정말 좋아합니다!', badge: '금도금 40mm' },
                  { name: '윤**', company: '카페 사장님', rating: 5, text: '직원 명찰 겸 메달로 사용 중이에요. 고급스러워서 손님들도 좋아해요.', badge: '은도금 30mm' },
                  { name: '송**', company: '게임 개발사', rating: 5, text: '게임 출시 기념 굿즈로 제작했는데 유저들 반응이 폭발적이에요!', badge: '에폭시 50mm' },
                  { name: '한**', company: '비영리단체', rating: 5, text: '봉사자 감사 메달로 제작했습니다. 의미있는 선물이 되었어요.', badge: '금도금 30mm' },
                  { name: '오**', company: '이벤트 기획사', rating: 5, text: '대규모 행사 기념품으로 1000개 주문했는데 납기도 잘 맞춰주셨어요.', badge: '에폭시 40mm' },
                ].map((review, i) => (
                  <div
                    key={`${setIndex}-${i}`}
                    className="flex-shrink-0 w-80 bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(review.rating)].map((_, j) => (
                        <span key={j} className="text-amber-400">⭐</span>
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4 leading-relaxed">"{review.text}"</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{review.name}</p>
                        <p className="text-sm text-gray-500">{review.company}</p>
                      </div>
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                        {review.badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              자주 묻는 질문
            </h2>
            <p className="text-gray-600 text-lg">
              궁금한 점이 있으신가요?
            </p>
          </div>

          {/* PC: 그리드 카드 (lg 이상에서만 표시) */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-6">
            {faqData.map((faq, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors"
              >
                <div className="text-3xl mb-4">{faq.icon}</div>
                <h3 className="font-bold text-lg mb-3 text-gray-900">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          {/* 모바일: 아코디언 (lg 미만에서만 표시) */}
          <div className="lg:hidden space-y-3">
            {faqData.map((faq, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{faq.icon}</span>
                    <span className="font-semibold text-gray-900">{faq.question}</span>
                  </div>
                  <span
                    className={`text-gray-400 transition-transform duration-200 ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                  >
                    ▼
                  </span>
                </button>
                <div
                  className={`px-6 overflow-hidden transition-all duration-200 ${
                    openFaq === i ? 'pb-5 max-h-40' : 'max-h-0'
                  }`}
                >
                  <p className="text-gray-600 leading-relaxed pl-9">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 추가 문의 안내 */}
          <div className="mt-10 text-center">
            <p className="text-gray-500 text-sm">
              더 궁금한 점이 있으신가요?{' '}
              <a
                href="mailto:hello.medalproject@gmail.com"
                className="text-amber-600 font-medium hover:underline"
              >
                hello.medalproject@gmail.com
              </a>
              으로 문의해주세요!
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-br from-amber-500 to-yellow-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-6">
            지금 바로 시작하세요
          </h2>
          <p className="text-amber-100 text-lg mb-10">
            회원가입 없이도 바로 디자인을 시작할 수 있습니다
          </p>
          <Link
            href="/order"
            className="inline-block px-10 py-5 bg-white text-amber-600 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            나만의 메달 만들기 →
          </Link>
        </div>
      </section>

      {/* KakaoTalk Chat Button */}
      <KakaoChat />

      {/* Mobile Floating CTA */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden transition-all duration-300 ${
          showFloatingCTA 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-full opacity-0'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
          <Link
            href="/order"
            className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-white rounded-xl font-bold text-lg shadow-lg shadow-amber-500/30 active:scale-[0.98] transition-transform"
          >
            <span>⚡</span>
            <span>지금 만들어보기</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 sm:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-6">
            <div>
              <div className="mb-4">
                <span className="font-display text-2xl font-extrabold tracking-tight">
                  <span className="text-amber-400">Medal</span>
                  <span className="text-white"> Project</span>
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                글로벌 기업이 선택한 메달 제작 서비스
              </p>
            </div>
            
            <div className="text-sm text-gray-400 space-y-2">
              <p>상호명: 바로해 | 사업자명: 바로해 | 대표자: 유윤종</p>
              <p>사업자등록번호: 447-47-01294</p>
              <p>통신판매업신고번호: 2025-서울성동-0014</p>
              <p>주소: 서울특별시 성동구 광나루로 219 2층</p>
            </div>
            
            <div className="text-sm text-gray-400 space-y-2">
              <p>이메일: hello.medalproject@gmail.com</p>
              <p>전화: 0502-1910-3343</p>
              <p>평일 09:00 - 18:00</p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <span>© 2026 Medal Project. All rights reserved.</span>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <Link href="/order-lookup" className="hover:text-white transition-colors">
                주문조회
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                이용약관
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                개인정보처리방침
              </Link>
              <Link href="/refund" className="hover:text-white transition-colors">
                환불규정
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
