BEGIN;

-- 1. Add phone and email to branches
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Add branch_id to services and sub_services
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id);
ALTER TABLE public.sub_services ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id);

-- 3. Set Default Branch for existing services
DO $$
DECLARE
    default_branch_id UUID;
BEGIN
    SELECT id INTO default_branch_id FROM public.branches WHERE code = 'HO-001' LIMIT 1;
    
    UPDATE public.services SET branch_id = default_branch_id WHERE branch_id IS NULL;
    UPDATE public.sub_services SET branch_id = default_branch_id WHERE branch_id IS NULL;
END $$;

-- 4. Update RLS Policies for Services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "services_select_policy" ON public.services;
CREATE POLICY "services_select_policy" ON public.services FOR SELECT TO authenticated USING (
  get_current_user_role() = 'Super Admin'
  OR branch_id = public.get_current_user_branch()
  OR branch_id IS NULL
);

DROP POLICY IF EXISTS "services_insert_policy" ON public.services;
CREATE POLICY "services_insert_policy" ON public.services FOR INSERT TO authenticated WITH CHECK (
  get_current_user_role() IN ('Super Admin', 'Branch Manager')
);

DROP POLICY IF EXISTS "services_update_policy" ON public.services;
CREATE POLICY "services_update_policy" ON public.services FOR UPDATE TO authenticated USING (
  get_current_user_role() = 'Super Admin'
  OR (get_current_user_role() = 'Branch Manager' AND branch_id = public.get_current_user_branch())
) WITH CHECK (true);

DROP POLICY IF EXISTS "services_delete_policy" ON public.services;
CREATE POLICY "services_delete_policy" ON public.services FOR DELETE TO authenticated USING (
  get_current_user_role() = 'Super Admin'
  OR (get_current_user_role() = 'Branch Manager' AND branch_id = public.get_current_user_branch())
);

-- 5. Update RLS Policies for Sub Services
ALTER TABLE public.sub_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subservices_select_policy" ON public.sub_services;
CREATE POLICY "subservices_select_policy" ON public.sub_services FOR SELECT TO authenticated USING (
  get_current_user_role() = 'Super Admin'
  OR branch_id = public.get_current_user_branch()
  OR branch_id IS NULL
);

DROP POLICY IF EXISTS "subservices_insert_policy" ON public.sub_services;
CREATE POLICY "subservices_insert_policy" ON public.sub_services FOR INSERT TO authenticated WITH CHECK (
  get_current_user_role() IN ('Super Admin', 'Branch Manager')
);

DROP POLICY IF EXISTS "subservices_update_policy" ON public.sub_services;
CREATE POLICY "subservices_update_policy" ON public.sub_services FOR UPDATE TO authenticated USING (
  get_current_user_role() = 'Super Admin'
  OR (get_current_user_role() = 'Branch Manager' AND branch_id = public.get_current_user_branch())
) WITH CHECK (true);

DROP POLICY IF EXISTS "subservices_delete_policy" ON public.sub_services;
CREATE POLICY "subservices_delete_policy" ON public.sub_services FOR DELETE TO authenticated USING (
  get_current_user_role() = 'Super Admin'
  OR (get_current_user_role() = 'Branch Manager' AND branch_id = public.get_current_user_branch())
);

NOTIFY pgrst, 'reload config';

COMMIT;
