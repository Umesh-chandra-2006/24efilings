-- SETUP_CITIES_MODULE.sql
BEGIN;

-- 1. Create Cities Table
CREATE TABLE IF NOT EXISTS public.cities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    city_name TEXT NOT NULL,
    city_code TEXT UNIQUE NOT NULL,
    state TEXT,
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Default Cities
INSERT INTO public.cities (city_name, city_code, state, status)
VALUES 
('Hyderabad', 'HYD', 'Telangana', true),
('Bangalore', 'BLR', 'Karnataka', true),
('Visakhapatnam', 'VZG', 'Andhra Pradesh', true),
('Goa', 'GOA', 'Goa', true)
ON CONFLICT (city_code) DO NOTHING;

-- 2. Add city_id and city_name to branches
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL;
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS city_name TEXT;

-- 3. Add city_id and city_name to profiles, leads, customers, services, sub_services
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city_name TEXT;

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS city_name TEXT;

ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS city_name TEXT;

ALTER TABLE public.services ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS city_name TEXT;

ALTER TABLE public.sub_services ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL;
ALTER TABLE public.sub_services ADD COLUMN IF NOT EXISTS city_name TEXT;

-- 4. Setup Default City for existing branches and records
DO $$
DECLARE
    default_city_id UUID;
BEGIN
    -- Get the ID of Hyderabad
    SELECT id INTO default_city_id FROM public.cities WHERE city_code = 'HYD' LIMIT 1;
    
    -- Assign existing branches to default city if they have none
    UPDATE public.branches SET city_id = default_city_id, city_name = 'Hyderabad' WHERE city_id IS NULL;
    
    -- Assign existing profiles
    UPDATE public.profiles SET city_id = default_city_id, city_name = 'Hyderabad' WHERE city_id IS NULL;
    
    -- Assign existing leads
    UPDATE public.leads SET city_id = default_city_id, city_name = 'Hyderabad' WHERE city_id IS NULL;
    
    -- Assign existing customers
    UPDATE public.customers SET city_id = default_city_id, city_name = 'Hyderabad' WHERE city_id IS NULL;

    -- Assign existing services
    UPDATE public.services SET city_id = default_city_id, city_name = 'Hyderabad' WHERE city_id IS NULL;
    UPDATE public.sub_services SET city_id = default_city_id, city_name = 'Hyderabad' WHERE city_id IS NULL;
END $$;


-- 5. Helper Function for City
DROP FUNCTION IF EXISTS public.get_current_user_city() CASCADE;
CREATE OR REPLACE FUNCTION public.get_current_user_city()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT city_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;


-- 6. RLS Policies for Cities Table
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cities_select_policy" ON public.cities;
CREATE POLICY "cities_select_policy" ON public.cities FOR SELECT TO authenticated USING (true); -- Everyone can view cities

DROP POLICY IF EXISTS "cities_insert_policy" ON public.cities;
CREATE POLICY "cities_insert_policy" ON public.cities FOR INSERT TO authenticated WITH CHECK (
  get_current_user_role() = 'Super Admin'
);

DROP POLICY IF EXISTS "cities_update_policy" ON public.cities;
CREATE POLICY "cities_update_policy" ON public.cities FOR UPDATE TO authenticated USING (
  get_current_user_role() = 'Super Admin'
) WITH CHECK (
  get_current_user_role() = 'Super Admin'
);

DROP POLICY IF EXISTS "cities_delete_policy" ON public.cities;
CREATE POLICY "cities_delete_policy" ON public.cities FOR DELETE TO authenticated USING (
  get_current_user_role() = 'Super Admin'
);


-- 7. Triggers to auto-sync city_name

-- Sync city_name to branch when city_id changes
CREATE OR REPLACE FUNCTION public.sync_branch_city_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.city_id IS NOT NULL THEN
    SELECT city_name INTO NEW.city_name FROM public.cities WHERE id = NEW.city_id;
  ELSE
    NEW.city_name := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_branch_city_name ON public.branches;
CREATE TRIGGER trigger_sync_branch_city_name
BEFORE INSERT OR UPDATE OF city_id
ON public.branches
FOR EACH ROW
EXECUTE FUNCTION public.sync_branch_city_name();


-- Sync city_name and city_id to profiles when branch_id changes
CREATE OR REPLACE FUNCTION public.sync_profile_branch_and_city()
RETURNS TRIGGER AS $$
DECLARE
  branch_record RECORD;
BEGIN
  IF NEW.branch_id IS NOT NULL THEN
    SELECT name, city_id, city_name INTO branch_record FROM public.branches WHERE id = NEW.branch_id;
    NEW.branch_name := branch_record.name;
    NEW.city_id := branch_record.city_id;
    NEW.city_name := branch_record.city_name;
  ELSE
    NEW.branch_name := NULL;
    NEW.city_id := NULL;
    NEW.city_name := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_profile_branch_name ON public.profiles;
CREATE TRIGGER trigger_sync_profile_branch_name
BEFORE INSERT OR UPDATE OF branch_id
ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_branch_and_city();


-- Sync city_name and city_id to leads when branch_id changes
CREATE OR REPLACE FUNCTION public.sync_lead_branch_and_city()
RETURNS TRIGGER AS $$
DECLARE
  branch_record RECORD;
BEGIN
  IF NEW.branch_id IS NOT NULL THEN
    SELECT city_id, city_name INTO branch_record FROM public.branches WHERE id = NEW.branch_id;
    NEW.city_id := branch_record.city_id;
    NEW.city_name := branch_record.city_name;
  ELSE
    NEW.city_id := NULL;
    NEW.city_name := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_lead_city ON public.leads;
CREATE TRIGGER trigger_sync_lead_city
BEFORE INSERT OR UPDATE OF branch_id
ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.sync_lead_branch_and_city();


-- Sync city_name and city_id to customers when branch_id changes
CREATE OR REPLACE FUNCTION public.sync_customer_branch_and_city()
RETURNS TRIGGER AS $$
DECLARE
  branch_record RECORD;
BEGIN
  IF NEW.branch_id IS NOT NULL THEN
    SELECT city_id, city_name INTO branch_record FROM public.branches WHERE id = NEW.branch_id;
    NEW.city_id := branch_record.city_id;
    NEW.city_name := branch_record.city_name;
  ELSE
    NEW.city_id := NULL;
    NEW.city_name := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_customer_city ON public.customers;
CREATE TRIGGER trigger_sync_customer_city
BEFORE INSERT OR UPDATE OF branch_id
ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.sync_customer_branch_and_city();


COMMIT;
