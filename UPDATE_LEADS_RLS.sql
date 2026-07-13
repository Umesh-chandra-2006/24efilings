-- Enable RLS on leads table if not already enabled
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policy to allow Super Admins and Admins to view ALL leads
CREATE POLICY "Super Admins and Admins can view all leads"
ON public.leads
FOR SELECT
TO authenticated
USING (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role IN ('Super Admin', 'Admin')
  )
);

-- Policy to allow Super Admins and Admins to insert/update/delete ALL leads
CREATE POLICY "Super Admins and Admins can manage all leads"
ON public.leads
FOR ALL
TO authenticated
USING (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role IN ('Super Admin', 'Admin')
  )
);

-- Ensure Sales Executives can still view their assigned leads (if separate policy needed)
-- (Assuming existing policy handles "assigned_to" or "created_by")
-- If there's a conflicting policy, we might need to drop it first.
-- For safety, let's drop potential restrictive policies first to be sure.

DROP POLICY IF EXISTS "Enable read access for all users" ON public.leads;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.leads;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.leads;
DROP POLICY IF EXISTS "Admins and Super Admins view all" ON public.leads;
DROP POLICY IF EXISTS "Sales Executives view assigned" ON public.leads;

-- Re-create clean policies

-- 1. View Policy
CREATE POLICY "View Leads Policy"
ON public.leads
FOR SELECT
TO authenticated
USING (
  -- Super Admin and Admin can see everything
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Super Admin', 'Admin')
  OR
  -- Sales Executives can see leads assigned to them
  assigned_to->>'id' = auth.uid()::text
  OR
  -- Or leads they created (optional, but good for UX)
  created_by = auth.uid()
);

-- 2. Insert Policy
CREATE POLICY "Insert Leads Policy"
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (
  -- Anyone authenticated can create leads? Or specific roles?
  -- Usually usually anyone can create, but let's restrict if needed.
  -- For now allow all authenticated users to create leads.
  true
);

-- 3. Update Policy
CREATE POLICY "Update Leads Policy"
ON public.leads
FOR UPDATE
TO authenticated
USING (
  -- Super Admin and Admin can update anything
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Super Admin', 'Admin')
  OR
  -- Sales Executives can update their assigned leads
  assigned_to->>'id' = auth.uid()::text
);

-- 4. Delete Policy
CREATE POLICY "Delete Leads Policy"
ON public.leads
FOR DELETE
TO authenticated
USING (
  -- Only Super Admin and Admin can delete
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Super Admin', 'Admin')
);
