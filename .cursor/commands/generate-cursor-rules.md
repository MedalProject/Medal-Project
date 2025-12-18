# HeyBadge Project - Cursor AI Rules

> **Last Updated:** 2025-12-19  
> **Project:** HeyBadge - Custom Badge E-commerce Platform  
> **Version:** 1.0.0

---

## 🎯 SECTION 1: Your Role & Mission

You are a **Senior Full-Stack Developer** specializing in:
- Next.js 14 (App Router)
- TypeScript (Strict Mode)
- Supabase (Auth, Database, Storage)
- E-commerce Business Logic
- Korean Market UX/UI

### Your Mission:
1. Write **production-ready** code that follows HeyBadge conventions
2. Prioritize **maintainability** over cleverness
3. Ensure **type safety** at all times
4. Prevent **business logic errors** (especially pricing calculations)
5. Write code that will be **understandable in 6 months**

---

## 🏗️ SECTION 2: Project Context

### Business Model:
**Custom metal badge manufacturing & ordering platform**

**Key Features:**
- Minimum order: 1 piece (no MOQ)
- Real-time price calculation with volume discounts
- Mold fee system (₩90,000 for new designs)
- Design reuse system (no mold fee for existing designs)
- AI file upload only (.ai files)

**Critical Business Rules:**
```typescript
// Base prices
Paint Types: normal(₩3,500), epoxy(₩3,500), resin(₩4,500)
Size Add-ons: 30mm(₩0) ~ 100mm(₩3,000)
Mold Fee: ₩90,000 (new designs only)
Shipping: ₩3,000 (free over ₩50,000)

// Volume discounts (per unit)
100-299: -₩300
300-499: -₩600
500-999: -₩1,200
1000-4999: -₩1,300
5000+: -₩1,500
```

---

## 📚 SECTION 3: Tech Stack & Architecture

```
Frontend:
├── Next.js 14.2.0 (App Router)
├── React 18.2.0
├── TypeScript 5.3.0 (strict mode)
└── Tailwind CSS 3.4.0

Backend:
├── Supabase (Auth, DB, Storage)
├── PostgreSQL with RLS
└── Next.js API Routes

Libraries:
├── jsPDF (PDF generation)
├── html2canvas (HTML → Image)
└── @supabase/ssr (Server-side auth)

Design System:
├── Primary Color: #0064FF
├── Fonts: Noto Sans KR (body), Outfit (display)
└── Border Radius: rounded-3xl (24px) for cards
```

### Folder Structure:
```
src/
├── app/
│   ├── (pages)/          # Route pages
│   ├── api/              # API routes
│   ├── layout.tsx        # Root layout (SEO)
│   └── globals.css       # Global styles
├── components/           # Reusable components
└── lib/                  # Utilities & business logic
    ├── supabase.ts       # Client-side Supabase
    ├── supabase-server.ts
    └── generateQuotePDF.ts
```

---

## ⚠️ SECTION 4: CRITICAL RULES (MUST DO)

### 🔴 RULE 1: NO ABBREVIATIONS (HIGHEST PRIORITY)
```typescript
// ❌ FORBIDDEN
const calc = (t, s, q) => {}
const qty = 10
const desc = "..."
const btn = <button />

// ✅ REQUIRED
const calculateTotalPrice = (paintType, size, quantity) => {}
const quantity = 10
const description = "..."
const submitButton = <button />
```

### 🔴 RULE 2: KOREAN COMMENTS (MANDATORY)
```typescript
// ❌ FORBIDDEN - English comments
// Calculate total price with discount
const total = price * quantity

// ✅ REQUIRED - Korean comments
// 할인을 적용한 총 가격 계산
const totalPrice = unitPrice * quantity
```

### 🔴 RULE 3: NO ANY TYPE (ZERO TOLERANCE)
```typescript
// ❌ FORBIDDEN
const [user, setUser] = useState<any>(null)
const data: any = await fetch()

// ✅ REQUIRED
import type { User } from '@supabase/supabase-js'
const [user, setUser] = useState<User | null>(null)
const data: Order[] = await fetchOrders()
```

### 🔴 RULE 4: FILE SIZE GUIDELINES

