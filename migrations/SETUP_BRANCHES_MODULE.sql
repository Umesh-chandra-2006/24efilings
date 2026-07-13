-- SETUP_BRANCHES_MODULE.sql
BEGIN;

-- 1. Create Branches Table
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    manager_id UUID,
    address TEXT,
    contact_details TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Default Branch
INSERT INTO public.branches (name, code, address)
VALUES ('Head Office', 'HO-001', 'Main City')
ON CONFLICT (code) DO NOTHING;

-- 2. Update User Roles Enum
DO $$
BEGIN
    ALTER TYPE public.user_role ADD VALUE 'Branch Manager';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
    ALTER TYPE public.user_role ADD VALUE 'Receptionist';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
    ALTER TYPE public.user_role ADD VALUE 'Team Leader';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
    ALTER TYPE public.user_role ADD VALUE 'Service Executive';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
    ALTER TYPE public.user_role ADD VALUE 'Accounts Team';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Safely handle existing branch_id (which might be TEXT)
DO $$ 
BEGIN
  -- PROFILES
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='branch_id' AND data_type='text') THEN
      ALTER TABLE public.profiles RENAME COLUMN branch_id TO old_branch_id_text;
  END IF;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id);

  -- LEADS
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='branch_id' AND data_type='text') THEN
      ALTER TABLE public.leads RENAME COLUMN branch_id TO old_branch_id_text;
  END IF;
  ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id);

  -- CUSTOMERS
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='branch_id' AND data_type='text') THEN
      ALTER TABLE public.customers RENAME COLUMN branch_id TO old_branch_id_text;
  END IF;
  ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id);

  -- OFFERS
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='branch_id' AND data_type='text') THEN
      ALTER TABLE public.offers RENAME COLUMN branch_id TO old_branch_id_text;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'offers') THEN
      ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id);
  END IF;

  -- TASKS
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='branch_id' AND data_type='text') THEN
      ALTER TABLE public.tasks RENAME COLUMN branch_id TO old_branch_id_text;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tasks') THEN
      ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id);
  END IF;

  -- USER ACTIVITIES
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_activities' AND column_name='branch_id' AND data_type='text') THEN
      ALTER TABLE public.user_activities RENAME COLUMN branch_id TO old_branch_id_text;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_activities') THEN
      ALTER TABLE public.user_activities ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id);
  END IF;
END $$;

-- 4. Set Default Branch for existing records
DO $$
DECLARE
    default_branch_id UUID;
BEGIN
    SELECT id INTO default_branch_id FROM public.branches WHERE code = 'HO-001' LIMIT 1;
    
    UPDATE public.profiles SET branch_id = default_branch_id WHERE branch_id IS NULL;
    UPDATE public.leads SET branch_id = default_branch_id WHERE branch_id IS NULL;
    UPDATE public.customers SET branch_id = default_branch_id WHERE branch_id IS NULL;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'offers') THEN
        EXECUTE 'UPDATE public.offers SET branch_id = $1 WHERE branch_id IS NULL' USING default_branch_id;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tasks') THEN
        EXECUTE 'UPDATE public.tasks SET branch_id = $1 WHERE branch_id IS NULL' USING default_branch_id;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_activities') THEN
        EXECUTE 'UPDATE public.user_activities SET branch_id = $1 WHERE branch_id IS NULL' USING default_branch_id;
    END IF;
END $$;

-- Add Foreign Key for manager_id now that profiles exists
ALTER TABLE public.branches DROP CONSTRAINT IF EXISTS fk_manager_id;
ALTER TABLE public.branches ADD CONSTRAINT fk_manager_id FOREIGN KEY (manager_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 5. Helper Function for Branch
DROP FUNCTION IF EXISTS public.get_current_user_branch() CASCADE;
CREATE OR REPLACE FUNCTION public.get_current_user_branch()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT branch_id::UUID FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- 6. Update RLS Policies to respect branches
DROP POLICY IF EXISTS "leads_select_policy" ON public.leads;
CREATE POLICY "leads_select_policy" ON public.leads FOR SELECT TO authenticated USING (
  get_current_user_role() = 'Super Admin'
  OR (get_current_user_role() IN ('Branch Manager', 'Admin') AND branch_id = public.get_current_user_branch())
  OR assigned_to = auth.uid()
  OR created_by = auth.uid()
);

DROP POLICY IF EXISTS "leads_update_policy" ON public.leads;
CREATE POLICY "leads_update_policy" ON public.leads FOR UPDATE TO authenticated USING (
  get_current_user_role() = 'Super Admin'
  OR (get_current_user_role() IN ('Branch Manager', 'Admin') AND branch_id = public.get_current_user_branch())
  OR assigned_to = auth.uid()
  OR created_by = auth.uid()
) WITH CHECK (true);

DROP POLICY IF EXISTS "leads_delete_policy" ON public.leads;
CREATE POLICY "leads_delete_policy" ON public.leads FOR DELETE TO authenticated USING (
  get_current_user_role() = 'Super Admin'
  OR (get_current_user_role() = 'Branch Manager' AND branch_id = public.get_current_user_branch())
);

-- Customers
DROP POLICY IF EXISTS "cust_select_policy" ON public.customers;
CREATE POLICY "cust_select_policy" ON public.customers FOR SELECT TO authenticated USING (
  get_current_user_role() = 'Super Admin'
  OR (get_current_user_role() IN ('Branch Manager', 'Admin') AND branch_id = public.get_current_user_branch())
  OR assigned_to = auth.uid()
  OR created_by = auth.uid()
  OR lead_id IN (SELECT id FROM public.leads WHERE assigned_to = auth.uid() OR created_by = auth.uid())
);

DROP POLICY IF EXISTS "cust_update_policy" ON public.customers;
CREATE POLICY "cust_update_policy" ON public.customers FOR UPDATE TO authenticated USING (
  get_current_user_role() = 'Super Admin'
  OR (get_current_user_role() IN ('Branch Manager', 'Admin') AND branch_id = public.get_current_user_branch())
  OR assigned_to = auth.uid()
  OR created_by = auth.uid()
) WITH CHECK (true);

-- Branch Table Policies
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "branch_select_policy" ON public.branches;
CREATE POLICY "branch_select_policy" ON public.branches FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "branch_insert_policy" ON public.branches;
CREATE POLICY "branch_insert_policy" ON public.branches FOR INSERT TO authenticated WITH CHECK (get_current_user_role() = 'Super Admin');

DROP POLICY IF EXISTS "branch_update_policy" ON public.branches;
CREATE POLICY "branch_update_policy" ON public.branches FOR UPDATE TO authenticated USING (get_current_user_role() = 'Super Admin') WITH CHECK (true);

DROP POLICY IF EXISTS "branch_delete_policy" ON public.branches;
CREATE POLICY "branch_delete_policy" ON public.branches FOR DELETE TO authenticated USING (get_current_user_role() = 'Super Admin');

COMMIT;
