import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { calculatePrice, calculateShippingFee } from '@/lib/supabase'
import {
  createGoodName,
  createOrderNumber,
  getKcpEnvironment,
  getKcpPayMethod,
  isMobileUserAgent,
} from '@/lib/kcp'

type CheckoutItem = {
  paint_type: string
  metal_color: string
  size: number
  quantity: number
  design_url: string | null
  design_name: string | null
}

type ShippingInfo = {
  name: string
  phone: string
  zonecode: string
  address: string
  addressDetail: string
  memo: string
}

type RegisterRequest = {
  items: CheckoutItem[]
  shippingInfo: ShippingInfo
  paymentMethod: 'card' | 'bank'
  guestEmail?: string
  isMobile?: boolean
}

function getRequestOrigin(request: NextRequest) {
  const origin = request.headers.get('origin')
  if (origin) return origin
  const host = request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') || 'https'
  return host ? `${proto}://${host}` : ''
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RegisterRequest
    const { items, shippingInfo, paymentMethod, guestEmail, isMobile } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: '주문 항목이 없습니다.' }, { status: 400 })
    }

    if (!shippingInfo?.name || !shippingInfo?.phone || !shippingInfo?.address) {
      return NextResponse.json({ error: '배송지 정보를 입력해주세요.' }, { status: 400 })
    }

    if (!paymentMethod || !['card', 'bank'].includes(paymentMethod)) {
      return NextResponse.json({ error: '지원하지 않는 결제수단입니다.' }, { status: 400 })
    }

    if (!process.env.KCP_SITE_CD) {
      return NextResponse.json({ error: 'KCP 설정이 누락되었습니다.' }, { status: 500 })
    }

    // 디버깅: site_cd 값 확인
    console.log('KCP_SITE_CD:', process.env.KCP_SITE_CD)

    const supabase = await createServerSupabaseClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    // 이메일이 없으면 오류
    if (!user && !guestEmail) {
      return NextResponse.json({ error: '비회원 주문은 이메일이 필요합니다.' }, { status: 400 })
    }

    // 사용할 이메일 결정 (로그인 사용자 이메일 또는 비회원 이메일)
    const buyerEmail = user?.email || guestEmail

    const orderNumber = createOrderNumber()
    const totalPrice = items.reduce((sum, item) => {
      const price = calculatePrice(item.paint_type, item.size, item.quantity)
      return sum + price.total
    }, 0)
    const shippingFee = calculateShippingFee(totalPrice)
    const paymentAmount = totalPrice + shippingFee

    const ordersToInsert = items.map((item) => {
      const price = calculatePrice(item.paint_type, item.size, item.quantity)
      return {
        user_id: user ? user.id : null,
        guest_email: user ? null : guestEmail || null,
        order_number: orderNumber,
        paint_type: item.paint_type,
        metal_color: item.metal_color,
        size: item.size,
        quantity: item.quantity,
        design_url: item.design_url,
        design_name: item.design_name,
        unit_price: price.unitPrice,
        discount_amount: price.discount,
        total_price: price.total,
        status: 'pending',
        shipping_name: shippingInfo.name,
        shipping_phone: shippingInfo.phone,
        shipping_zonecode: shippingInfo.zonecode,
        shipping_address: shippingInfo.address,
        shipping_address_detail: shippingInfo.addressDetail,
        shipping_memo: shippingInfo.memo,
        payment_method: paymentMethod,
      }
    })

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: insertError } = await supabaseAdmin.from('orders').insert(ordersToInsert)
    if (insertError) {
      console.error('Order insert error:', insertError)
      return NextResponse.json({ error: '주문 저장에 실패했습니다.' }, { status: 500 })
    }

    const { error: paymentError } = await supabaseAdmin.from('order_payments').insert({
      order_number: orderNumber,
      amount: paymentAmount,
      shipping_fee: shippingFee,
      payment_method: paymentMethod,
      is_mobile: Boolean(isMobile),
      buyer_email: buyerEmail || null,
      buyer_name: shippingInfo.name,
      buyer_phone: shippingInfo.phone,
    })

    if (paymentError) {
      console.error('Payment insert error:', paymentError)
      return NextResponse.json({ error: '결제 정보 저장에 실패했습니다.' }, { status: 500 })
    }

    const env = getKcpEnvironment()
    const payMethod = getKcpPayMethod(paymentMethod)
    const goodName = createGoodName(items.length)
    const origin = getRequestOrigin(request)
    const retUrl = `${origin}/api/kcp/approve`

    const mobileDetected = typeof isMobile === 'boolean'
      ? isMobile
      : isMobileUserAgent(request.headers.get('user-agent'))

    if (mobileDetected) {
      const registerResponse = await fetch(env.registerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_cd: process.env.KCP_SITE_CD,
          ordr_idxx: orderNumber,
          good_mny: String(paymentAmount),
          good_name: goodName,
          pay_method: payMethod.mobile,
          Ret_URL: retUrl,
        }),
      })

      const registerData = await registerResponse.json()
      if (!registerResponse.ok || registerData?.Code !== '0000') {
        console.error('KCP register error:', registerData)
        return NextResponse.json({ error: '거래등록에 실패했습니다.' }, { status: 500 })
      }

      return NextResponse.json({
        flow: 'mobile',
        orderNumber,
        amount: paymentAmount,
        siteCd: process.env.KCP_SITE_CD,
        goodName,
        payMethod: payMethod.mobile,
        approvalKey: registerData.approvalKey,
        payUrl: registerData.PayUrl,
        retUrl,
      })
    }

    return NextResponse.json({
      flow: 'pc',
      orderNumber,
      amount: paymentAmount,
      siteCd: process.env.KCP_SITE_CD,
      goodName,
      payMethod: payMethod.pc,
      retUrl,
      pcScriptUrl: env.pcScriptUrl,
    })
  } catch (error) {
    console.error('KCP register error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
