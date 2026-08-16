-- ============================================================================
-- SCRIPT THIẾT LẬP PHÂN QUYỀN VÀ BẢO MẬT BẢNG (RLS POLICIES) TRÊN SUPABASE
-- Dành cho hệ thống: CHÍ TOÀN FISHING SHOP
-- Hướng dẫn: Copy toàn bộ nội dung file này dán vào SQL Editor trên Supabase và bấm RUN.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. KÍCH HOẠT ROW LEVEL SECURITY (RLS) CHO CÁC BẢNG DỮ LIỆU
-- ----------------------------------------------------------------------------
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_collections ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 2. DỌC SẠCH CÁC POLICY CŨ ĐỂ TRÁNH TRÙNG LẶP NẾU ĐÃ TỒN TẠI
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public collections select" ON public.collections;
DROP POLICY IF EXISTS "Public products select" ON public.products;
DROP POLICY IF EXISTS "Public product_collections select" ON public.product_collections;

DROP POLICY IF EXISTS "Admin collections insert" ON public.collections;
DROP POLICY IF EXISTS "Admin collections update" ON public.collections;
DROP POLICY IF EXISTS "Admin collections delete" ON public.collections;

DROP POLICY IF EXISTS "Admin products insert" ON public.products;
DROP POLICY IF EXISTS "Admin products update" ON public.products;
DROP POLICY IF EXISTS "Admin products delete" ON public.products;

DROP POLICY IF EXISTS "Admin product_collections insert" ON public.product_collections;
DROP POLICY IF EXISTS "Admin product_collections update" ON public.product_collections;
DROP POLICY IF EXISTS "Admin product_collections delete" ON public.product_collections;

-- ----------------------------------------------------------------------------
-- 3. PHÂN QUYỀN ĐỌC CÔNG KHAI (SELECT) DÀNH CHO TẤT CẢ KHÁCH HÀNG (ANON + AUTHENTICATED)
-- Giúp khách hàng xem được toàn bộ Danh mục & Sản phẩm trên Website
-- ----------------------------------------------------------------------------
CREATE POLICY "Public collections select" 
ON public.collections 
FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Public products select" 
ON public.products 
FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Public product_collections select" 
ON public.product_collections 
FOR SELECT 
TO public 
USING (true);

-- ----------------------------------------------------------------------------
-- 4. PHÂN QUYỀN THÊM, SỬA, XÓA (INSERT / UPDATE / DELETE) CHO TRANG QUẢN TRỊ ADMIN
-- ----------------------------------------------------------------------------
-- Bảng Collections (Danh mục)
CREATE POLICY "Admin collections insert" ON public.collections FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admin collections update" ON public.collections FOR UPDATE TO public USING (true);
CREATE POLICY "Admin collections delete" ON public.collections FOR DELETE TO public USING (true);

-- Bảng Products (Sản phẩm)
CREATE POLICY "Admin products insert" ON public.products FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admin products update" ON public.products FOR UPDATE TO public USING (true);
CREATE POLICY "Admin products delete" ON public.products FOR DELETE TO public USING (true);

-- Bảng Product_Collections (Liên kết Sản phẩm - Danh mục)
CREATE POLICY "Admin product_collections insert" ON public.product_collections FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admin product_collections update" ON public.product_collections FOR UPDATE TO public USING (true);
CREATE POLICY "Admin product_collections delete" ON public.product_collections FOR DELETE TO public USING (true);

-- ----------------------------------------------------------------------------
-- 5. PHÂN QUYỀN BẢO MẬT CHO SUPABASE STORAGE (BUCKET "products")
-- Giúp hiển thị ảnh sản phẩm công khai và cho phép Upload/Xóa ảnh từ Admin
-- ----------------------------------------------------------------------------
-- Đảm bảo Bucket 'products' tồn tại và ở chế độ Public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- Xóa các policy cũ của Storage (nếu có)
DROP POLICY IF EXISTS "Public product image select" ON storage.objects;
DROP POLICY IF EXISTS "Public product image insert" ON storage.objects;
DROP POLICY IF EXISTS "Public product image update" ON storage.objects;
DROP POLICY IF EXISTS "Public product image delete" ON storage.objects;

-- Phân quyền cho Storage Objects
CREATE POLICY "Public product image select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

CREATE POLICY "Public product image insert"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'products');

CREATE POLICY "Public product image update"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'products');

CREATE POLICY "Public product image delete"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'products');
