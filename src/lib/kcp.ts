type KcpPaymentMethod = 'card' | 'bank'

export type KcpEnvironment = {
  registerUrl: string
  approveUrl: string
  pcScriptUrl: string
}

export type KcpPayMethod = {
  pc: string
  mobile: string
}

export const KCP_TEST_ENV: KcpEnvironment = {
  registerUrl: 'https://testsmpay.kcp.co.kr/trade/register.do',
  approveUrl: 'https://stg-spl.kcp.co.kr/gw/enc/v1/payment',
  pcScriptUrl: 'https://testspay.kcp.co.kr/plugin/kcp_spay_hub.js',
}

export const KCP_REAL_ENV: KcpEnvironment = {
  registerUrl: 'https://smpay.kcp.co.kr/trade/register.do',
  approveUrl: 'https://spl.kcp.co.kr/gw/enc/v1/payment',
  pcScriptUrl: 'https://spay.kcp.co.kr/plugin/kcp_spay_hub.js',
}

export function getKcpEnvironment(): KcpEnvironment {
  // return KCP_TEST_ENV // 테스트용
  return KCP_REAL_ENV // 실제용
}

export function normalizeMultilineEnv(value?: string): string {
  if (!value) return ''
  return value.replace(/\\n/g, '\n')
}

export function getKcpPayMethod(paymentMethod: KcpPaymentMethod): KcpPayMethod {
  if (paymentMethod === 'bank') {
    return { pc: '010000000000', mobile: 'BANK' }
  }
  return { pc: '100000000000', mobile: 'CARD' }
}

export function getKcpPayType(paymentMethod: KcpPaymentMethod): string {
  if (paymentMethod === 'bank') return 'PABK'
  return 'PACA'
}

export function createOrderNumber(prefix = 'HB'): string {
  const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '')
  const randomPart = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')
  return `${prefix}${datePart}-${randomPart}`
}

export function createGoodName(itemCount: number): string {
  if (itemCount <= 1) return '헤이뱃지 주문'
  return `헤이뱃지 주문 ${itemCount}건`
}

export function isMobileUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return false
  return /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent)
}
