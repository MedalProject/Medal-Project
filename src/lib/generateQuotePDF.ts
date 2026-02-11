import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

type QuoteItem = {
  name: string
  spec: string
  quantity: number
  unitPrice: number
  amount: number
  isNewMold?: boolean
}

type QuoteData = {
  items: QuoteItem[]
  moldFee: number
  moldCount: number
  shippingFee: number
  totalAmount: number
}

export async function generateQuotePDF(data: QuoteData): Promise<void> {
  // 날짜 계산
  const today = new Date()
  const validUntil = new Date(today)
  validUntil.setDate(validUntil.getDate() + 7) // 7일 유효기간

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  const formatDateShort = (date: Date) => {
    return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  }

  // 견적번호 생성
  const quoteNumber = `EST-${formatDateShort(today)}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`

  // 금액 계산
  const supplyAmount = Math.round(data.totalAmount / 1.1) // 공급가액
  const taxAmount = data.totalAmount - supplyAmount // 부가세

  // HTML 템플릿 생성
  const html = `
    <div id="quote-pdf" style="width: 794px; padding: 40px; font-family: 'Noto Sans KR', sans-serif; background: white; color: #333;">
      <!-- 헤더 -->
      <div style="background: linear-gradient(135deg, #0064FF, #3b82f6); height: 8px; margin: -40px -40px 30px -40px;"></div>
      
      <!-- 타이틀 -->
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="font-size: 32px; font-weight: 800; color: #1a1a1a; margin: 0 0 8px 0;">견 적 서</h1>
        <p style="font-size: 14px; color: #888; margin: 0;">QUOTATION</p>
      </div>

      <!-- 견적 정보 -->
      <div style="border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 25%; padding: 8px 0; color: #666; font-size: 13px;">견적번호</td>
            <td style="width: 25%; padding: 8px 0; font-weight: 600; font-size: 13px;">${quoteNumber}</td>
            <td style="width: 25%; padding: 8px 0; color: #666; font-size: 13px;">유효기간</td>
            <td style="width: 25%; padding: 8px 0; font-weight: 600; font-size: 13px;">${formatDate(validUntil)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 13px;">견적일자</td>
            <td style="padding: 8px 0; font-weight: 600; font-size: 13px;">${formatDate(today)}</td>
            <td style="padding: 8px 0; color: #666; font-size: 13px;"></td>
            <td style="padding: 8px 0; font-weight: 600; font-size: 13px; color: #dc2626;">* 7일간 유효</td>
          </tr>
        </table>
      </div>

      <!-- 품목 테이블 -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="background: #f8fafc;">
            <th style="padding: 12px 8px; text-align: center; font-size: 12px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; width: 8%;">번호</th>
            <th style="padding: 12px 8px; text-align: left; font-size: 12px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; width: 25%;">품목명</th>
            <th style="padding: 12px 8px; text-align: left; font-size: 12px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; width: 27%;">규격</th>
            <th style="padding: 12px 8px; text-align: center; font-size: 12px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; width: 10%;">수량</th>
            <th style="padding: 12px 8px; text-align: right; font-size: 12px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; width: 15%;">단가</th>
            <th style="padding: 12px 8px; text-align: right; font-size: 12px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; width: 15%;">금액</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map((item, index) => `
            <tr>
              <td style="padding: 12px 8px; text-align: center; font-size: 13px; border-bottom: 1px solid #f0f0f0;">${index + 1}</td>
              <td style="padding: 12px 8px; text-align: left; font-size: 13px; border-bottom: 1px solid #f0f0f0;">금속 메달</td>
              <td style="padding: 12px 8px; text-align: left; font-size: 13px; border-bottom: 1px solid #f0f0f0;">${item.spec}</td>
              <td style="padding: 12px 8px; text-align: center; font-size: 13px; border-bottom: 1px solid #f0f0f0;">${item.quantity.toLocaleString()}</td>
              <td style="padding: 12px 8px; text-align: right; font-size: 13px; border-bottom: 1px solid #f0f0f0;">₩${item.unitPrice.toLocaleString()}</td>
              <td style="padding: 12px 8px; text-align: right; font-size: 13px; border-bottom: 1px solid #f0f0f0;">₩${item.amount.toLocaleString()}</td>
            </tr>
          `).join('')}
          ${data.moldFee > 0 ? `
            <tr>
              <td style="padding: 12px 8px; text-align: center; font-size: 13px; border-bottom: 1px solid #f0f0f0;">${data.items.length + 1}</td>
              <td style="padding: 12px 8px; text-align: left; font-size: 13px; border-bottom: 1px solid #f0f0f0;">금형비 (신규)</td>
              <td style="padding: 12px 8px; text-align: left; font-size: 13px; border-bottom: 1px solid #f0f0f0;">-</td>
              <td style="padding: 12px 8px; text-align: center; font-size: 13px; border-bottom: 1px solid #f0f0f0;">${data.moldCount}</td>
              <td style="padding: 12px 8px; text-align: right; font-size: 13px; border-bottom: 1px solid #f0f0f0;">₩90,000</td>
              <td style="padding: 12px 8px; text-align: right; font-size: 13px; border-bottom: 1px solid #f0f0f0;">₩${data.moldFee.toLocaleString()}</td>
            </tr>
          ` : ''}
          ${data.shippingFee > 0 ? `
            <tr>
              <td style="padding: 12px 8px; text-align: center; font-size: 13px; border-bottom: 1px solid #f0f0f0;">${data.items.length + (data.moldFee > 0 ? 2 : 1)}</td>
              <td style="padding: 12px 8px; text-align: left; font-size: 13px; border-bottom: 1px solid #f0f0f0;">배송비</td>
              <td style="padding: 12px 8px; text-align: left; font-size: 13px; border-bottom: 1px solid #f0f0f0;">-</td>
              <td style="padding: 12px 8px; text-align: center; font-size: 13px; border-bottom: 1px solid #f0f0f0;">1</td>
              <td style="padding: 12px 8px; text-align: right; font-size: 13px; border-bottom: 1px solid #f0f0f0;">₩${data.shippingFee.toLocaleString()}</td>
              <td style="padding: 12px 8px; text-align: right; font-size: 13px; border-bottom: 1px solid #f0f0f0;">₩${data.shippingFee.toLocaleString()}</td>
            </tr>
          ` : ''}
        </tbody>
      </table>

      <!-- 합계 -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 40px;">
        <div style="width: 280px; background: #f8fafc; border-radius: 8px; padding: 20px;">
          <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #666;">
            <span>공급가액</span>
            <span>₩${supplyAmount.toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #666;">
            <span>부가세 (10%)</span>
            <span>₩${taxAmount.toLocaleString()}</span>
          </div>
          <div style="border-top: 2px solid #e5e7eb; margin-top: 12px; padding-top: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 14px; font-weight: 700; color: #1a1a1a;">합계 금액</span>
              <span style="font-size: 22px; font-weight: 800; color: #0064FF;">₩${data.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 공급자 정보 -->
      <div style="border: 1px solid #e5e5e5; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
        <h3 style="font-size: 14px; font-weight: 700; color: #1a1a1a; margin: 0 0 16px 0;">공급자 정보</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #666; width: 100px;">상호</td>
            <td style="padding: 6px 0; color: #1a1a1a;">바로해 (메달프로젝트)</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666;">대표자</td>
            <td style="padding: 6px 0; color: #1a1a1a;">유윤종</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666;">사업자번호</td>
            <td style="padding: 6px 0; color: #1a1a1a;">447-47-01294</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666;">주소</td>
            <td style="padding: 6px 0; color: #1a1a1a;">서울특별시 성동구 광나루로 219 2층</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666;">연락처</td>
            <td style="padding: 6px 0; color: #1a1a1a;">0502-1910-3343 / hello.medalproject@gmail.com</td>
          </tr>
        </table>
      </div>

      <!-- 안내문구 -->
      <div style="text-align: center; padding: 20px 0; color: #888; font-size: 12px;">
        <p style="margin: 0 0 4px 0;">본 견적서는 발행일로부터 7일간 유효합니다.</p>
        <p style="margin: 0;">메달프로젝트를 이용해 주셔서 감사합니다.</p>
      </div>

      <!-- 푸터 -->
      <div style="background: linear-gradient(135deg, #0064FF, #3b82f6); height: 8px; margin: 30px -40px -40px -40px;"></div>
    </div>
  `

  // HTML 요소 생성
  const container = document.createElement('div')
  container.innerHTML = html
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.top = '0'
  document.body.appendChild(container)

  const element = container.querySelector('#quote-pdf') as HTMLElement

  try {
    // HTML을 캔버스로 변환
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })

    // PDF 생성
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
    const imgX = (pdfWidth - imgWidth * ratio) / 2
    const imgY = 0

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
    pdf.save(`메달프로젝트_견적서_${formatDateShort(today)}.pdf`)
  } finally {
    // 임시 요소 제거
    document.body.removeChild(container)
  }
}

