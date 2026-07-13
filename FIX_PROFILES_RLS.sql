-- Enable RLS on profiles table (ensure it's on)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow Super Admins to update ANY profile
DROP POLICY IF EXISTS "Super Admins can update any profile" ON public.profiles;
CREATE POLICY "Super Admins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Super Admin'
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Super Admin'
);

-- Policy to allow Super Admins to delete profiles
DROP POLICY IF EXISTS "Super Admins can delete profiles" ON public.profiles;
CREATE POLICY "Super Admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Super Admin'
);

-- CRITICAL FIX: Allow all authenticated users (including Sales Executives) to view ALL profiles.
-- This ensures that the "Assign To" dropdowns populate with all available staff, not just the current user.
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);
