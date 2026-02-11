import type { Metadata } from 'next'
import { Suspense } from 'react'
import './globals.css'
import KakaoChat from '@/components/KakaoChat'
import AuthCodeRedirect from '@/components/AuthCodeRedirect'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://medal-project.vercel.app'),
  title: {
    default: '메달프로젝트 - 1개부터 나만의 메달 제작',
    template: '%s | 메달프로젝트',
  },
  description: '디자인 파일로 나만의 메달을 만들어 보세요. 실시간 가격 확인, 투명한 견적, 20일 이내 발송',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    siteName: '메달프로젝트',
    title: '메달프로젝트 - 1개부터 나만의 메달 제작',
    description: '디자인 파일로 나만의 메달을 만들어 보세요. 실시간 가격 확인, 투명한 견적, 20일 이내 발송',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: '메달프로젝트',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '메달프로젝트 - 1개부터 나만의 메달 제작',
    description: '디자인 파일로 나만의 메달을 만들어 보세요. 실시간 가격 확인, 투명한 견적, 20일 이내 발송',
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
  // TODO: 새 네이버 서치어드바이저/구글 서치콘솔 등록 후 verification 추가
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Google 검색 결과에 사이트 이름 표시를 위한 구조화된 데이터
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "메달프로젝트",
    "alternateName": ["Medal Project", "메달 프로젝트"],
    "url": process.env.NEXT_PUBLIC_SITE_URL || "https://medal-project.vercel.app"
  }

  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
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
