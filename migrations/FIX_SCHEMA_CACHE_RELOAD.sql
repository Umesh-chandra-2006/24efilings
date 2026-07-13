-- FIX_SCHEMA_CACHE_RELOAD.sql
-- Run this in Supabase SQL Editor to fix:
-- "Could not find a relationship between 'leads' and 'profiles' in the schema cache"
-- or "column 'assigned_by' referenced in foreign key constraint does not exist"
--
-- This script:
-- 1. Adds all missing CRM columns to the public.leads table if they do not exist
-- 2. Drops and re-creates all FK constraints (ensures they are registered)
-- 3. Notifies PostgREST to reload schema cache immediately

BEGIN;

-- Ensure profiles table has branch columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS branch_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS branch_name TEXT;

-- =========================================================
-- 0. ENSURE COLUMNS EXIST IN LEADS TABLE
-- =========================================================
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS assigned_to UUID;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS assigned_by UUID;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Warm';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'Organic';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS pan_number TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS residential_address TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS business_address TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS admin_id UUID;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS branch_id TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_contacted TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS next_follow_up TIMESTAMPTZ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS total_payment NUMERIC DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS advance_amount NUMERIC DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS remaining_amount NUMERIC DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS payments JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS service_sets JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- =========================================================
-- 1. LEADS TABLE - Foreign Keys to profiles
-- =========================================================
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_assigned_by_fkey;
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_assigned_to_fkey;
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_created_by_fkey;

-- Re-create with ON DELETE SET NULL (safe - preserves lead records)
ALTER TABLE public.leads
  ADD CONSTRAINT leads_assigned_by_fkey
  FOREIGN KEY (assigned_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.leads
  ADD CONSTRAINT leads_assigned_to_fkey
  FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.leads
  ADD CONSTRAINT leads_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- =========================================================
-- 2. CUSTOMERS TABLE - Foreign Keys to profiles
-- =========================================================
-- Make sure columns exist on customers table as well
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS assigned_to UUID;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS created_by UUID;

ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_assigned_to_fkey;
ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_created_by_fkey;

ALTER TABLE public.customers
  ADD CONSTRAINT customers_assigned_to_fkey
  FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.customers
  ADD CONSTRAINT customers_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- =========================================================
-- 3. WEB_LEADS TABLE - Foreign Key to profiles (assigned_to)
-- =========================================================
-- Make sure web_leads table exists and has assigned_to column
CREATE TABLE IF NOT EXISTS public.web_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    service_interested TEXT,
    message TEXT,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Contacted', 'Converted', 'Spam')) NOT NULL,
    assigned_to UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.web_leads DROP CONSTRAINT IF EXISTS web_leads_assigned_to_fkey;

ALTER TABLE public.web_leads
  ADD CONSTRAINT web_leads_assigned_to_fkey
  FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- =========================================================
-- 4. Force PostgREST to reload schema cache immediately
-- =========================================================
NOTIFY pgrst, 'reload schema';

COMMIT;
