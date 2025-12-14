-- =============================================
-- 뱃지팩토리 데이터베이스 스키마
-- Supabase SQL Editor에서 이 파일 전체를 실행하세요
-- =============================================

-- 1. 사용자 프로필 테이블
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. 주문 테이블
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'producing', 'shipping', 'completed', 'cancelled')),
  
  -- 뱃지 옵션
  paint_type TEXT NOT NULL, -- normal(일반칠), epoxy(에폭시), resin(수지칠)
  metal_color TEXT NOT NULL, -- gold(금도금), silver(은도금)
  size INTEGER NOT NULL, -- mm
  quantity INTEGER NOT NULL,
  
  -- 디자인 파일
  design_url TEXT,
  design_name TEXT,
  
  -- 가격
  unit_price INTEGER NOT NULL, -- 원
  discount_amount INTEGER DEFAULT 0,
  total_price INTEGER NOT NULL,
  
  -- 배송 정보
  shipping_name TEXT,
  shipping_phone TEXT,
  shipping_address TEXT,
  shipping_memo TEXT,
  
  -- 시간
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  paid_at TIMESTAMP WITH TIME ZONE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 3. 장바구니 테이블
CREATE TABLE cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  paint_type TEXT NOT NULL,
  metal_color TEXT NOT NULL,
  size INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  design_url TEXT,
  design_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. 제작 사례 테이블
CREATE TABLE badge_references (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  paint_type TEXT NOT NULL, -- normal(일반칠), epoxy(에폭시), resin(수지칠)
  metal_color TEXT NOT NULL, -- gold(금도금), silver(은도금)
  size TEXT NOT NULL, -- 예: "40mm", "50x30mm" 등
  is_featured BOOLEAN DEFAULT FALSE, -- 메인에 노출 여부
  display_order INTEGER DEFAULT 0, -- 정렬 순서
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- badge_references 테이블 RLS (모든 사용자가 읽기 가능)
ALTER TABLE badge_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badge_references" ON badge_references
  FOR SELECT USING (true);

-- 5. 디자인 템플릿 테이블 (선택사항)
CREATE TABLE templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 기본 템플릿 데이터 추가
INSERT INTO templates (name, icon, category) VALUES
  ('별', '⭐', 'basic'),
  ('하트', '❤️', 'basic'),
  ('스타', '🌟', 'basic'),
  ('음표', '🎵', 'basic'),
  ('불꽃', '🔥', 'basic'),
  ('다이아몬드', '💎', 'premium'),
  ('무지개', '🌈', 'basic'),
  ('로켓', '🚀', 'basic'),
  ('타겟', '🎯', 'basic'),
  ('트로피', '🏆', 'premium'),
  ('팔레트', '🎨', 'basic'),
  ('전구', '💡', 'basic');

-- =============================================
-- Row Level Security (RLS) 설정
-- =============================================

-- profiles 테이블 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- orders 테이블 RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id);

-- cart_items 테이블 RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cart" ON cart_items
  FOR ALL USING (auth.uid() = user_id);

-- templates 테이블은 모든 사용자가 읽기 가능
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view templates" ON templates
  FOR SELECT USING (true);

-- =============================================
-- 트리거: 회원가입 시 자동으로 profile 생성
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 주문번호 생성 함수
-- =============================================

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
BEGIN
  new_number := 'BF' || TO_CHAR(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Storage 버킷 생성 (Supabase Dashboard에서 수동 생성 필요)
-- 버킷 이름: designs
-- Public: false
-- File size limit: 10MB
-- Allowed MIME types: image/png, image/jpeg, image/svg+xml, application/pdf
-- =============================================

-- =============================================
-- 기존 DB 마이그레이션 (선택사항)
-- 기존 badge_type 컬럼을 paint_type으로 변경하고 값을 업데이트합니다.
-- 필요한 경우에만 실행하세요.
-- =============================================
-- 
-- 1. 컬럼 이름 변경
-- ALTER TABLE orders RENAME COLUMN badge_type TO paint_type;
-- ALTER TABLE cart_items RENAME COLUMN badge_type TO paint_type;
-- 
-- 2. 기존 값 마이그레이션
-- UPDATE orders SET paint_type = 'normal' WHERE paint_type IN ('soft-enamel', 'printed', 'acrylic');
-- UPDATE orders SET paint_type = 'epoxy' WHERE paint_type = 'hard-enamel';
-- 
-- UPDATE cart_items SET paint_type = 'normal' WHERE paint_type IN ('soft-enamel', 'printed', 'acrylic');
-- UPDATE cart_items SET paint_type = 'epoxy' WHERE paint_type = 'hard-enamel';
-- 
-- 3. 기존 metal_color도 업데이트 (rose-gold, black-nickel 제거)
-- UPDATE orders SET metal_color = 'gold' WHERE metal_color IN ('rose-gold', 'black-nickel');
-- UPDATE cart_items SET metal_color = 'gold' WHERE metal_color IN ('rose-gold', 'black-nickel');