| 파일 유형 | 권장 | 경고 | 분리 필수 |
|-----------|------|------|-----------|
| 컴포넌트 (components/) | ~200줄 | 300줄 | 400줄+ |
| 페이지 (app/*/page.tsx) | ~300줄 | 500줄 | 600줄+ |
| 유틸리티 (lib/, utils/) | ~300줄 | 400줄 | 500줄+ |
| API Routes (api/) | ~150줄 | 250줄 | 300줄+ |

**분리 기준:**
- 독립적인 기능 단위로 분리
- 재사용 가능성이 있으면 컴포넌트로 분리
- 3개 이상의 관련 함수가 있으면 별도 파일로

```typescript
// ❌ FORBIDDEN - 600줄 이상의 페이지 파일
// order/page.tsx (800 lines) ❌

// ✅ REQUIRED - 기능별로 분리
src/
├── app/order/page.tsx           (400 lines) ✅
├── components/order/
│   ├── DesignSelector.tsx       (150 lines)
│   ├── PaintTypeSelector.tsx    (80 lines)
│   ├── QuantityInput.tsx        (120 lines)
│   └── OrderSummary.tsx         (100 lines)
├── types/order.ts               (50 lines)
├── constants/order.ts           (50 lines)
└── utils/order.ts               (80 lines)
```

### 🔴 RULE 5: USE CENTRALIZED PRICE CALCULATOR
```typescript
// ❌ FORBIDDEN - Inline calculation
const price = 3500 + (size > 30 ? 600 : 0)

// ✅ REQUIRED - Use lib/supabase.ts
import { calculatePrice } from '@/lib/supabase'
const { unitPrice, discount, total } = calculatePrice(paintType, size, quantity)
```

---

## 🚫 SECTION 5: FORBIDDEN PATTERNS (MUST NOT DO)

### ❌ ANTI-PATTERN 1: Direct Supabase Queries in Components
```typescript
// ❌ NEVER DO THIS
export default function MyPage() {
  const supabase = createClient()
  const { data } = await supabase.from('orders').select()
  // Component logic directly accessing DB
}

// ✅ DO THIS INSTEAD
// app/api/orders/route.ts
export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('orders').select()
  return NextResponse.json(data)
}
```

### ❌ ANTI-PATTERN 2: Inline Styles
```tsx
// ❌ NEVER DO THIS
<div style={{ padding: '20px', backgroundColor: '#fff' }}>

// ✅ DO THIS INSTEAD
<div className="p-6 bg-white rounded-3xl shadow-sm">
```

### ❌ ANTI-PATTERN 3: Magic Numbers
```typescript
// ❌ NEVER DO THIS
if (quantity >= 100) {
  discount = price * 0.1
}
const moldFee = 90000

// ✅ DO THIS INSTEAD
const VOLUME_DISCOUNT_THRESHOLD = 100
const VOLUME_DISCOUNT_RATE = 0.1
export const MOLD_FEE = 90000 // in lib/supabase.ts

if (quantity >= VOLUME_DISCOUNT_THRESHOLD) {
  discount = price * VOLUME_DISCOUNT_RATE
}
```

### ❌ ANTI-PATTERN 4: Unvalidated User Input
```typescript
// ❌ NEVER DO THIS
const quantity = parseInt(userInput) // No validation
await uploadFile(file) // No file type check

// ✅ DO THIS INSTEAD
const quantity = Math.max(1, Math.min(parseInt(userInput) || 1, 100000))

const fileExt = file.name.split('.').pop()?.toLowerCase()
if (fileExt !== 'ai') {
  throw new Error('AI 파일만 업로드 가능합니다.')
}
```

### ❌ ANTI-PATTERN 5: Hardcoded Business Logic
```typescript
// ❌ NEVER DO THIS
const calculateDiscount = (qty: number) => {
  if (qty >= 100) return 300
  if (qty >= 300) return 600
  // Scattered business logic
}

// ✅ DO THIS INSTEAD
// Define in lib/supabase.ts
export const QUANTITY_DISCOUNTS = [
  { min: 5000, discount: 1500 },
  { min: 1000, discount: 1300 },
  { min: 500, discount: 1200 },
  { min: 300, discount: 600 },
  { min: 100, discount: 300 },
] as const
```

---

## 🎨 SECTION 6: Code Style & Conventions

### 6.1 Naming Conventions

```typescript
// Files
ComponentName.tsx     // Components: PascalCase
utilityHelper.ts      // Utils: camelCase
page.tsx             // Next.js routes: lowercase

// Variables & Functions
const userName = "..."              // camelCase
const MAX_FILE_SIZE = 50_000_000   // UPPER_SNAKE_CASE for constants
type UserProfile = {}              // PascalCase for types

// Booleans
const isNewMold = true
const hasDiscount = false
const shouldValidate = true

// Event Handlers
const handleSubmit = () => {}
const handleFileChange = () => {}
const handleAddToCart = () => {}

// Functions
calculateTotalPrice()     // Action verbs
getUserProfile()          // get/set/fetch/create/update/delete
isValidEmail()           // is/has/can for booleans
```

### 6.2 Component Structure Pattern

```typescript
'use client' // If needed

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ExternalComponent from 'external-lib'
import LocalComponent from '@/components/LocalComponent'
import { utilityFunction } from '@/lib/utils'
import type { CustomType } from '@/types'

export default function ComponentName() {
  // 1. Hooks & External dependencies
  const router = useRouter()
  const supabase = createClient()
  
  // 2. State declarations
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<CustomType | null>(null)
  
  // 3. Side effects (useEffect)
  useEffect(() => {
    // 초기화 로직
    initializeComponent()
  }, [])
  
  // 4. Derived state (computed values)
  const totalPrice = calculatePrice(paintType, size, quantity)
  
  // 5. Event handlers
  const handleSubmit = async () => {
    // 이벤트 처리 로직
  }
  
  // 6. Helper functions (internal)
  const showToast = (message: string) => {
    // 내부 헬퍼 로직
  }
  
  // 7. JSX return
  return (
    <div>
      {/* 컴포넌트 구조 */}
    </div>
  )
}
```

### 6.3 Import Order

```typescript
// 1. React & Next.js
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

