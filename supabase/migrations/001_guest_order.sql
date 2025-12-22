-- =============================================
-- 비로그인(게스트) 주문 기능 마이그레이션
-- Supabase SQL Editor에서 이 파일을 실행하세요
-- =============================================

-- 1. orders 테이블에 guest_email 컬럼 추가
-- (비회원 주문 시 이메일 저장용)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS guest_email TEXT;

-- 2. orders 테이블에 shipping_zonecode 컬럼 추가
-- (우편번호 저장용 - 기존 스키마에 누락됨)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_zonecode TEXT;

-- 3. orders 테이블에 shipping_address_detail 컬럼 추가
-- (상세주소 저장용 - 기존 스키마에 누락됨)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_address_detail TEXT;

-- 4. orders 테이블에 payment_method 컬럼 추가
-- (결제 방법 저장용 - 기존 스키마에 누락됨)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'bank';

-- 5. user_id 또는 guest_email 중 하나는 필수 제약조건 추가
-- (회원 또는 비회원 구분을 위해)
DO $$ 
BEGIN
  -- 기존 제약조건이 있으면 삭제
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_user_or_guest'
  ) THEN
    ALTER TABLE orders DROP CONSTRAINT check_user_or_guest;
  END IF;
  
  -- 새 제약조건 추가
  ALTER TABLE orders 
  ADD CONSTRAINT check_user_or_guest 
  CHECK (user_id IS NOT NULL OR guest_email IS NOT NULL);
END $$;

-- 6. 성능 최적화를 위한 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_orders_guest_email ON orders(guest_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_guest_lookup ON orders(order_number, guest_email);

-- =============================================
-- RLS 정책 수정 (비회원 주문 조회 허용)
-- =============================================

-- 7. 기존 SELECT 정책 삭제 (있으면)
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Anyone can view guest orders by email" ON orders;
DROP POLICY IF EXISTS "Guest can insert orders" ON orders;

-- 8. 회원 주문 조회 정책 (로그인한 사용자 본인 주문)
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- 9. 비회원 주문 조회 정책 (guest_email이 있는 주문은 조회 가능)
-- 보안: API에서 order_number + guest_email 일치 여부 검증
CREATE POLICY "Anyone can view guest orders" ON orders
  FOR SELECT USING (
    user_id IS NULL AND guest_email IS NOT NULL
  );

-- 10. 비회원 주문 INSERT 허용 (user_id가 NULL이고 guest_email이 있는 경우)
CREATE POLICY "Guest can insert orders" ON orders
  FOR INSERT WITH CHECK (
    (auth.uid() = user_id) OR 
    (user_id IS NULL AND guest_email IS NOT NULL)
  );

-- =============================================
-- 회원가입 시 비회원 주문 자동 연결 트리거
-- =============================================

-- 11. 기존 함수 수정 (회원가입 시 프로필 생성 + 비회원 주문 연결)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 프로필 생성
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  -- 같은 이메일로 주문된 비회원 주문을 회원 계정에 연결
  UPDATE public.orders
  SET user_id = NEW.id
  WHERE guest_email = NEW.email
    AND user_id IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거가 이미 있으므로 별도 생성 불필요 (함수만 업데이트됨)

-- =============================================
-- 확인용 쿼리 (실행 결과 확인)
-- =============================================

-- 컬럼 추가 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders' 
  AND column_name IN ('guest_email', 'shipping_zonecode', 'shipping_address_detail', 'payment_method');

-- 인덱스 확인
SELECT indexname FROM pg_indexes WHERE tablename = 'orders';

-- 제약조건 확인
SELECT conname FROM pg_constraint WHERE conrelid = 'orders'::regclass;

