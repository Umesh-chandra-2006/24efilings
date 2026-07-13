-- SEED_AND_FIX_SERVICES.sql
-- Run this in your Supabase SQL Editor to seed the services and ensure proper read permissions.

BEGIN;

-- 1. Create services table if not exists
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create sub_services table if not exists
CREATE TABLE IF NOT EXISTS public.sub_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC DEFAULT 0,
    required_documents TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(service_id, name)
);

-- 3. Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_services ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "View Services" ON public.services;
DROP POLICY IF EXISTS "View SubServices" ON public.sub_services;
DROP POLICY IF EXISTS "Manage Services" ON public.services;
DROP POLICY IF EXISTS "Manage SubServices" ON public.sub_services;

-- 5. Create permissive read policies for authenticated users
CREATE POLICY "View Services" ON public.services FOR SELECT TO authenticated USING (true);
CREATE POLICY "View SubServices" ON public.sub_services FOR SELECT TO authenticated USING (true);

-- 6. Create manage policies for admins
CREATE POLICY "Manage Services" ON public.services FOR ALL TO authenticated USING (
    exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role IN ('Super Admin', 'Admin')
    )
);

CREATE POLICY "Manage SubServices" ON public.sub_services FOR ALL TO authenticated USING (
    exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role IN ('Super Admin', 'Admin')
    )
);

-- 7. Define the seeding function with SECURITY DEFINER (Bypasses RLS during seeding)
CREATE OR REPLACE FUNCTION public.seed_services() 
RETURNS void 
SECURITY DEFINER
AS $$
DECLARE
    s_id UUID;
