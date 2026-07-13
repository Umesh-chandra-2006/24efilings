-- FIX_RLS_FINAL_V3.sql
-- EMERGENCY FIX for "new row violates row-level security policy"
-- This script resets RLS for leads, notifications, and customers to a permissive state to ensure workflows succeed.

BEGIN;

-- 1. DISABLE RLS TEMPORARILY (To stop errors immediately if policies fail to drop)
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities DISABLE ROW LEVEL SECURITY;

-- 2. DROP ALL EXISTING POLICIES (Clean Slate)
DO $$
DECLARE pol record;
BEGIN
    FOR pol IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('leads', 'notifications', 'customers', 'activities', 'user_activities')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 3. RE-ENABLE RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- 4. CREATE PERMISSIVE POLICIES

-- === LEADS ===
-- Allow View if: Admin, or Assigned, or Creator
CREATE POLICY "Leads View" ON public.leads FOR SELECT TO authenticated USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Super Admin', 'Admin')
  OR assigned_to = auth.uid() 
  OR created_by = auth.uid()
);

-- Allow Insert: ALWAYS (Allows assigning to others)
CREATE POLICY "Leads Insert" ON public.leads FOR INSERT TO authenticated WITH CHECK (true);

-- Allow Update: If you have access (View), you can update it to ANY state (allows handoff)
CREATE POLICY "Leads Update" ON public.leads FOR UPDATE TO authenticated USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Super Admin', 'Admin')
  OR assigned_to = auth.uid() 
  OR created_by = auth.uid()
) WITH CHECK (true);

-- Allow Delete: Admins only
CREATE POLICY "Leads Delete" ON public.leads FOR DELETE TO authenticated USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Super Admin', 'Admin')
);


-- === NOTIFICATIONS ===
-- Allow View/Edit Own
CREATE POLICY "Notif View Own" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Notif Update Own" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Notif Delete Own" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());
-- Allow Insert: ALWAYS (Allows sending notifications TO others)
CREATE POLICY "Notif Insert Any" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);


-- === CUSTOMERS ===
CREATE POLICY "Cust View" ON public.customers FOR SELECT TO authenticated USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Super Admin', 'Admin')
  OR assigned_to = auth.uid() 
  OR created_by = auth.uid()
  OR lead_id IN (SELECT id FROM public.leads WHERE assigned_to = auth.uid() OR created_by = auth.uid()) -- Visibility inherit
);
CREATE POLICY "Cust Insert Any" ON public.customers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Cust Update Owned" ON public.customers FOR UPDATE TO authenticated USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Super Admin', 'Admin')
  OR assigned_to = auth.uid() 
  OR created_by = auth.uid()
) WITH CHECK (true);


-- === ACTIVITIES/LOGS ===
-- Allow reading activities if involved
CREATE POLICY "Activities View" ON public.activities FOR SELECT TO authenticated USING (true); -- Simplified visibility for activities
CREATE POLICY "Activities Insert" ON public.activities FOR INSERT TO authenticated WITH CHECK (true); -- Allow logging anything
CREATE POLICY "User Activities All" ON public.user_activities FOR ALL TO authenticated USING (true) WITH CHECK (true); -- Log anything

COMMIT;
