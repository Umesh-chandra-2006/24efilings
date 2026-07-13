-- FIX_RLS_ULTIMATE.sql
-- COMPLETE RESET of Permissions.
-- This script guarantees the removal of conflict policies and sets up a robust, conflict-free RLS system.

BEGIN;

-- 1. Helper Function to safely check roles (Bypasses RLS on profiles)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 2. DISABLE RLS TEMPORARILY
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;

-- 3. DROP ALL POLICIES (Using Dynamic SQL to be explicit)
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('leads', 'notifications', 'customers')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 4. RE-ENABLE RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- 5. CREATE BRAND NEW POLICIES

-- === LEADS ===
-- View: Super Admin, Admin, Assigned User, or Creator
CREATE POLICY "leads_select_policy" ON public.leads FOR SELECT TO authenticated USING (
  get_current_user_role() IN ('Super Admin', 'Admin')
  OR assigned_to = auth.uid()
  OR created_by = auth.uid()
);

-- Insert: Allow ALL (so you can create leads assigned to others)
CREATE POLICY "leads_insert_policy" ON public.leads FOR INSERT TO authenticated WITH CHECK (true);

-- Update: 
-- Condition: You must be Admin, Assigned, or Creator to START the update.
-- Check: You can update it to ANYTHING (WITH CHECK true).
CREATE POLICY "leads_update_policy" ON public.leads FOR UPDATE TO authenticated USING (
  get_current_user_role() IN ('Super Admin', 'Admin')
  OR assigned_to = auth.uid()
  OR created_by = auth.uid()
) WITH CHECK (true);

-- Delete: Admins only
CREATE POLICY "leads_delete_policy" ON public.leads FOR DELETE TO authenticated USING (
  get_current_user_role() IN ('Super Admin', 'Admin')
);


-- === NOTIFICATIONS ===
-- View/Edit Own
CREATE POLICY "notif_select_own" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notif_update_own" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notif_delete_own" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());
-- Insert: Allow sending to ANYONE
CREATE POLICY "notif_insert_any" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);


-- === CUSTOMERS ===
CREATE POLICY "cust_select_policy" ON public.customers FOR SELECT TO authenticated USING (
  get_current_user_role() IN ('Super Admin', 'Admin')
  OR assigned_to = auth.uid()
  OR created_by = auth.uid()
  OR lead_id IN (SELECT id FROM public.leads WHERE assigned_to = auth.uid() OR created_by = auth.uid())
);
CREATE POLICY "cust_insert_any" ON public.customers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cust_update_policy" ON public.customers FOR UPDATE TO authenticated USING (
  get_current_user_role() IN ('Super Admin', 'Admin')
  OR assigned_to = auth.uid()
  OR created_by = auth.uid()
) WITH CHECK (true);

COMMIT;
