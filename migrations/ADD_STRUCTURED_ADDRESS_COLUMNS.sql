-- ADD_STRUCTURED_ADDRESS_COLUMNS.sql
-- Run this script in the Supabase SQL Editor to add structured address fields.

BEGIN;

-- Add structured address columns to public.leads table
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS personal_flat_no TEXT,
ADD COLUMN IF NOT EXISTS personal_street TEXT,
ADD COLUMN IF NOT EXISTS personal_city TEXT,
ADD COLUMN IF NOT EXISTS personal_state TEXT,
ADD COLUMN IF NOT EXISTS personal_country TEXT,
ADD COLUMN IF NOT EXISTS personal_zip_code TEXT,
ADD COLUMN IF NOT EXISTS business_flat_no TEXT,
ADD COLUMN IF NOT EXISTS business_street TEXT,
ADD COLUMN IF NOT EXISTS business_city TEXT,
ADD COLUMN IF NOT EXISTS business_state TEXT,
ADD COLUMN IF NOT EXISTS business_country TEXT,
ADD COLUMN IF NOT EXISTS business_zip_code TEXT;

-- Add structured address columns to public.customers table
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS personal_flat_no TEXT,
ADD COLUMN IF NOT EXISTS personal_street TEXT,
ADD COLUMN IF NOT EXISTS personal_city TEXT,
ADD COLUMN IF NOT EXISTS personal_state TEXT,
ADD COLUMN IF NOT EXISTS personal_country TEXT,
ADD COLUMN IF NOT EXISTS personal_zip_code TEXT,
ADD COLUMN IF NOT EXISTS business_flat_no TEXT,
ADD COLUMN IF NOT EXISTS business_street TEXT,
ADD COLUMN IF NOT EXISTS business_city TEXT,
ADD COLUMN IF NOT EXISTS business_state TEXT,
ADD COLUMN IF NOT EXISTS business_country TEXT,
ADD COLUMN IF NOT EXISTS business_zip_code TEXT;

-- Reload schema cache so PostgREST registers the columns
NOTIFY pgrst, 'reload schema';

COMMIT;
