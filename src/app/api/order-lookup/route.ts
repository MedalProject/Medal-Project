import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

// 주문 조회 API (비회원 주문 조회용)
export async function POST(request: NextRequest) {
  try {
    const { orderNumber, email } = await request.json()

    // 입력값 검증
    if (!orderNumber || !email) {
      return NextResponse.json(
        { error: '주문번호와 이메일을 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식이 아닙니다.' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient(request)

    // 현재 로그인한 사용자 확인
    const { data: { user } } = await supabase.auth.getUser()

    // 주문 조회 조건 설정
    // 1. 회원 주문: user_id와 order_number로 조회
    // 2. 비회원 주문: guest_email과 order_number로 조회
    let query = supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)

    // 로그인한 사용자인 경우 user_id로도 조회 가능
    if (user) {
      // 회원 주문 또는 같은 이메일의 비회원 주문 조회
      query = query.or(`user_id.eq.${user.id},guest_email.eq.${email}`)
    } else {
      // 비로그인: guest_email로만 조회
      query = query.eq('guest_email', email)
    }

    const { data: orders, error } = await query

    if (error) {
      console.error('Order lookup error:', error)
      return NextResponse.json(
        { error: '주문 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { error: '주문을 찾을 수 없습니다. 주문번호와 이메일을 확인해주세요.' },
        { status: 404 }
      )
    }

    // 주문 정보 반환 (민감 정보 제외)
    const safeOrders = orders.map(order => ({
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      paint_type: order.paint_type,
      metal_color: order.metal_color,
      size: order.size,
      quantity: order.quantity,
      design_name: order.design_name,
      unit_price: order.unit_price,
      discount_amount: order.discount_amount,
      total_price: order.total_price,
      shipping_name: order.shipping_name,
      shipping_address: order.shipping_address,
      payment_method: order.payment_method,
      created_at: order.created_at,
      paid_at: order.paid_at,
      shipped_at: order.shipped_at,
      completed_at: order.completed_at,
    }))

    return NextResponse.json({ orders: safeOrders })

  } catch (error) {
    console.error('Order lookup API error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

