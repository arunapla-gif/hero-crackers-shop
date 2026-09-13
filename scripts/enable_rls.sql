-- ==========================================================
-- HERO CRACKERS - SUPABASE ROW-LEVEL SECURITY (RLS) POLICIES
-- Schema: shop
-- ==========================================================

-- 1. Ensure RLS is enabled on all tables in the "shop" schema
ALTER TABLE IF EXISTS "shop"."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "shop"."Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "shop"."Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "shop"."Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "shop"."OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "shop"."Godown" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "shop"."GodownStock" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "shop"."ReferenceMaster" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "shop"."TransportMaster" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "shop"."Expense" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "shop"."CustomerMaster" ENABLE ROW LEVEL SECURITY;

-- 2. Public Read Access: Active Products and Categories can be viewed by public storefront
DROP POLICY IF EXISTS "Public can view products" ON "shop"."Product";
CREATE POLICY "Public can view products" ON "shop"."Product"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view categories" ON "shop"."Category";
CREATE POLICY "Public can view categories" ON "shop"."Category"
  FOR SELECT USING (true);

-- 3. Deny direct public/anon access to sensitive tables:
-- Note: The Next.js server connects using the PostgreSQL connection string as the superuser/service role,
-- which automatically bypasses RLS for authoritative server-side operations.
-- Any direct access via Supabase anon key to User, Order, Expense, or CustomerMaster is strictly blocked.
