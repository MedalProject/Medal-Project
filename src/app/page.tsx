'use client'

import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'

export default function Home() {
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
              AI 디자인 파일로 나만의 뱃지를 만들어 보세요.<br />
              실시간 가격 확인으로 투명한 견적을 받아보실 수 있습니다.
            </p>
            
            {/* Feature badges */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {[
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
                className="px-8 py-4 bg-gradient-to-r from-primary-500 to-blue-400 text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/40 hover:-translate-y-1 transition-all btn-glow"
              >
                지금 만들어보기 →
              </Link>
              <Link
                href="/gallery"
                className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-bold text-lg hover:border-primary-500 hover:text-primary-600 transition-all"
              >
                제작 사례 보기
              </Link>
            </div>
          </div>

          {/* Badge Preview */}
          <div className="mt-16 flex justify-center">
            <div className="relative">
              <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full metal-gold shadow-2xl flex items-center justify-center badge-float">
                <div className="text-center">
                  <div className="text-5xl sm:text-6xl mb-2">⭐</div>
                  <div className="text-sm sm:text-base font-bold text-amber-900">YOUR DESIGN</div>
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full metal-silver shadow-lg flex items-center justify-center text-2xl animate-bounce">
                ❤️
              </div>
              <div className="absolute -bottom-2 -left-6 w-14 h-14 rounded-full metal-gold shadow-lg flex items-center justify-center text-xl animate-bounce delay-300">
                🎵
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
              왜 Hey Badge인가요?
            </h2>
            <p className="text-gray-600 text-lg">
              기존 뱃지 제작의 불편함을 모두 해결했습니다
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                icon: '🎯',
                title: '1개부터 주문',
                desc: '최소 주문량 걱정 없이 1개부터 원하는 만큼만 주문하세요',
                color: 'from-primary-500/20 to-blue-400/20',
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
                color: 'from-blue-500/20 to-blue-400/20',
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

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-br from-primary-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-6">
            지금 바로 시작하세요
          </h2>
          <p className="text-primary-100 text-lg mb-10">
            회원가입 없이도 바로 디자인을 시작할 수 있습니다
          </p>
          <Link
            href="/order"
            className="inline-block px-10 py-5 bg-white text-primary-600 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            무료로 디자인 시작하기 →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 sm:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-6">
            <div>
              <div className="mb-4">
                <Image
                  src="/logo.png"
                  alt="헤이뱃지"
                  width={120}
                  height={40}
                  className="h-10 w-auto brightness-0 invert"
                />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                글로벌 기업이 선택한 뱃지 제작 서비스
              </p>
            </div>
            
            <div className="text-sm text-gray-400 space-y-2">
              <p>상호명: 바로해 | 사업자명: 바로해 | 대표자: 유윤종</p>
              <p>사업자등록번호: 447-47-01294</p>
              <p>주소: 서울특별시 성동구 광나루로 219 2층</p>
            </div>
            
            <div className="text-sm text-gray-400 space-y-2">
              <p>이메일: hello.heybadge@gmail.com</p>
              <p>전화: 010-6678-3343</p>
              <p>평일 09:00 - 18:00</p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <span>© 2025 HeyBadge. All rights reserved.</span>
            <Link href="/refund" className="hover:text-white transition-colors">
              환불규정
            </Link>
          </div>
        </div>
      </footer>
    </>
  )
}
