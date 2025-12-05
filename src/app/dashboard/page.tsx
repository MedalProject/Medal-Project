'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { createClient, Order, statusLabels, statusColors, priceTable } from '@/lib/supabase'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }
      
      setUser(user)

      // Fetch orders
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setOrders(data)
      }
      
      setLoading(false)
    }

    init()
  }, [router])

  const handleCancelOrder = async (orderId: string) => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!confirm('주문을 취소하시겠습니까?')) {
      return
    }

    setCancelling(orderId)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token

      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          orderId,
          status: 'cancelled',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '주문 취소에 실패했습니다.')
      }

      // 주문 목록 업데이트
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'cancelled' }
          : order
      ))

      alert('주문이 취소되었습니다.')
    } catch (error) {
      console.error('Order cancellation error:', error)
      alert(error instanceof Error ? error.message : '주문 취소에 실패했습니다.')
    } finally {
      setCancelling(null)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="spinner w-10 h-10" />
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      
      <main className="pt-24 pb-16 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">내 주문</h1>
            <p className="text-gray-500">주문 내역과 진행 상황을 확인하세요</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: '전체 주문', value: orders.length, color: 'bg-gray-100' },
              { label: '진행 중', value: orders.filter(o => ['confirmed', 'producing', 'shipping'].includes(o.status)).length, color: 'bg-blue-100' },
              { label: '완료', value: orders.filter(o => o.status === 'completed').length, color: 'bg-green-100' },
              { label: '결제 대기', value: orders.filter(o => o.status === 'pending').length, color: 'bg-yellow-100' },
            ].map((stat, i) => (
              <div key={i} className={`${stat.color} rounded-2xl p-5`}>
                <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                <p className="font-display text-3xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                📦
              </div>
              <h2 className="text-xl font-bold mb-3">아직 주문이 없습니다</h2>
              <p className="text-gray-500 mb-6">첫 번째 뱃지를 만들어보세요!</p>
              <Link
                href="/order"
                className="inline-block px-8 py-4 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all"
              >
                뱃지 만들기 →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-xl ${
                        order.metal_color === 'gold' ? 'metal-gold' :
                        order.metal_color === 'silver' ? 'metal-silver' :
                        order.metal_color === 'rose-gold' ? 'metal-rose-gold' :
                        'metal-black-nickel'
                      } flex items-center justify-center text-2xl shadow-md`}>
                        {order.design_name?.length === 1 || order.design_name?.length === 2 ? order.design_name : '🏷️'}
                      </div>
                      <div>
                        <p className="font-bold text-lg">{order.order_number}</p>
                        <p className="text-gray-500 text-sm">
                          {priceTable[order.badge_type as keyof typeof priceTable]?.name || order.badge_type} · {order.size}mm · {order.quantity}개
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          {new Date(order.created_at).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Status & Price */}
                    <div className="flex items-center gap-6">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                      <div className="text-right">
                        <p className="font-display text-xl font-bold">
                          ₩{order.total_price.toLocaleString()}
                        </p>
                        {order.discount_amount > 0 && (
                          <p className="text-xs text-green-600">
                            ₩{order.discount_amount.toLocaleString()} 할인
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar for active orders */}
                  {['confirmed', 'producing', 'shipping'].includes(order.status) && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="flex justify-between mb-3">
                        {['결제 완료', '제작 중', '배송 중', '배송 완료'].map((step, i) => {
                          const statusOrder = ['confirmed', 'producing', 'shipping', 'completed']
                          const currentIndex = statusOrder.indexOf(order.status)
                          const isActive = i <= currentIndex
                          const isCurrent = i === currentIndex
                          
                          return (
                            <div key={i} className="flex flex-col items-center flex-1">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2 ${
                                isCurrent ? 'bg-primary-500 text-white' :
                                isActive ? 'bg-green-500 text-white' :
                                'bg-gray-200 text-gray-400'
                              }`}>
                                {isActive && !isCurrent ? '✓' : i + 1}
                              </div>
                              <span className={`text-xs ${isActive ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                                {step}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary-500 to-green-500 transition-all duration-500"
                          style={{
                            width: order.status === 'confirmed' ? '25%' :
                                   order.status === 'producing' ? '50%' :
                                   order.status === 'shipping' ? '75%' : '100%'
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action buttons for pending orders */}
                  {order.status === 'pending' && (
                    <div className="mt-6 pt-6 border-t border-gray-100 flex gap-3">
                      <button className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                        결제하기
                      </button>
                      <button 
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancelling === order.id}
                        className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancelling === order.id ? '취소 중...' : '취소'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* New Order Button */}
          {orders.length > 0 && (
            <div className="mt-8 text-center">
              <Link
                href="/order"
                className="inline-block px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
              >
                + 새 뱃지 만들기
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
