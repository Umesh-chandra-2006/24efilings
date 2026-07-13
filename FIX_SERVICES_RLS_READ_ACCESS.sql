-- FIX: Grant all authenticated users SELECT access to services and sub_services tables.
-- This fixes the issue where Sales Executives see an empty services list when creating leads.
-- Run this in your Supabase SQL Editor.

-- Services table: allow all authenticated users to read
DO $$
BEGIN
  -- Drop existing conflicting policy if any
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'services' 
    AND policyname = 'services_read_all'
  ) THEN
    DROP POLICY "services_read_all" ON public.services;
  END IF;
END $$;

CREATE POLICY "services_read_all"
  ON public.services
  FOR SELECT
  TO authenticated
  USING (true);

-- Sub-services table: allow all authenticated users to read
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'sub_services' 
    AND policyname = 'sub_services_read_all'
  ) THEN
    DROP POLICY "sub_services_read_all" ON public.sub_services;
  END IF;
END $$;

CREATE POLICY "sub_services_read_all"
  ON public.sub_services
  FOR SELECT
  TO authenticated
  USING (true);

-- Offers table: allow all authenticated users to read (for applying promo codes in Create Lead)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'offers' 
    AND policyname = 'offers_read_all'
  ) THEN
    DROP POLICY "offers_read_all" ON public.offers;
  END IF;
END $$;

CREATE POLICY "offers_read_all"
  ON public.offers
  FOR SELECT
  TO authenticated
  USING (true);

-- Verify policies were created
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename IN ('services', 'sub_services', 'offers')
ORDER BY tablename, policyname;
