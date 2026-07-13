-- FIX_LEADS_RLS_V2.sql
-- This script safely removes ALL existing policies on the 'leads' table and reapplies the correct permissive ones.

BEGIN;

-- 1. DYNAMICALLY DROP ALL POLICIES ON THE 'leads' TABLE
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'leads' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.leads', pol.policyname);
    END LOOP;
END $$;

-- 2. CREATE NEW, CORRECT POLICIES

-- VIEW POLICY
CREATE POLICY "View Leads Policy"
ON public.leads
FOR SELECT
TO authenticated
USING (
  -- Super Admin and Admin can view all
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Super Admin', 'Admin')
  OR
  -- Users can view leads assigned to them
  assigned_to = auth.uid()
  OR
  -- Users can view leads they created
  created_by = auth.uid()
);

-- INSERT POLICY
CREATE POLICY "Insert Leads Policy"
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow any authenticated user to insert a lead
  -- This allows creating leads assigned to others immediately.
  true
);

-- UPDATE POLICY
CREATE POLICY "Update Leads Policy"
ON public.leads
FOR UPDATE
TO authenticated
USING (
  -- PERMISSION CHECK: Who can edit this row?
  -- Super Admin and Admin can update all
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Super Admin', 'Admin')
  OR
  -- Users can update leads assigned to them currently
  assigned_to = auth.uid()
  OR
  -- Users can update leads they created
  created_by = auth.uid()
)
WITH CHECK (
  -- VALIDATION CHECK: What can the row become?
  -- Allow updating to ANY state.
  -- This explicitly allows a Sales Executive to change 'assigned_to' to another user ID.
  -- Once changed, they might lose access (if they are not creator), but the specific update is allowed.
  true
);

-- DELETE POLICY
CREATE POLICY "Delete Leads Policy"
ON public.leads
FOR DELETE
TO authenticated
USING (
  -- Only Super Admin/Admin usually delete
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Super Admin', 'Admin')
);

COMMIT;
