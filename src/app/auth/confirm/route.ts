import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = next
  redirectTo.searchParams.delete('token_hash')
  redirectTo.searchParams.delete('type')
  redirectTo.searchParams.delete('next')

  let errorMessage = 'missing_token_or_type'

  if (token_hash && type) {
    const cookieStore = await cookies()
    
    // 쿠키들을 저장할 배열
    const cookiesToSetLater: { name: string; value: string; options: CookieOptions }[] = []
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            // 나중에 response에 설정하기 위해 저장
            cookiesToSetLater.push(...cookiesToSet)
            // 동시에 cookieStore에도 설정 시도
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                cookieStore.set(name, value, options)
              } catch {
                // Route Handler에서는 실패할 수 있음 - 무시
              }
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      // 성공 시 redirect response 생성
      const response = NextResponse.redirect(redirectTo)
      
      // 저장된 쿠키들을 response에 명시적으로 설정
      cookiesToSetLater.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, {
          ...options,
          // 중요: httpOnly와 secure 설정
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        })
      })
      
      return response
    }

    console.error('OTP verification error:', error)
    errorMessage = error.message || 'verification_failed'
  }

  // 에러 시 에러 메시지와 함께 reset-password로 리디렉션
  redirectTo.pathname = '/reset-password'
  redirectTo.searchParams.set('error', encodeURIComponent(errorMessage))
  return NextResponse.redirect(redirectTo)
}








