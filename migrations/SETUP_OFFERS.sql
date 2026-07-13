-- Create Offers Table
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    promo_code TEXT UNIQUE NOT NULL,
    discount_type TEXT CHECK (discount_type IN ('fixed', 'percentage')) NOT NULL,
    discount_value NUMERIC NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')) NOT NULL,
    max_usage INTEGER, -- Null signifies unlimited uses
    usage_count INTEGER DEFAULT 0 NOT NULL,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL, -- specific service or null for store-wide
    offer_type TEXT DEFAULT 'festival' CHECK (offer_type IN ('festival', 'referral', 'first-customer', 'combo')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Enable permissive RLS for CRM operation (Allow all authenticated users to manage offers so that Sales Execs can increment usage_count on confirm and check validity)
DROP POLICY IF EXISTS "Offers Permissive Access" ON public.offers;
CREATE POLICY "Offers Permissive Access" ON public.offers FOR ALL TO authenticated USING (true) WITH CHECK (true);