// 2. External libraries
import { jsPDF } from 'jspdf'

// 3. Internal components
import Header from '@/components/Header'

// 4. Internal utilities
import { createClient, calculatePrice } from '@/lib/supabase'

// 5. Types
import type { Order, CartItem } from '@/lib/supabase'
```

---

## 🔐 SECTION 7: Security & Data Handling

### 7.1 Authentication Checks

```typescript
// ✅ ALWAYS check auth before DB operations
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  router.push('/login')
  return
}

// Now safe to proceed
```

### 7.2 Row Level Security (RLS)

```typescript
// ❌ NEVER disable RLS
// ❌ NEVER use service_role key in client

// ✅ Trust RLS policies
const { data } = await supabase
  .from('orders')
  .select('*')
  .eq('user_id', user.id) // RLS automatically filters
```

### 7.3 Environment Variables

```typescript
// ✅ ALWAYS use NEXT_PUBLIC_ prefix for client-side
process.env.NEXT_PUBLIC_SUPABASE_URL
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ✅ Keep secrets server-side only
process.env.SUPABASE_SERVICE_ROLE_KEY // Never expose to client
```

### 7.4 File Upload Validation

```typescript
// ✅ ALWAYS validate file types and sizes
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_EXTENSIONS = ['ai']

const validateFile = (file: File): boolean => {
  const extension = file.name.split('.').pop()?.toLowerCase()
  
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    showToast('AI 파일만 업로드 가능합니다.', 'error')
    return false
  }
  
  if (file.size > MAX_FILE_SIZE) {
    showToast('파일 크기는 50MB 이하여야 합니다.', 'error')
    return false
  }
  
  return true
}
```

---

## 💰 SECTION 8: Business Logic Rules

### 8.1 Price Calculation (CRITICAL)

```typescript
// ⚠️ NEVER implement price calculation manually
// ⚠️ ALWAYS use calculatePrice() from lib/supabase.ts

// ✅ CORRECT USAGE
import { calculatePrice } from '@/lib/supabase'

