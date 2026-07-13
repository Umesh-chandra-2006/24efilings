BEGIN;

-- 1. Ensure table exists
CREATE TABLE IF NOT EXISTS public.organization_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT,
    company_address TEXT,
    company_email TEXT,
    company_phone TEXT,
    lead_sources JSONB DEFAULT '["Website", "Referral", "Cold Call", "Social Media", "Email Campaign"]'::jsonb,
    billing_info JSONB DEFAULT '{"gstRate": "18", "bankName": "", "accountNumber": "", "ifscCode": ""}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;

-- 3. Re-create Policies
DROP POLICY IF EXISTS "Settings Read Access" ON public.organization_settings;
DROP POLICY IF EXISTS "Settings Insert Access" ON public.organization_settings;
DROP POLICY IF EXISTS "Settings Update Access" ON public.organization_settings;
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.organization_settings;
DROP POLICY IF EXISTS "Allow admin update access" ON public.organization_settings;
DROP POLICY IF EXISTS "Allow super admin insert access" ON public.organization_settings;

-- Read: All authenticated users
CREATE POLICY "Settings Read Access" ON public.organization_settings
    FOR SELECT USING (auth.role() = 'authenticated');

-- Insert: Super Admin only
CREATE POLICY "Settings Insert Access" ON public.organization_settings
    FOR INSERT WITH CHECK (
       EXISTS (
         SELECT 1 FROM public.profiles
         WHERE profiles.id = auth.uid()
         AND profiles.role = 'Super Admin'
       )
    );

-- Update: Admin & Super Admin
CREATE POLICY "Settings Update Access" ON public.organization_settings
    FOR UPDATE USING (
       EXISTS (
         SELECT 1 FROM public.profiles
         WHERE profiles.id = auth.uid()
         AND profiles.role IN ('Super Admin', 'Admin')
       )
    );

COMMIT;
