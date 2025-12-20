import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hey-badge.vercel.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',        // API 엔드포인트는 크롤링 제외
          '/dashboard/',  // 개인 대시보드 제외
          '/mypage/',     // 마이페이지 제외
          '/checkout/',   // 결제 페이지 제외
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