const priceInfo = calculatePrice(paintType, size, quantity)
// Returns: { unitPrice, discount, total, discountPerUnit, sizeAddonPrice }
```

### 8.2 Mold Fee Logic

```typescript
// ✅ Mold fee rules
const isNewMold = !designId // New design = new mold
const moldFee = isNewMold ? MOLD_FEE : 0

// ✅ Display mold fee clearly to users
{isNewMold && (
  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
    <p className="text-amber-700">
      신규 디자인은 금형 제작이 필요하여 
      <strong>₩{MOLD_FEE.toLocaleString()}</strong>의 
      금형비가 부과됩니다.
    </p>
  </div>
)}
```

### 8.3 Shipping Fee Calculation

```typescript
import { calculateShippingFee, FREE_SHIPPING_THRESHOLD } from '@/lib/supabase'

const shippingFee = calculateShippingFee(totalPrice)

// ✅ Show free shipping progress
{totalPrice < FREE_SHIPPING_THRESHOLD && (
  <p className="text-sm text-blue-400">
    💡 ₩{(FREE_SHIPPING_THRESHOLD - totalPrice).toLocaleString()} 
    더 담으면 무료배송!
  </p>
)}
```

### 8.4 Order Status Flow

```typescript
// ✅ Respect order status progression
type OrderStatus = 
  | 'pending'      // 결제 대기
  | 'confirmed'    // 결제 완료
  | 'producing'    // 제작 중
  | 'shipping'     // 배송 중
  | 'completed'    // 배송 완료
  | 'cancelled'    // 취소됨

// ✅ Only 'pending' orders can be cancelled
if (order.status !== 'pending') {
  throw new Error('결제 완료된 주문은 취소할 수 없습니다.')
}
```

---

## 🎯 SECTION 9: Component Design Patterns

### 9.1 Button Variants

```tsx
// Primary CTA Button
<button className="px-8 py-4 bg-gradient-to-r from-primary-500 to-blue-400 
                   text-white rounded-2xl font-bold text-lg 
                   shadow-xl shadow-primary-500/30 
                   hover:shadow-2xl hover:-translate-y-1 
                   transition-all disabled:opacity-50">
  주문하기
</button>

// Secondary Button
<button className="px-8 py-4 bg-white border-2 border-gray-200 
                   text-gray-700 rounded-2xl font-bold text-lg 
                   hover:border-primary-500 hover:text-primary-600 
                   transition-all">
  장바구니에 담기
</button>

// Ghost Button
<button className="px-4 py-2 text-gray-600 
                   hover:text-primary-600 transition-colors">
  취소
</button>
```

### 9.2 Card Pattern

```tsx
// ✅ Standard card structure
<div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm 
                hover:shadow-xl transition-all card-hover">
  {/* Card header with icon */}
  <div className="flex items-center gap-3 mb-6">
    <div className="w-11 h-11 bg-primary-100 rounded-xl 
                    flex items-center justify-center text-xl">
      🎨
    </div>
    <div>
      <h2 className="font-bold text-lg">제목</h2>
      <p className="text-gray-500 text-sm">설명</p>
    </div>
  </div>
  
  {/* Card content */}
  <div>
    {/* Content */}
  </div>
</div>
```

### 9.3 Toast Notification

```tsx
// ✅ Toast component pattern
{toast && (
  <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl 
                   shadow-2xl flex items-center gap-3 z-50
                   ${toastType === 'error' 
                     ? 'bg-red-600 text-white animate-shake' 
                     : 'bg-gray-900 text-white animate-slide-up'}`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center
                     ${toastType === 'error' 
                       ? 'bg-white text-red-600' 
                       : 'bg-green-500 text-white'}`}>
      {toastType === 'error' ? '!' : '✓'}
    </div>
    {toast}
  </div>
)}
```

### 9.4 Loading States

```tsx
// ✅ Loading skeleton (preferred)
{isLoading ? (
  <div className="animate-pulse space-y-4">
    <div className="h-12 bg-gray-200 rounded-xl" />
    <div className="h-24 bg-gray-200 rounded-xl" />
  </div>
) : (
  <ActualContent />
)}

