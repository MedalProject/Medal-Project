import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  getKcpEnvironment,
  getKcpPayType,
  normalizeMultilineEnv,
} from '@/lib/kcp'

type ApprovePayload = {
  orderNumber: string
  enc_data: string
  enc_info: string
  tran_cd?: string
}

function isJsonRequest(request: NextRequest): boolean {
  const contentType = request.headers.get('content-type') || ''
  return contentType.includes('application/json')
}

function buildRedirectUrl(origin: string, orderNumber: string, email?: string | null) {
  const query = new URLSearchParams({ orderNumber })
  if (email) query.set('email', email)
  return `${origin}/checkout/complete?${query.toString()}`
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin') || ''
  try {
    let payload: ApprovePayload

    if (isJsonRequest(request)) {
      payload = (await request.json()) as ApprovePayload
    } else {
      const formData = await request.formData()
      payload = {
        orderNumber: String(formData.get('ordr_idxx') || ''),
        enc_data: String(formData.get('enc_data') || ''),
        enc_info: String(formData.get('enc_info') || ''),
        tran_cd: String(formData.get('tran_cd') || '00100000'),
      }
    }

    if (!payload.orderNumber || !payload.enc_data || !payload.enc_info) {
      return NextResponse.json({ error: '승인 파라미터가 부족합니다.' }, { status: 400 })
    }

    if (!process.env.KCP_SITE_CD || !process.env.KCP_CERT_INFO) {
      return NextResponse.json({ error: 'KCP 설정이 누락되었습니다.' }, { status: 500 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('order_payments')
      .select('*')
      .eq('order_number', payload.orderNumber)
      .single()

    if (paymentError || !payment) {
      console.error('Payment lookup error:', paymentError)
      return NextResponse.json({ error: '결제 정보를 찾을 수 없습니다.' }, { status: 404 })
    }

    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_number', payload.orderNumber)

    if (ordersError || !orders || orders.length === 0) {
      console.error('Orders lookup error:', ordersError)
      return NextResponse.json({ error: '주문 정보를 찾을 수 없습니다.' }, { status: 404 })
    }

    const totalOrderAmount = orders.reduce((sum, order) => sum + (order.total_price || 0), 0)
    const expectedAmount = totalOrderAmount + (payment.shipping_fee || 0)

    if (expectedAmount !== payment.amount) {
      await supabaseAdmin
        .from('order_payments')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('order_number', payload.orderNumber)

      return NextResponse.json({ error: '결제 금액 검증에 실패했습니다.' }, { status: 400 })
    }

    const env = getKcpEnvironment()
    const approveResponse = await fetch(env.approveUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tran_cd: payload.tran_cd || '00100000',
        kcp_cert_info: normalizeMultilineEnv(process.env.KCP_CERT_INFO),
        site_cd: process.env.KCP_SITE_CD,
        enc_data: payload.enc_data,
        enc_info: payload.enc_info,
        ordr_mony: String(payment.amount),
        pay_type: getKcpPayType(payment.payment_method),
        ordr_no: payload.orderNumber,
      }),
    })

    const approveData = await approveResponse.json()
    if (!approveResponse.ok || approveData?.res_cd !== '0000') {
      await supabaseAdmin
        .from('order_payments')
        .update({
          status: 'failed',
          kcp_res_cd: approveData?.res_cd || 'XXXX',
          kcp_res_msg: approveData?.res_msg || '승인 실패',
          updated_at: new Date().toISOString(),
        })
        .eq('order_number', payload.orderNumber)

      return NextResponse.json({ error: '결제 승인에 실패했습니다.' }, { status: 400 })
    }

    await supabaseAdmin
      .from('order_payments')
      .update({
        status: 'approved',
        kcp_tno: approveData?.tno || null,
        kcp_pay_method: approveData?.pay_method || null,
        kcp_res_cd: approveData?.res_cd || null,
        kcp_res_msg: approveData?.res_msg || null,
        updated_at: new Date().toISOString(),
      })
      .eq('order_number', payload.orderNumber)

    await supabaseAdmin
      .from('orders')
      .update({
        status: 'confirmed',
        paid_at: new Date().toISOString(),
        payment_method: payment.payment_method,
        updated_at: new Date().toISOString(),
      })
      .eq('order_number', payload.orderNumber)

    const userId = orders[0]?.user_id
    if (userId) {
      await supabaseAdmin
        .from('cart_items')
        .delete()
        .eq('user_id', userId)
    }

    if (!isJsonRequest(request)) {
      const redirectUrl = buildRedirectUrl(origin, payload.orderNumber, payment.buyer_email)
      return NextResponse.redirect(redirectUrl)
    }

    return NextResponse.json({
      orderNumber: payload.orderNumber,
      amount: payment.amount,
      email: payment.buyer_email,
    })
  } catch (error) {
    console.error('KCP approve error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
