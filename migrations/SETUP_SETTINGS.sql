-- Create a table for global organization settings
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

-- Ensure only one row exists or RLS allows access
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read settings
CREATE POLICY "Allow authenticated read access" ON public.organization_settings
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow Admins and Super Admins to update settings
CREATE POLICY "Allow admin update access" ON public.organization_settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('Super Admin', 'Admin')
        )
    );

-- Allow Super Admin to insert (only initially needed)
CREATE POLICY "Allow super admin insert access" ON public.organization_settings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'Super Admin'
        )
    );

-- Add notification preferences to profiles if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'notification_preferences') THEN
        ALTER TABLE public.profiles ADD COLUMN notification_preferences JSONB DEFAULT '{"email": true, "push": false}'::jsonb;
    END IF;
END $$;
