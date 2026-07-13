BEGIN;

-- 1. Ensure the table exists with all columns
CREATE TABLE IF NOT EXISTS public.organization_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT,
    company_address TEXT,
    company_email TEXT,
    company_phone TEXT,
    lead_sources JSONB DEFAULT '["Website", "Referral", "Cold Call", "Social Media", "Email Campaign"]'::jsonb,
    billing_info JSONB DEFAULT '{"gstRate": "18", "bankName": "", "accountNumber": "", "ifscCode": ""}'::jsonb,
    company_meta JSONB DEFAULT '{"gstin": "", "pan": "", "cin": "", "website": ""}'::jsonb,
    branding_settings JSONB DEFAULT '{"logo_light": "", "logo_dark": "", "primary_color": "#1c398e"}'::jsonb,
    regional_settings JSONB DEFAULT '{"currency": "INR", "timezone": "Asia/Kolkata", "date_format": "DD/MM/YYYY"}'::jsonb,
    notification_rules JSONB DEFAULT '[]'::jsonb,
    lead_settings JSONB DEFAULT '{"auto_assign": false, "statuses": ["New Lead", "Lead Confirmed", "Documents & Payments", "In-Progress", "Success", "Lost"]}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Insert a default row if table is empty (Bootstrapping to avoid INSERT RLS issues from frontend)
INSERT INTO public.organization_settings (company_name)
SELECT 'My Company'
WHERE NOT EXISTS (SELECT 1 FROM public.organization_settings);

-- 3. Reset RLS Policies to be robust
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Settings Read Access" ON public.organization_settings;
DROP POLICY IF EXISTS "Settings Insert Access" ON public.organization_settings;
DROP POLICY IF EXISTS "Settings Update Access" ON public.organization_settings;
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.organization_settings;
DROP POLICY IF EXISTS "Allow admin update access" ON public.organization_settings;
DROP POLICY IF EXISTS "Allow super admin insert access" ON public.organization_settings;

-- READ: Everyone authenticated can read
CREATE POLICY "Settings Read Access" ON public.organization_settings
    FOR SELECT USING (auth.role() = 'authenticated');

-- UPDATE: Admins and Super Admins
CREATE POLICY "Settings Update Access" ON public.organization_settings
    FOR UPDATE USING (
       EXISTS (
         SELECT 1 FROM public.profiles
         WHERE profiles.id = auth.uid()
         AND profiles.role IN ('Super Admin', 'Admin')
       )
    );

-- INSERT: Super Admin only (though we just inserted a default row, so this is rarely used)
CREATE POLICY "Settings Insert Access" ON public.organization_settings
    FOR INSERT WITH CHECK (
       EXISTS (
         SELECT 1 FROM public.profiles
         WHERE profiles.id = auth.uid()
         AND profiles.role = 'Super Admin'
       )
    );

COMMIT;