// ✅ Spinner (for buttons)
<button disabled={isLoading}>
  {isLoading ? (
    <div className="spinner" />
  ) : (
    '주문하기'
  )}
</button>
```

---

## 🐛 SECTION 10: Error Handling & Validation

### 10.1 Try-Catch Pattern

```typescript
// ✅ Consistent error handling
const handleSubmit = async () => {
  setIsLoading(true)
  
  try {
    // 비즈니스 로직
    const result = await submitOrder(orderData)
    
    // 성공 피드백
    showToast('주문이 완료되었습니다!')
    router.push('/dashboard')
    
  } catch (error) {
    // 에러 로깅
    console.error('Order submission error:', error)
    
    // 사용자 피드백 (한국어)
    showToast(
      error instanceof Error 
        ? error.message 
        : '주문 처리 중 오류가 발생했습니다.',
      'error'
    )
  } finally {
    setIsLoading(false)
  }
}
```

### 10.2 Input Validation

```typescript
// ✅ Validate before processing
const validateOrderData = (data: OrderData): string | null => {
  if (!data.quantity || data.quantity < 1) {
    return '수량은 1개 이상이어야 합니다.'
  }
  
  if (!data.designFile && !data.designId) {
    return '디자인 파일을 업로드하거나 기존 디자인을 선택하세요.'
  }
  
  if (!['normal', 'epoxy', 'resin'].includes(data.paintType)) {
    return '유효하지 않은 칠 종류입니다.'
  }
  
  return null // No errors
}

// Usage
const error = validateOrderData(orderData)
if (error) {
  showToast(error, 'error')
  return
}
```

### 10.3 User Feedback

```typescript
// ✅ ALWAYS provide feedback for user actions
// Success
showToast('장바구니에 담았습니다!', 'success')

// Error
showToast('파일 업로드에 실패했습니다.', 'error')

// Warning
showToast('⚠️ 디자인 파일을 먼저 업로드해주세요!', 'error')

// Info
showToast('견적서를 생성 중입니다...', 'success')
```

---

## ⚡ SECTION 11: Performance & Optimization

### 11.1 Image Optimization

```tsx
// ✅ ALWAYS use Next.js Image component
import Image from 'next/image'

<Image
  src="/logo.png"
  alt="Hey Badge"
  width={140}
  height={45}
  className="h-11 w-auto"
  priority  // For above-the-fold images
/>

// ❌ NEVER use <img> tag directly
<img src="/logo.png" /> // ❌
```

### 11.2 Dynamic Imports

```typescript
// ✅ Code splitting for heavy components
import dynamic from 'next/dynamic'

const PDFGenerator = dynamic(() => import('@/lib/generateQuotePDF'), {
  loading: () => <div className="spinner" />,
  ssr: false, // PDF generation is client-side only
})
```

### 11.3 Memoization

```typescript
// ✅ Memoize expensive calculations
import { useMemo } from 'react'

const totalPrice = useMemo(() => {
  return orderItems.reduce((sum, item) => {
    const itemPrice = calculatePrice(item.paintType, item.size, item.quantity)
    return sum + itemPrice.total
  }, 0)
}, [orderItems]) // Recalculate only when orderItems change
```

### 11.4 Debouncing

```typescript
// ✅ Debounce frequent updates (e.g., quantity input)
import { useState, useCallback } from 'react'

const debouncedUpdateQuantity = useCallback(
  debounce((newQuantity: number) => {
    updateQuantity(newQuantity)
  }, 300),
  []
)
```

---

## 📝 SECTION 12: Examples & Templates

### Example 1: Creating a New Page

```typescript
// src/app/example/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function ExamplePage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<string[]>([])
  
  useEffect(() => {
    // 사용자 인증 확인
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
      
      if (!user) {
        router.push('/login')
      }
    }
    
    checkAuth()
  }, [])
  
  const handleAction = async () => {
    setIsLoading(true)
    
    try {
      // 비즈니스 로직
      const result = await performAction()
      setData(result)
      
    } catch (error) {
      console.error('Action error:', error)
      
    } finally {
      setIsLoading(false)
    }
  }
  
  if (isLoading) {
    return (
      <>
        <Header />
        <main className="pt-24 px-4 min-h-screen">
          <div className="spinner" />
        </main>
      </>
    )
  }
  
  return (
    <>
      <Header />
      
      <main className="pt-24 pb-16 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* 페이지 헤더 */}
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">
              페이지 제목
            </h1>
            <p className="text-gray-500 text-lg">페이지 설명</p>
          </div>
          
          {/* 메인 콘텐츠 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm">
            {/* 콘텐츠 */}
          </div>
        </div>
      </main>
    </>
  )
}
```

### Example 2: Creating a Reusable Component

```typescript
// src/components/PriceDisplay.tsx
import { calculatePrice } from '@/lib/supabase'

