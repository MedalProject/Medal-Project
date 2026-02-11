'use client'

// TODO: 메달프로젝트 카카오톡 채널 생성 후 채널 ID 입력
// 예: @medalproject 또는 _xkxkxk 형태의 ID
const KAKAO_CHANNEL_ID = '' // 채널 ID 미설정 시 버튼 숨김

export default function KakaoChat() {
  // 채널 ID가 없으면 렌더링하지 않음
  if (!KAKAO_CHANNEL_ID) return null

  const handleClick = () => {
    // 카카오톡 채널 채팅 URL
    window.open(`https://pf.kakao.com/${KAKAO_CHANNEL_ID}/chat`, '_blank')
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-50 w-14 h-14 bg-[#FEE500] rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
      aria-label="카카오톡 상담"
    >
      {/* 카카오톡 아이콘 */}
      <svg 
        viewBox="0 0 24 24" 
        className="w-8 h-8"
        fill="#3C1E1E"
      >
        <path d="M12 3C6.477 3 2 6.463 2 10.714c0 2.683 1.786 5.037 4.465 6.394-.197.728-.712 2.636-.815 3.043-.129.511.188.503.395.366.163-.107 2.593-1.756 3.645-2.47.752.112 1.528.167 2.31.167 5.523 0 10-3.463 10-7.5S17.523 3 12 3z"/>
      </svg>
      
      {/* 호버 시 말풍선 */}
      <span className="absolute right-16 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        카카오톡 상담
      </span>
    </button>
  )
}
