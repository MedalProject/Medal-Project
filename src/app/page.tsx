'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import KakaoChat from '@/components/KakaoChat'

export default function Home() {
  const [showFloatingCTA, setShowFloatingCTA] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

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
    {
      icon: '💳',
      question: '결제는 어떻게 하나요?',
      answer: '신용카드 결제를 지원합니다. 견적서 다운로드 후 계좌이체도 가능해요.',
    },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingCTA(window.scrollY > 600)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="pt-28 sm:pt-36 pb-20 sm:pb-32 px-4 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50/60 via-transparent to-transparent" />
        
        <div className="max-w-4xl mx-auto relative text-center">
          <p className="text-amber-700 font-semibold text-sm tracking-widest uppercase mb-6">
            Premium Medal Manufacturing
          </p>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-8 text-gray-900">
            당신의 디자인을<br />
            <span className="text-amber-600">메달</span>로 만들어 드립니다
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
            실시간으로 가격을 확인하고 바로 주문하세요.<br className="hidden sm:block" />
            1개부터 주문 가능하며, 20일 이내에 발송됩니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/order"
              className="group px-10 py-5 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20 hover:-translate-y-0.5 text-center"
            >
              <span className="block">디자인 파일이 있어요</span>
              <span className="block text-sm font-medium text-gray-400 group-hover:text-gray-300 mt-1">바로 제작하기 →</span>
            </Link>
            <Link
              href="/design-request"
              className="group px-10 py-5 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-bold text-lg hover:border-amber-400 hover:text-gray-900 transition-all text-center"
            >
              <span className="block">디자인 파일이 없어요</span>
              <span className="block text-sm font-medium text-amber-600 mt-1">견적 의뢰하기 →</span>
            </Link>
          </div>

          {/* 메달 이미지 */}
          <div className="flex justify-center">
            <div className="relative w-[500px] h-[300px] sm:w-[600px] sm:h-[350px] badge-float">
              <Image
                src="/hero/hero_medal.png"
                alt="메달프로젝트 제작 예시"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* 핵심 포인트 */}
          <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-gray-400">
            {['비회원 주문 가능', '실시간 가격 확인', '국내 자체 제작', '20일 이내 발송'].map((text, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="w-1 h-1 bg-amber-500 rounded-full" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-28 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amber-700 font-semibold text-sm tracking-widest uppercase mb-3">
              Why Medal Project
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900">
              기존 메달 제작의 불편함을<br className="sm:hidden" /> 모두 해결했습니다
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '🎯',
                title: '1개부터 주문',
                desc: '최소 주문량 걱정 없이 1개부터 원하는 만큼만',
              },
              {
                icon: '💰',
                title: '투명한 가격',
                desc: '숨겨진 비용 없이 실시간으로 정확한 가격 확인',
              },
              {
                icon: '🎨',
                title: '간편한 주문',
                desc: 'AI 파일만 업로드하면 바로 주문 가능',
              },
              {
                icon: '⚡',
                title: '20일 이내 발송',
                desc: '국내 제작으로 빠르고 안전하게 배송',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-7 rounded-2xl bg-white border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 sm:py-28 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amber-700 font-semibold text-sm tracking-widest uppercase mb-3">
              How It Works
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900">
              간단한 4단계로 완성됩니다
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', icon: '📤', title: '디자인 업로드', desc: 'AI 파일을 업로드하면 바로 미리보기가 가능합니다' },
              { step: '02', icon: '🎨', title: '옵션 선택', desc: '칠 종류, 도금 색상, 크기를 선택하세요' },
              { step: '03', icon: '💳', title: '주문 & 결제', desc: '실시간 견적 확인 후 간편하게 결제하세요' },
              { step: '04', icon: '📦', title: '제작 & 배송', desc: '국내 제작으로 20일 이내 안전하게 배송' },
            ].map((item, i) => (
              <div key={i} className="relative">
                {i < 3 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-px bg-gray-200" />
                )}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm mb-5">
                    {item.step}
                  </div>
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 sm:py-28 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-14">
          <div className="text-center">
            <p className="text-amber-700 font-semibold text-sm tracking-widest uppercase mb-3">
              Reviews
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900">
              고객님들의 생생한 후기
            </h2>
          </div>
        </div>

        {/* 무한 슬라이드 - 첫 번째 줄 */}
        <div className="relative mb-5">
          <div className="flex animate-scroll-left">
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex gap-5 pr-5">
                {[
                  { name: '김**', company: '스타트업 대표', text: '직원들 선물용으로 주문했는데 퀄리티가 정말 좋아요! 재주문 예정입니다.', badge: '금도금 30mm' },
                  { name: '이**', company: '마케팅 담당자', text: '행사용 메달 500개 주문했는데 배송도 빠르고 품질도 만족스러워요.', badge: '에폭시 40mm' },
                  { name: '박**', company: '동아리 회장', text: '동아리 메달 제작했어요. 가격도 합리적이고 결과물이 예뻐서 회원들 반응이 좋아요!', badge: '은도금 30mm' },
                  { name: '최**', company: '기업 HR팀', text: '신입사원 웰컴키트에 들어갈 메달로 주문했습니다. 디테일이 살아있어요.', badge: '금도금 50mm' },
                  { name: '정**', company: '팬클럽 운영자', text: '팬클럽 공식 메달로 제작했는데 회원들이 너무 좋아해요!', badge: '에폭시 30mm' },
                ].map((review, i) => (
                  <div
                    key={`${setIndex}-${i}`}
                    className="flex-shrink-0 w-80 bg-white rounded-2xl p-6 border border-gray-100"
                  >
                    <p className="text-gray-700 mb-5 leading-relaxed">"{review.text}"</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{review.name}</p>
                        <p className="text-xs text-gray-400">{review.company}</p>
                      </div>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        {review.badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* 무한 슬라이드 - 두 번째 줄 */}
        <div className="relative">
          <div className="flex animate-scroll-right">
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex gap-5 pr-5">
                {[
                  { name: '강**', company: '학교 선생님', text: '졸업 기념 메달로 주문했어요. 학생들이 정말 좋아합니다!', badge: '금도금 40mm' },
                  { name: '윤**', company: '카페 사장님', text: '직원 명찰 겸 메달로 사용 중이에요. 고급스러워서 손님들도 좋아해요.', badge: '은도금 30mm' },
                  { name: '송**', company: '게임 개발사', text: '게임 출시 기념 굿즈로 제작했는데 유저들 반응이 폭발적이에요!', badge: '에폭시 50mm' },
                  { name: '한**', company: '비영리단체', text: '봉사자 감사 메달로 제작했습니다. 의미있는 선물이 되었어요.', badge: '금도금 30mm' },
                  { name: '오**', company: '이벤트 기획사', text: '대규모 행사 기념품으로 1000개 주문했는데 납기도 잘 맞춰주셨어요.', badge: '에폭시 40mm' },
                ].map((review, i) => (
                  <div
                    key={`${setIndex}-${i}`}
                    className="flex-shrink-0 w-80 bg-white rounded-2xl p-6 border border-gray-100"
                  >
                    <p className="text-gray-700 mb-5 leading-relaxed">"{review.text}"</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{review.name}</p>
                        <p className="text-xs text-gray-400">{review.company}</p>
                      </div>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
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

      {/* 신뢰 지표 */}
      <section className="py-16 sm:py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12">
            {[
              { number: '500+', label: '기업 고객' },
              { number: '50,000+', label: '누적 제작' },
              { number: '99%', label: '고객 만족도' },
              { number: '20일', label: '이내 발송' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-1">{stat.number}</p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 sm:py-28 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-amber-700 font-semibold text-sm tracking-widest uppercase mb-3">
              FAQ
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900">
              자주 묻는 질문
            </h2>
          </div>

          <div className="space-y-3">
            {faqData.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xl">{faq.icon}</span>
                    <span className="font-semibold text-gray-900">{faq.question}</span>
                  </div>
                  <span
                    className={`text-gray-300 transition-transform duration-200 text-sm ${
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
                  <p className="text-gray-500 leading-relaxed pl-10">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-gray-400 text-sm">
              더 궁금한 점이 있으신가요?{' '}
              <a
                href="mailto:hello.medalproject@gmail.com"
                className="text-amber-700 font-medium hover:underline"
              >
                hello.medalproject@gmail.com
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section - 다크 배경 */}
      <section className="py-20 sm:py-28 px-4 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-amber-500 font-semibold text-sm tracking-widest uppercase mb-4">
            Get Started
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-6">
            지금 바로 시작하세요
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            디자인이 있어도, 없어도 괜찮습니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/order"
              className="inline-block px-10 py-4 bg-white text-gray-900 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-lg hover:-translate-y-0.5"
            >
              바로 제작하기 →
            </Link>
            <Link
              href="/design-request"
              className="inline-block px-10 py-4 bg-transparent border-2 border-gray-600 text-white rounded-full font-bold text-lg hover:border-amber-500 hover:text-amber-400 transition-all"
            >
              견적 의뢰하기 →
            </Link>
          </div>
        </div>
      </section>

      <KakaoChat />

      {/* Mobile Floating CTA */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden transition-all duration-300 ${
          showFloatingCTA 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-full opacity-0'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <Link
            href="/order"
            className="flex items-center justify-center gap-2 w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg active:scale-[0.98] transition-transform"
          >
            바로 제작하기 →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-950 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-8">
            <div>
              <div className="mb-4">
                <span className="font-display text-2xl font-extrabold tracking-tight">
                  <span className="text-amber-500">Medal</span>
                  <span className="text-white"> Project</span>
                </span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                디자인을 메달로 만들어 드립니다
              </p>
            </div>
            
            <div className="text-sm text-gray-500 space-y-1.5">
              <p>상호명: 바로해 | 대표자: 유윤종</p>
              <p>사업자등록번호: 447-47-01294</p>
              <p>통신판매업신고번호: 2025-서울성동-0014</p>
              <p>서울특별시 성동구 광나루로 219 2층</p>
            </div>
            
            <div className="text-sm text-gray-500 space-y-1.5">
              <p>hello.medalproject@gmail.com</p>
              <p>0502-1910-3343</p>
              <p>평일 09:00 - 18:00</p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <span>© 2026 Medal Project</span>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/order-lookup" className="hover:text-gray-400 transition-colors">주문조회</Link>
              <Link href="/terms" className="hover:text-gray-400 transition-colors">이용약관</Link>
              <Link href="/privacy" className="hover:text-gray-400 transition-colors">개인정보처리방침</Link>
              <Link href="/refund" className="hover:text-gray-400 transition-colors">환불규정</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
