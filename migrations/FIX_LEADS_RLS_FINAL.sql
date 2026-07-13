-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------
-- 1. DROP ALL EXISTING POLICIES TO AVOID CONFLICTS
-- ---------------------------------------------------------

-- Drop policies defined in various previous scripts
DROP POLICY IF EXISTS "Super Admins and Admins can view all leads" ON public.leads;
DROP POLICY IF EXISTS "Super Admins and Admins can manage all leads" ON public.leads;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.leads;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.leads;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.leads;
DROP POLICY IF EXISTS "Admins and Super Admins view all" ON public.leads;
DROP POLICY IF EXISTS "Sales Executives view assigned" ON public.leads;
DROP POLICY IF EXISTS "View Leads Policy" ON public.leads;
DROP POLICY IF EXISTS "Insert Leads Policy" ON public.leads;
DROP POLICY IF EXISTS "Update Leads Policy" ON public.leads;
DROP POLICY IF EXISTS "Delete Leads Policy" ON public.leads;

-- Drop policy potentially created by UPDATE_RLS_POLICIES.sql
DROP POLICY IF EXISTS "Sales Exec Assigned Leads" ON public.leads;
DROP POLICY IF EXISTS "Super Admin Full Access Leads" ON public.leads;
DROP POLICY IF EXISTS "Admin Branch Access Leads" ON public.leads;

-- ---------------------------------------------------------
-- 2. CREATE NEW, CORRECT POLICIES
-- ---------------------------------------------------------

-- VIEW POLICY
CREATE POLICY "View Leads Policy"
ON public.leads
FOR SELECT
TO authenticated
USING (
  -- Super Admin and Admin can view all
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Super Admin', 'Admin')
  OR
  -- Users can view leads assigned to them (UUID comparison)
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
  -- This ensures that even if they assign it to someone else (making it invisible to them later if created_by is missing), the INSERT itself succeeds.
  true
);

-- UPDATE POLICY
CREATE POLICY "Update Leads Policy"
ON public.leads
FOR UPDATE
TO authenticated
USING (
  -- Super Admin and Admin can update all
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Super Admin', 'Admin')
  OR
  -- Users can update leads assigned to them
  assigned_to = auth.uid()
  OR
  -- Users can update leads they created
  created_by = auth.uid()
)
WITH CHECK (
  -- Allow updating to any state (e.g. reassigning to someone else)
  -- Without this explicit WITH CHECK (true), Postgres enforces the USING clause on the NEW row,
  -- which would block reassigning a lead to someone else (since assigned_to would no longer be auth.uid()).
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
