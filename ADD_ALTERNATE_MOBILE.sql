-- ============================================================
-- ADD ALTERNATE MOBILE NUMBER FIELDS
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Add alternate_mobile and alternate_is_whatsapp to leads table
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS alternate_mobile TEXT,
  ADD COLUMN IF NOT EXISTS alternate_is_whatsapp BOOLEAN DEFAULT FALSE;

-- 2. Add alternate_mobile and alternate_is_whatsapp to customers table
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS alternate_mobile TEXT,
  ADD COLUMN IF NOT EXISTS alternate_is_whatsapp BOOLEAN DEFAULT FALSE;

-- 3. Refresh schema cache so PostgREST picks up the new columns
NOTIFY pgrst, 'reload schema';

-- Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name IN ('leads', 'customers')
  AND column_name IN ('alternate_mobile', 'alternate_is_whatsapp')
ORDER BY table_name, column_name;
