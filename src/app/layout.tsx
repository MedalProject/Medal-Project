import type { Metadata } from 'next'
import { Suspense } from 'react'
import './globals.css'
import KakaoChat from '@/components/KakaoChat'
import AuthCodeRedirect from '@/components/AuthCodeRedirect'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://hey-badge.vercel.app'),
  title: {
    default: 'Hey Badge - 1개부터 나만의 뱃지 제작',
    template: '%s | Hey Badge',
  },
  description: '사진 한 장으로 나만의 뱃지를 만들어 보세요. 실시간 3D 미리보기, 투명한 가격, 20일 이내 발송',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    siteName: 'Hey Badge',
    title: 'Hey Badge - 1개부터 나만의 뱃지 제작',
    description: '사진 한 장으로 나만의 뱃지를 만들어 보세요. 실시간 3D 미리보기, 투명한 가격, 20일 이내 발송',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Hey Badge',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hey Badge - 1개부터 나만의 뱃지 제작',
    description: '사진 한 장으로 나만의 뱃지를 만들어 보세요. 실시간 3D 미리보기, 투명한 가격, 20일 이내 발송',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  verification: {
    other: {
      // 네이버 서치어드바이저 사이트 소유확인
      'naver-site-verification': 'b83b276d7f9155f28866f50bca655c91a606bf9c',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 min-h-screen">
        {/* useSearchParams() 사용으로 인해 Suspense 필수 */}
        <Suspense fallback={null}>
          <AuthCodeRedirect />
        </Suspense>
        {children}
        <KakaoChat />
      </body>
    </html>
  )
}
