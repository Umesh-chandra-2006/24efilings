-- FIX_RLS_COMPREHENSIVE.sql
-- This script fixes RLS bottlenecks across Leads, Notifications, and Customers to allow proper assignment workflows.

BEGIN;

-- =========================================================
-- 1. LEADS TABLE (Reapplying proper permissiveness)
-- =========================================================

-- Clean up leads policies
DO $$
DECLARE pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'leads' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.leads', pol.policyname);
    END LOOP;
END $$;

-- Policies for LEADS
CREATE POLICY "View All Leads" ON public.leads FOR SELECT TO authenticated USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Super Admin', 'Admin')
  OR assigned_to = auth.uid() OR created_by = auth.uid()
);

CREATE POLICY "Insert Any Lead" ON public.leads FOR INSERT TO authenticated WITH CHECK (true);

-- Allow updating if you own it, create it, or are admin. 
-- Crucially, WITH CHECK (true) allows you to set the new state to ANYTHING (e.g., assign to someone else).
CREATE POLICY "Update Owned Leads" ON public.leads FOR UPDATE TO authenticated USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Super Admin', 'Admin')
  OR assigned_to = auth.uid() OR created_by = auth.uid()
) WITH CHECK (true);

CREATE POLICY "Delete Admin Only" ON public.leads FOR DELETE TO authenticated USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Super Admin', 'Admin')
);


-- =========================================================
-- 2. NOTIFICATIONS TABLE (Fixing "Notify Others")
-- =========================================================

-- Clean up notifications policies
DO $$
DECLARE pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'notifications' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.notifications', pol.policyname);
    END LOOP;
END $$;

-- Policies for NOTIFICATIONS
-- Users can see/edit ONLY their own notifications
CREATE POLICY "View Own Notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Update Own Notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Delete Own Notifications" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

-- CRITICAL FIX: Allow creating notifications for ANYONE.
-- This allows User A to notify User B about a new lead.
CREATE POLICY "Insert Any Notification" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);


-- =========================================================
-- 3. CUSTOMERS TABLE (Fixing "Convert Assign to Others")
-- =========================================================

-- Clean up customers policies
DO $$
DECLARE pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'customers' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.customers', pol.policyname);
    END LOOP;
END $$;

-- Policies for CUSTOMERS
CREATE POLICY "View All Customers" ON public.customers FOR SELECT TO authenticated USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Super Admin', 'Admin')
  OR assigned_to = auth.uid() OR created_by = auth.uid()
);

-- CRITICAL FIX: Allow inserting customers assigned to ANYONE.
CREATE POLICY "Insert Any Customer" ON public.customers FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Update Owned Customers" ON public.customers FOR UPDATE TO authenticated USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Super Admin', 'Admin')
  OR assigned_to = auth.uid() OR created_by = auth.uid()
) WITH CHECK (true);

CREATE POLICY "Delete Admin Only Customers" ON public.customers FOR DELETE TO authenticated USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Super Admin', 'Admin')
);

COMMIT;
