-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create sub_services table
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

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_services ENABLE ROW LEVEL SECURITY;

-- Policies for services through profiles role check (similar to leads)
-- View: Authenticated users
CREATE POLICY "View Services" ON public.services FOR SELECT TO authenticated USING (true);
CREATE POLICY "View SubServices" ON public.sub_services FOR SELECT TO authenticated USING (true);

-- Manage: Super Admin and Admin only
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

-- Seed Data function
CREATE OR REPLACE FUNCTION seed_services() RETURNS void AS $$
DECLARE
    s_id UUID;
BEGIN
    -- STARTUP
    INSERT INTO public.services (name) VALUES ('STARTUP') ON CONFLICT (name) DO UPDATE SET is_active = true RETURNING id INTO s_id;
    INSERT INTO public.sub_services (service_id, name) VALUES 
        (s_id, 'Partnership Firm'), (s_id, 'Proprietorship Firm'), (s_id, 'Public Limited Company'), (s_id, 'Private Limited Company'),
        (s_id, 'OPC, One Person Company'), (s_id, 'LLP, Limited Liability Partnership'), (s_id, 'Trust Registration'),
        (s_id, 'Indian Subsidiary'), (s_id, 'Producer Company'), (s_id, 'Section 8 Company')
    ON CONFLICT (service_id, name) DO NOTHING;

    -- Licenses & Registrations
    INSERT INTO public.services (name) VALUES ('Licenses & Registrations') ON CONFLICT (name) DO UPDATE SET is_active = true RETURNING id INTO s_id;
    INSERT INTO public.sub_services (service_id, name) VALUES 
        (s_id, 'Startup India'), (s_id, 'Drug License'), (s_id, 'Trade License'), (s_id, 'FSSAI License'), (s_id, 'Fire License'),
        (s_id, 'PF Registration'), (s_id, 'ESI Registration'), (s_id, 'TAN Registration'), (s_id, 'PAN Registration'),
        (s_id, '12A Registration'), (s_id, '80G Registration'), (s_id, 'ISO Registration'), (s_id, 'Digital Signature'),
        (s_id, 'Darpan Registration'), (s_id, 'Barcode Registration'), (s_id, 'Udyam Registration'), (s_id, 'Shop Act Registration'),
        (s_id, 'IEC (Import Export Code)'), (s_id, 'Halal License & Certification'), (s_id, 'Professional Tax Registration')
    ON CONFLICT (service_id, name) DO NOTHING;

    -- IP & TRADEMARK
    INSERT INTO public.services (name) VALUES ('IP & TRADEMARK') ON CONFLICT (name) DO UPDATE SET is_active = true RETURNING id INTO s_id;
    INSERT INTO public.sub_services (service_id, name) VALUES 
        (s_id, 'Trademark Registration'), (s_id, 'Trademark Objection'), (s_id, 'Trademark Renewal'), (s_id, 'TRADEMARK HIRING'),
        (s_id, 'Copyright Registration'), (s_id, 'Patent Registration'), (s_id, 'Design Registration'), (s_id, 'Logo Design')
    ON CONFLICT (service_id, name) DO NOTHING;

    -- GST Registrations
    INSERT INTO public.services (name) VALUES ('GST Registrations') ON CONFLICT (name) DO UPDATE SET is_active = true RETURNING id INTO s_id;
    INSERT INTO public.sub_services (service_id, name) VALUES 
       (s_id, 'GST Registration'), (s_id, 'GST Return Filing'), (s_id, 'GST LUT Form'), (s_id, 'GST Revocation'),
       (s_id, 'GST Notice'), (s_id, 'GST Amendment'), (s_id, 'GST Cancellation')
    ON CONFLICT (service_id, name) DO NOTHING;

    -- Income Registrations
    INSERT INTO public.services (name) VALUES ('Income Registrations') ON CONFLICT (name) DO UPDATE SET is_active = true RETURNING id INTO s_id;
    INSERT INTO public.sub_services (service_id, name) VALUES 
        (s_id, 'Income Tax E-Filing'), (s_id, 'ITR-1 Return Filing'), (s_id, 'ITR-2 Return Filing'), (s_id, 'ITR-3 Return Filing'),
        (s_id, 'ITR-4 Return Filing'), (s_id, 'ITR-5 Return Filing'), (s_id, 'ITR-6 Return Filing'), (s_id, 'ITR-7 Return Filing'),
        (s_id, '15CA - 15CB Filing'), (s_id, 'TDS Return Filing'), (s_id, 'Income Tax Notice')
    ON CONFLICT (service_id, name) DO NOTHING;

    -- MCA Compliances
    INSERT INTO public.services (name) VALUES ('MCA Compliances') ON CONFLICT (name) DO UPDATE SET is_active = true RETURNING id INTO s_id;
    INSERT INTO public.sub_services (service_id, name) VALUES 
        (s_id, 'Demat of Shares'), (s_id, 'LLP Compliance'), (s_id, 'OPC Compliance'), (s_id, 'Company Compliance'),
        (s_id, 'Proprietorship to Pvt Ltd Company'), (s_id, 'Convert Partnership into LLP Company'),
        (s_id, 'Convert Private into Public Limited Company'), (s_id, 'Convert Private into OPC Company'),
        (s_id, 'Winding Up - LLP'), (s_id, 'Winding Up - Company'), (s_id, 'ADT-1 Filing'), (s_id, 'DPT-3 Filing'),
        (s_id, 'LLP Form 11 Filing'), (s_id, 'Dormant Status Filing'), (s_id, 'Annual Compliance Services')
    ON CONFLICT (service_id, name) DO NOTHING;

    -- Legal Services
    INSERT INTO public.services (name) VALUES ('Legal Services') ON CONFLICT (name) DO UPDATE SET is_active = true RETURNING id INTO s_id;
    INSERT INTO public.sub_services (service_id, name) VALUES 
        (s_id, 'Lawyers Specialization'), (s_id, 'Finance Lawyers'), (s_id, 'Cheque Bounce Lawyers'), (s_id, 'Civil Lawyers'),
        (s_id, 'Consumer Protection Lawyers'), (s_id, 'Contract Lawyers'), (s_id, 'Corporate Lawyers'), (s_id, 'Criminal Lawyers'),
        (s_id, 'Cyber Crime Lawyers'), (s_id, 'Property Lawyers'), (s_id, 'Divorce Lawyers'), (s_id, 'Family Lawyers'), (s_id, 'GST Lawyers'),
        (s_id, 'Intellectual Property Lawyers'), (s_id, 'Labour Lawyers'), (s_id, 'Money Recovery Lawyers'),
        (s_id, 'Motor Accident Lawyers'), (s_id, 'Muslim Law Lawyers')
    ON CONFLICT (service_id, name) DO NOTHING;

    -- Legal Documents
    INSERT INTO public.services (name) VALUES ('Legal Documents') ON CONFLICT (name) DO UPDATE SET is_active = true RETURNING id INTO s_id;
    INSERT INTO public.sub_services (service_id, name) VALUES 
        (s_id, 'Free Legal Documents'), (s_id, 'All Legal Documents'), (s_id, 'Rental Agreement'),
        (s_id, 'Commercial Rental Agreement'), (s_id, 'Experience Letter'), (s_id, 'Appointment Letter'), (s_id, 'Affidavit Format'),
        (s_id, 'Power Of Attorney'), (s_id, 'Income Certificate'), (s_id, 'No Objection Certificate'), (s_id, 'Salary Slip'),
        (s_id, 'Resignation Letter'), (s_id, 'Legal Heir Certificate'), (s_id, 'Relieving Letter'), (s_id, 'Bonafide Certificate'),
        (s_id, 'Partnership Deed'), (s_id, 'GST Invoice'), (s_id, 'Authorised Signatory In GST'), (s_id, 'Delivery Challan'),
        (s_id, 'Offer Letter'), (s_id, 'Consent Letter For GST Registration'), (s_id, 'Rent Receipt')
    ON CONFLICT (service_id, name) DO NOTHING;

    -- Company Changes
    INSERT INTO public.services (name) VALUES ('Company Changes') ON CONFLICT (name) DO UPDATE SET is_active = true RETURNING id INTO s_id;
    INSERT INTO public.sub_services (service_id, name) VALUES 
        (s_id, 'Director Change'), (s_id, 'Remove Director'), (s_id, 'MOA Amendment'), (s_id, 'AOA Amendment'), (s_id, 'Share Transfer'),
        (s_id, 'DIN eKYC Filing'), (s_id, 'DIN Reactivation'), (s_id, 'Name Change - Company'), (s_id, 'Registered Office Change'),
        (s_id, 'Commencement (INC-2A)'), (s_id, 'Authorized Capital Increase')
    ON CONFLICT (service_id, name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Execute Seed
SELECT seed_services();
