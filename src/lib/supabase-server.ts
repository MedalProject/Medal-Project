import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

type SupabaseCookie = {
  name: string
  value: string
  options?: {
    maxAge?: number
    expires?: number | Date
    path?: string
    domain?: string
    sameSite?: 'lax' | 'strict' | 'none'
    secure?: boolean
    httpOnly?: boolean
  }
}

export function createServerSupabaseClient(request?: NextRequest) {
  const cookieStore = cookies()
  const accessToken = request?.headers.get('authorization')

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: SupabaseCookie[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
      global: {
        headers: {
          Authorization: accessToken ?? '',
        },
      },
    }
  )
}

