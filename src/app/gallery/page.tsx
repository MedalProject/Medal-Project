'use client'

import Header from '@/components/Header'

const galleryItems = [
  {
    id: 1,
    title: '스타트업 팀 뱃지',
    description: '팀 아이덴티티를 담은 커스텀 에나멜 뱃지',
    type: '소프트 에나멜',
    color: '금도금',
    image: '🚀',
    gradient: 'from-blue-300 to-blue-500',
  },
  {
    id: 2,
    title: '카페 브랜드 뱃지',
    description: '매장 직원용 프리미엄 명찰 뱃지',
    type: '하드 에나멜',
    color: '은도금',
    image: '☕',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    id: 3,
    title: '게임 길드 뱃지',
    description: '길드원 소속감을 위한 한정판 뱃지',
    type: '소프트 에나멜',
    color: '흑니켈',
    image: '⚔️',
    gradient: 'from-slate-600 to-slate-800',
  },
  {
    id: 4,
    title: '대학 동아리 뱃지',
    description: '신입 환영용 기념 뱃지',
    type: '프린트 뱃지',
    color: '금도금',
    image: '🎓',
    gradient: 'from-blue-400 to-blue-400',
  },
  {
    id: 5,
    title: '펫샵 직원 뱃지',
    description: '귀여운 강아지 캐릭터 뱃지',
    type: '아크릴 뱃지',
    color: '투명',
    image: '🐕',
    gradient: 'from-green-400 to-emerald-500',
  },
  {
    id: 6,
    title: '음악 페스티벌 뱃지',
    description: '참가자 한정 기념 뱃지',
    type: '하드 에나멜',
    color: '로즈골드',
    image: '🎵',
    gradient: 'from-rose-400 to-blue-500',
  },
  {
    id: 7,
    title: 'IT 컨퍼런스 뱃지',
    description: '개발자 행사 스피커 뱃지',
    type: '소프트 에나멜',
    color: '은도금',
    image: '💻',
    gradient: 'from-indigo-400 to-blue-400',
  },
  {
    id: 8,
    title: '자전거 동호회 뱃지',
    description: '완주 기념 메달형 뱃지',
    type: '하드 에나멜',
    color: '금도금',
    image: '🚴',
    gradient: 'from-yellow-400 to-amber-500',
  },
]

export default function GalleryPage() {
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

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                {/* Image Area */}
                <div className={`aspect-square bg-gradient-to-br ${item.gradient} flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-20 bg-white/10" />
                  <span className="text-8xl group-hover:scale-110 transition-transform duration-300">
                    {item.image}
                  </span>
                </div>
                
                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm mb-4">{item.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                      {item.type}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                      {item.color}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

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
    </>
  )
}