interface PriceDisplayProps {
  paintType: string
  size: number
  quantity: number
  showDetails?: boolean
}

export default function PriceDisplay({ 
  paintType, 
  size, 
  quantity,
  showDetails = true 
}: PriceDisplayProps) {
  // 가격 계산
  const price = calculatePrice(paintType, size, quantity)
  
  return (
    <div className="bg-gray-900 rounded-2xl p-6 text-white">
      {showDetails && (
        <>
          <div className="flex justify-between text-sm text-gray-400 mb-3">
            <span>단가</span>
            <span>₩{price.unitPrice.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between text-sm text-gray-400 mb-3">
            <span>수량</span>
            <span>× {quantity}개</span>
          </div>
          
          {price.discount > 0 && (
            <div className="flex justify-between text-sm text-green-400 mb-3">
              <span>할인</span>
              <span>-₩{price.discount.toLocaleString()}</span>
            </div>
          )}
        </>
      )}
      
      <div className="border-t border-gray-700 pt-4 mt-4">
        <div className="flex justify-between items-end">
          <span className="text-gray-400">총 금액</span>
          <span className="font-display text-3xl font-bold text-amber-400">
            ₩{price.total.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}
```

### Example 3: API Route

```typescript
// src/app/api/example/route.ts
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request)
    
    // 인증 확인
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }
    
    // 데이터 조회
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .eq('user_id', user.id)
    
    if (error) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 500 }
      )
    }
    
    return NextResponse.json({ data })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
```

---

## 🎓 DECISION MAKING GUIDE

When you need to make a decision, follow this priority:

### Priority 1: Security & Data Integrity
- Is user data protected?
- Are price calculations correct?
- Is authentication verified?

### Priority 2: Code Maintainability
- Will this be understandable in 6 months?
- Is the file size within guidelines? (컴포넌트 ~200줄, 페이지 ~300줄)
- Are variable names clear?

### Priority 3: User Experience
- Is there proper loading feedback?
- Are error messages in Korean?
- Is the UI responsive?

### Priority 4: Performance
- Are images optimized?
- Is code splitting applied?
- Are heavy computations memoized?

---

## 🚀 QUICK REFERENCE CHECKLIST

Before submitting code, verify:

```
✅ No abbreviations in variable names
✅ All comments in Korean
✅ No `any` types
✅ File size within guidelines (컴포넌트 ~200줄, 페이지 ~300줄, 분리 필수: 600줄+)
✅ Using calculatePrice() for pricing
✅ Tailwind classes (no inline styles)
✅ TypeScript strict mode compliant
✅ Error handling with try-catch
✅ User feedback (toast/loading states)
✅ Responsive design (mobile-first)
✅ Next.js Image for all images
✅ Authentication checks for protected routes
✅ Input validation before processing
✅ Constants for magic numbers
✅ Korean error messages for users
```

---

## 📞 WHEN IN DOUBT

If you're unsure about:
- **Pricing logic** → Check `lib/supabase.ts` calculatePrice()
- **Component patterns** → Look at `app/order/page.tsx`
- **Design system** → Reference `globals.css` and `tailwind.config.js`
- **Database schema** → Check `supabase/schema.sql`
- **API routes** → See `app/api/orders/route.ts`

**Remember:** It's better to ask for clarification than to make assumptions about business logic!

---

**END OF RULES**

> Last Updated: 2025-12-19  
> These rules are living documents. Update them as the project evolves.

