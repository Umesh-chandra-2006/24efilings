-- FIX_RLS_PERMISSIVE.sql
-- EMERGENCY PERMISSIVE FIX
-- This script temporarily removes all RLS restrictions to identify if the issue is RLS Logic or System Cache.

BEGIN;

-- 1. FORCE REFRESH of Schema Cache (Important for Supabase)
NOTIFY pgrst, 'reload config';

-- 2. DISABLE RLS TEMPORARILY (To completely rule it out)
-- If the error persists after running this, the issue is NOT RLS (it's a Trigger or Check Constraint).
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities DISABLE ROW LEVEL SECURITY;

-- 3. DROP ALL POLICIES (Clean Slate)
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('leads', 'notifications', 'customers', 'user_activities')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 4. RE-ENABLE RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- 5. CREATE "ALLOW ALL" POLICIES FOR AUTHENTICATED USERS
-- This is a temporary measure to strictly confirm workflows. 
-- Once confirmed working, we will restrict "Select" visibility.

-- LEADS: Allow Everything
CREATE POLICY "leads_allow_all" ON public.leads FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- NOTIFICATIONS: Allow Everything
CREATE POLICY "notif_allow_all" ON public.notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CUSTOMERS: Allow Everything
CREATE POLICY "cust_allow_all" ON public.customers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- USER ACTIVITIES: Allow Everything
CREATE POLICY "activity_allow_all" ON public.user_activities FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. DROP POTENTIALLY PROBLEMATIC TRIGGERS (Just in case)
DROP TRIGGER IF EXISTS on_lead_created_meta ON public.leads;
-- We can re-add triggers later if needed, but for now we prioritize the "Update" functionality.

COMMIT;

-- 7. NOTIFY AGAIN
NOTIFY pgrst, 'reload config';
