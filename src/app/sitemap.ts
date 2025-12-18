import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hey-badge.vercel.app'

  const routes = [
    '',
    '/order',
    '/gallery',
    '/refund',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/cart',
    '/checkout',
    '/dashboard',
    '/mypage',
  ]

  const now = new Date()

  return routes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }))
}