BEGIN
    -- STARTUP
    INSERT INTO public.services (name) VALUES ('STARTUP') ON CONFLICT (name) DO UPDATE SET is_active = true RETURNING id INTO s_id;
    INSERT INTO public.sub_services (service_id, name, price) VALUES 
        (s_id, 'Partnership Firm', 1999), (s_id, 'Proprietorship Firm', 999), (s_id, 'Public Limited Company', 14999), (s_id, 'Private Limited Company', 5999),
        (s_id, 'OPC, One Person Company', 4999), (s_id, 'LLP, Limited Liability Partnership', 3999), (s_id, 'Trust Registration', 7999),
        (s_id, 'Indian Subsidiary', 19999), (s_id, 'Producer Company', 12999), (s_id, 'Section 8 Company', 9999)
    ON CONFLICT (service_id, name) DO UPDATE SET price = EXCLUDED.price;

    -- Licenses & Registrations
    INSERT INTO public.services (name) VALUES ('Licenses & Registrations') ON CONFLICT (name) DO UPDATE SET is_active = true RETURNING id INTO s_id;
    INSERT INTO public.sub_services (service_id, name, price) VALUES 
        (s_id, 'Startup India', 2999), (s_id, 'Drug License', 11999), (s_id, 'Trade License', 1999), (s_id, 'FSSAI License', 2999), (s_id, 'Fire License', 4999),
        (s_id, 'PF Registration', 1499), (s_id, 'ESI Registration', 1499), (s_id, 'TAN Registration', 499), (s_id, 'PAN Registration', 199),
        (s_id, '12A Registration', 4999), (s_id, '80G Registration', 4999), (s_id, 'ISO Registration', 2999), (s_id, 'Digital Signature', 999),
        (s_id, 'Darpan Registration', 2499), (s_id, 'Barcode Registration', 4999), (s_id, 'Udyam Registration', 499), (s_id, 'Shop Act Registration', 999),
        (s_id, 'IEC (Import Export Code)', 1499), (s_id, 'Halal License & Certification', 7999), (s_id, 'Professional Tax Registration', 1499)
    ON CONFLICT (service_id, name) DO UPDATE SET price = EXCLUDED.price;

    -- IP & TRADEMARK
    INSERT INTO public.services (name) VALUES ('IP & TRADEMARK') ON CONFLICT (name) DO UPDATE SET is_active = true RETURNING id INTO s_id;
    INSERT INTO public.sub_services (service_id, name, price) VALUES 
        (s_id, 'Trademark Registration', 1999), (s_id, 'Trademark Objection', 2999), (s_id, 'Trademark Renewal', 4999), (s_id, 'TRADEMARK HIRING', 999),
        (s_id, 'Copyright Registration', 4999), (s_id, 'Patent Registration', 19999), (s_id, 'Design Registration', 5999), (s_id, 'Logo Design', 1499)
    ON CONFLICT (service_id, name) DO UPDATE SET price = EXCLUDED.price;

    -- GST Registrations
    INSERT INTO public.services (name) VALUES ('GST Registrations') ON CONFLICT (name) DO UPDATE SET is_active = true RETURNING id INTO s_id;
    INSERT INTO public.sub_services (service_id, name, price) VALUES 
       (s_id, 'GST Registration', 499), (s_id, 'GST Return Filing', 299), (s_id, 'GST LUT Form', 499), (s_id, 'GST Revocation', 1499),
       (s_id, 'GST Notice', 999), (s_id, 'GST Amendment', 499), (s_id, 'GST Cancellation', 499)
    ON CONFLICT (service_id, name) DO UPDATE SET price = EXCLUDED.price;

    -- Income Registrations
    INSERT INTO public.services (name) VALUES ('Income Registrations') ON CONFLICT (name) DO UPDATE SET is_active = true RETURNING id INTO s_id;
    INSERT INTO public.sub_services (service_id, name, price) VALUES 
        (s_id, 'Income Tax E-Filing', 499), (s_id, 'ITR-1 Return Filing', 499), (s_id, 'ITR-2 Return Filing', 999), (s_id, 'ITR-3 Return Filing', 1999),
        (s_id, 'ITR-4 Return Filing', 1499), (s_id, 'ITR-5 Return Filing', 2499), (s_id, 'ITR-6 Return Filing', 4999), (s_id, 'ITR-7 Return Filing', 4999),
        (s_id, '15CA - 15CB Filing', 2499), (s_id, 'TDS Return Filing', 999), (s_id, 'Income Tax Notice', 1499)
    ON CONFLICT (service_id, name) DO UPDATE SET price = EXCLUDED.price;

    -- MCA Compliances
    INSERT INTO public.services (name) VALUES ('MCA Compliances') ON CONFLICT (name) DO UPDATE SET is_active = true RETURNING id INTO s_id;
    INSERT INTO public.sub_services (service_id, name, price) VALUES 
        (s_id, 'Demat of Shares', 2999), (s_id, 'LLP Compliance', 3999), (s_id, 'OPC Compliance', 3999), (s_id, 'Company Compliance', 7999),
        (s_id, 'Proprietorship to Pvt Ltd Company', 6999), (s_id, 'Convert Partnership into LLP Company', 5999),
        (s_id, 'Convert Private into Public Limited Company', 12999), (s_id, 'Convert Private into OPC Company', 4999),
        (s_id, 'Winding Up - LLP', 7999), (s_id, 'Winding Up - Company', 14999), (s_id, 'ADT-1 Filing', 999), (s_id, 'DPT-3 Filing', 1499),
        (s_id, 'LLP Form 11 Filing', 999), (s_id, 'Dormant Status Filing', 2999), (s_id, 'Annual Compliance Services', 9999)
    ON CONFLICT (service_id, name) DO UPDATE SET price = EXCLUDED.price;

    -- Legal Services
    INSERT INTO public.services (name) VALUES ('Legal Services') ON CONFLICT (name) DO UPDATE SET is_active = true RETURNING id INTO s_id;
    INSERT INTO public.sub_services (service_id, name, price) VALUES 
        (s_id, 'Lawyers Specialization', 0), (s_id, 'Finance Lawyers', 0), (s_id, 'Cheque Bounce Lawyers', 0), (s_id, 'Civil Lawyers', 0),
        (s_id, 'Consumer Protection Lawyers', 0), (s_id, 'Contract Lawyers', 0), (s_id, 'Corporate Lawyers', 0), (s_id, 'Criminal Lawyers', 0),
        (s_id, 'Cyber Crime Lawyers', 0), (s_id, 'Property Lawyers', 0), (s_id, 'Divorce Lawyers', 0), (s_id, 'Family Lawyers', 0), (s_id, 'GST Lawyers', 0),
        (s_id, 'Intellectual Property Lawyers', 0), (s_id, 'Labour Lawyers', 0), (s_id, 'Money Recovery Lawyers', 0),
        (s_id, 'Motor Accident Lawyers', 0), (s_id, 'Muslim Law Lawyers', 0)
    ON CONFLICT (service_id, name) DO UPDATE SET price = EXCLUDED.price;

    -- Legal Documents
    INSERT INTO public.services (name) VALUES ('Legal Documents') ON CONFLICT (name) DO UPDATE SET is_active = true RETURNING id INTO s_id;
    INSERT INTO public.sub_services (service_id, name, price) VALUES 
        (s_id, 'Free Legal Documents', 0), (s_id, 'All Legal Documents', 0), (s_id, 'Rental Agreement', 299),
        (s_id, 'Commercial Rental Agreement', 999), (s_id, 'Experience Letter', 199), (s_id, 'Appointment Letter', 299), (s_id, 'Affidavit Format', 99),
        (s_id, 'Power Of Attorney', 499), (s_id, 'Income Certificate', 199), (s_id, 'No Objection Certificate', 199), (s_id, 'Salary Slip', 99),
        (s_id, 'Resignation Letter', 99), (s_id, 'Legal Heir Certificate', 999), (s_id, 'Relieving Letter', 99), (s_id, 'Bonafide Certificate', 99),
        (s_id, 'Partnership Deed', 999), (s_id, 'GST Invoice', 99), (s_id, 'Authorised Signatory In GST', 199), (s_id, 'Delivery Challan', 99),
        (s_id, 'Offer Letter', 199), (s_id, 'Consent Letter For GST Registration', 199), (s_id, 'Rent Receipt', 99)
    ON CONFLICT (service_id, name) DO UPDATE SET price = EXCLUDED.price;

    -- Company Changes
    INSERT INTO public.services (name) VALUES ('Company Changes') ON CONFLICT (name) DO UPDATE SET is_active = true RETURNING id INTO s_id;
    INSERT INTO public.sub_services (service_id, name, price) VALUES 
        (s_id, 'Director Change', 1999), (s_id, 'Remove Director', 1999), (s_id, 'MOA Amendment', 2999), (s_id, 'AOA Amendment', 2999), (s_id, 'Share Transfer', 2499),
        (s_id, 'DIN eKYC Filing', 499), (s_id, 'DIN Reactivation', 1999), (s_id, 'Name Change - Company', 4999), (s_id, 'Registered Office Change', 2999),
        (s_id, 'Commencement (INC-2A)', 999), (s_id, 'Authorized Capital Increase', 3999)
    ON CONFLICT (service_id, name) DO UPDATE SET price = EXCLUDED.price;
END;
$$ LANGUAGE plpgsql;

-- 8. Run the Seeder
SELECT public.seed_services();

COMMIT;

-- 9. Refresh configuration cache
NOTIFY pgrst, 'reload config';
