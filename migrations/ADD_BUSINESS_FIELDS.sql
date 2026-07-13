-- ADD_BUSINESS_FIELDS.sql
-- Run this script in the Supabase SQL Editor to add master tables and columns for Business Category and Industry Type.

BEGIN;

-- 1. Create Master Tables
CREATE TABLE IF NOT EXISTS public.business_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.industry_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Seed Master Tables with Stable UUID for 'Other' to allow default references
INSERT INTO public.business_categories (id, name, description) VALUES 
('11111111-1111-1111-1111-111111111111', 'Other', 'Default fallback category')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.business_categories (name) VALUES 
('Proprietorship'),
('Partnership Firm'),
('One Person Company (OPC)'),
('Private Limited Company'),
('Public Limited Company'),
('Limited Liability Partnership (LLP)'),
('Section 8 Company'),
('Trust Registration'),
('Society Registration'),
('NGO Registration'),
('Startup Registration'),
('MSME Registration'),
('GST Registration'),
('Trademark Registration'),
('Import Export Code (IEC)'),
('FSSAI Registration'),
('Professional Tax Registration'),
('Shop & Establishment Registration'),
('Trade License')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.industry_types (id, name, description) VALUES 
('22222222-2222-2222-2222-222222222222', 'Other', 'Default fallback industry')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.industry_types (name) VALUES 
('Healthcare'),
('Information Technology (IT)'),
('Software Development'),
('Construction'),
('Transport & Logistics'),
('Manufacturing'),
('Retail'),
('E-Commerce'),
('Education'),
('Finance & Banking'),
('Insurance'),
('Real Estate'),
('Hospitality'),
('Travel & Tourism'),
('Food & Beverage'),
('Agriculture'),
('Pharmaceuticals'),
('Telecommunications'),
('Media & Entertainment'),
('Marketing & Advertising'),
('Consulting Services'),
('Legal Services'),
('Automobile'),
('Textiles & Garments'),
('Electronics'),
('Energy & Utilities'),
('Mining'),
('Import & Export'),
('Warehousing'),
('Security Services'),
('Event Management'),
('Beauty & Wellness'),
('Fitness & Sports'),
('NGO / Non-Profit'),
('Government Services')
ON CONFLICT (name) DO NOTHING;

-- 3. Add Columns to leads and customers tables
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS business_category_id UUID REFERENCES public.business_categories(id) ON DELETE SET NULL DEFAULT '11111111-1111-1111-1111-111111111111',
ADD COLUMN IF NOT EXISTS industry_type_id UUID REFERENCES public.industry_types(id) ON DELETE SET NULL DEFAULT '22222222-2222-2222-2222-222222222222';

ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS business_category_id UUID REFERENCES public.business_categories(id) ON DELETE SET NULL DEFAULT '11111111-1111-1111-1111-111111111111',
ADD COLUMN IF NOT EXISTS industry_type_id UUID REFERENCES public.industry_types(id) ON DELETE SET NULL DEFAULT '22222222-2222-2222-2222-222222222222';

-- 4. Migrate Existing Records (Set Default Reference)
UPDATE public.leads SET business_category_id = '11111111-1111-1111-1111-111111111111' WHERE business_category_id IS NULL;
UPDATE public.leads SET industry_type_id = '22222222-2222-2222-2222-222222222222' WHERE industry_type_id IS NULL;

UPDATE public.customers SET business_category_id = '11111111-1111-1111-1111-111111111111' WHERE business_category_id IS NULL;
UPDATE public.customers SET industry_type_id = '22222222-2222-2222-2222-222222222222' WHERE industry_type_id IS NULL;

-- 5. Enable RLS
ALTER TABLE public.business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_types ENABLE ROW LEVEL SECURITY;

-- 6. Configure RLS Policies
-- Allow SELECT for all authenticated users
CREATE POLICY "Allow Select Business Categories" ON public.business_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow Select Industry Types" ON public.industry_types FOR SELECT TO authenticated USING (true);

-- Allow Admin/Super Admin to manage
CREATE POLICY "Manage Business Categories" ON public.business_categories FOR ALL TO authenticated USING (
    exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role IN ('Super Admin', 'Admin')
    )
);

CREATE POLICY "Manage Industry Types" ON public.industry_types FOR ALL TO authenticated USING (
    exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role IN ('Super Admin', 'Admin')
    )
);

-- 7. Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

COMMIT;
