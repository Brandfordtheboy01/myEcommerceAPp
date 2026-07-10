-- Run in Supabase SQL Editor if coupons table already exists without vendor_id
ALTER TABLE coupons
  ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_coupons_vendor ON coupons(vendor_id);

-- Optional: delete legacy admin coupons with no vendor before enforcing NOT NULL
-- DELETE FROM coupons WHERE vendor_id IS NULL;

-- ALTER TABLE coupons ALTER COLUMN vendor_id SET NOT NULL;

DROP POLICY IF EXISTS "coupons_admin" ON coupons;
CREATE POLICY "coupons_public" ON coupons FOR SELECT USING (is_active = true);
CREATE POLICY "coupons_vendor_own" ON coupons FOR ALL USING (public.is_vendor_user(vendor_id))
  WITH CHECK (public.is_vendor_user(vendor_id));
CREATE POLICY "coupons_admin" ON coupons FOR ALL USING (public.is_admin());
