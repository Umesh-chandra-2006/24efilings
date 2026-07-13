-- ADD_LEAD_SOURCES.sql
-- Run this script in the Supabase SQL Editor to add the Lead Sources master table, columns, and data migration.

BEGIN;

-- 1. Create Lead Sources Master Table
CREATE TABLE IF NOT EXISTS public.lead_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_name TEXT UNIQUE NOT NULL,
    source_code TEXT UNIQUE NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Seed Lead Sources with Stable UUID for 'Other' to allow default references
-- Update any existing 'Other' record to have our stable UUID to avoid foreign key violations
UPDATE public.lead_sources 
SET id = '33333333-3333-3333-3333-333333333333' 
WHERE source_name = 'Other';

INSERT INTO public.lead_sources (id, source_name, source_code, description) VALUES 
('33333333-3333-3333-3333-333333333333', 'Other', 'OTHER', 'Default fallback source')
ON CONFLICT (source_name) DO NOTHING;

-- Seed the core required and optional Lead Sources
INSERT INTO public.lead_sources (source_name, source_code, description) VALUES 
('Advertisement', 'ADVERTISEMENT', 'Paid or organic advertisements'),
('Cold Calling', 'COLD_CALLING', 'Direct outbound calls to potential clients'),
('Employer Referral', 'EMPLOYER_REFERRAL', 'Referrals from employers or internal employees'),
('Customer Referral', 'CUSTOMER_REFERRAL', 'Referrals from existing customers'),
('Facebook & Meta', 'FACEBOOK_META', 'Leads from Facebook, Instagram, or Meta Ads'),
('WhatsApp Campaign', 'WHATSAPP_CAMPAIGN', 'Leads from WhatsApp marketing campaigns'),
('Mobile App', 'MOBILE_APP', 'Leads generated via mobile application'),
('Website', 'WEBSITE', 'Organic inquiries through the website contact form'),
('Instagram', 'INSTAGRAM', 'Leads from Instagram profile or posts'),
('Google Ads', 'GOOGLE_ADS', 'Leads from Google PPC ads'),
('LinkedIn', 'LINKEDIN', 'Leads from LinkedIn profile or ads'),
('YouTube', 'YOUTUBE', 'Leads from YouTube videos or ads'),
('Email Campaign', 'EMAIL_CAMPAIGN', 'Leads from email newsletters or campaigns'),
('Walk-In Customer', 'WALK_IN_CUSTOMER', 'Customers who directly walked into a branch'),
('Telecalling', 'TELECALLING', 'Inbound or general telecalling services'),
('Branch Referral', 'BRANCH_REFERRAL', 'Referrals from other branches'),
('Partner Referral', 'PARTNER_REFERRAL', 'Referrals from external business partners'),
('Existing Customer', 'EXISTING_CUSTOMER', 'Additional services requested by an existing customer'),
('Organic Search', 'ORGANIC_SEARCH', 'Found via search engines search results')
ON CONFLICT (source_name) DO NOTHING;

-- 3. Add Columns to leads and customers tables
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS lead_source_id UUID REFERENCES public.lead_sources(id) ON DELETE SET NULL DEFAULT '33333333-3333-3333-3333-333333333333',
ADD COLUMN IF NOT EXISTS referred_by_customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS referred_by_employee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS lead_source_id UUID REFERENCES public.lead_sources(id) ON DELETE SET NULL DEFAULT '33333333-3333-3333-3333-333333333333',
ADD COLUMN IF NOT EXISTS referred_by_customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS referred_by_employee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 4. Migrate Existing Records safely
-- Map existing leads source string to lead_sources matching UUID
UPDATE public.leads l
SET lead_source_id = ls.id
FROM public.lead_sources ls
WHERE LOWER(TRIM(l.source)) = LOWER(TRIM(ls.source_name))
   OR (LOWER(TRIM(l.source)) = 'cold call' AND ls.source_code = 'COLD_CALLING')
   OR (LOWER(TRIM(l.source)) = 'social media' AND ls.source_code = 'FACEBOOK_META')
   OR (LOWER(TRIM(l.source)) = 'new lead' AND ls.source_code = 'OTHER')
   OR (LOWER(TRIM(l.source)) = 'referral' AND ls.source_code = 'CUSTOMER_REFERRAL');

-- Map existing customers lead_source string to lead_sources matching UUID
UPDATE public.customers c
SET lead_source_id = ls.id
FROM public.lead_sources ls
WHERE LOWER(TRIM(c.lead_source)) = LOWER(TRIM(ls.source_name))
   OR (LOWER(TRIM(c.lead_source)) = 'cold call' AND ls.source_code = 'COLD_CALLING')
   OR (LOWER(TRIM(c.lead_source)) = 'social media' AND ls.source_code = 'FACEBOOK_META')
   OR (LOWER(TRIM(c.lead_source)) = 'new lead' AND ls.source_code = 'OTHER')
   OR (LOWER(TRIM(c.lead_source)) = 'referral' AND ls.source_code = 'CUSTOMER_REFERRAL');

-- Ensure all leads and customers have a valid default lead_source_id
UPDATE public.leads SET lead_source_id = '33333333-3333-3333-3333-333333333333' WHERE lead_source_id IS NULL;
UPDATE public.customers SET lead_source_id = '33333333-3333-3333-3333-333333333333' WHERE lead_source_id IS NULL;

-- 5. Enable Row Level Security (RLS) on lead_sources
ALTER TABLE public.lead_sources ENABLE ROW LEVEL SECURITY;

-- 6. Configure RLS Policies
-- Allow SELECT for all authenticated users
DROP POLICY IF EXISTS "Allow Select Lead Sources" ON public.lead_sources;
CREATE POLICY "Allow Select Lead Sources" ON public.lead_sources FOR SELECT TO authenticated USING (true);

-- Allow Admin/Super Admin to manage lead sources
DROP POLICY IF EXISTS "Manage Lead Sources" ON public.lead_sources;
CREATE POLICY "Manage Lead Sources" ON public.lead_sources FOR ALL TO authenticated USING (
    exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role IN ('Super Admin', 'Admin')
    )
);

-- 7. Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';

COMMIT;
