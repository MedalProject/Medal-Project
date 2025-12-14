import type { Metadata } from 'next'
import './globals.css'
import KakaoChat from '@/components/KakaoChat'

export const metadata: Metadata = {
  title: 'Hey Badge - 1개부터 나만의 뱃지 제작',
  description: '사진 한 장으로 나만의 뱃지를 만들어 보세요. 실시간 3D 미리보기, 투명한 가격, 20일 이내 발송',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 min-h-screen">
        {children}
        <KakaoChat />
      </body>
    </html>
  )
}
