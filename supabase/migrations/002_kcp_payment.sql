-- =============================================
-- KCP 결제 연동용 마이그레이션
-- =============================================

-- 1) orders.order_number UNIQUE 제약 해제 (복수 아이템 묶음 결제용)
ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_order_number_key;

-- 2) order_number 인덱스 보장
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- 3) 결제 정보 테이블 생성
CREATE TABLE IF NOT EXISTS order_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('ready', 'approved', 'failed')),
  amount INTEGER NOT NULL,
  shipping_fee INTEGER NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL,
  is_mobile BOOLEAN NOT NULL DEFAULT false,
  buyer_email TEXT,
  buyer_name TEXT,
  buyer_phone TEXT,
  kcp_tno TEXT,
  kcp_pay_method TEXT,
  kcp_res_cd TEXT,
  kcp_res_msg TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_order_payments_order_number ON order_payments(order_number);

-- 4) RLS 활성화 (서버에서만 접근)
ALTER TABLE order_payments ENABLE ROW LEVEL SECURITY;
