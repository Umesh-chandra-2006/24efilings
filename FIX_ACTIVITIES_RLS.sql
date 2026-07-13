BEGIN;

-- Enable RLS on activities if not already enabled (safe to run)
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Enable read access for all users" ON public.activities;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.activities;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.activities;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.activities;
DROP POLICY IF EXISTS "Activities View Policy" ON public.activities;
DROP POLICY IF EXISTS "Activities Insert Policy" ON public.activities;

-- 1. VIEW: Authenticated users can view activities (e.g. on leads they have access to)
-- We can refine this later to rely on lead access, but for now, simple authenticated view is safe enough 
-- for internal CRM usage or we can duplicate the "View Own Notifications" logic if it had user_id owner.
-- Activities usually belong to a Lead. 
CREATE POLICY "View Activities" ON public.activities 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- 2. INSERT: Any authenticated user can create an activity
CREATE POLICY "Create Activities" ON public.activities 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- 3. UPDATE: Users can update activities (refine as needed, usually activities are append-only)
CREATE POLICY "Update Activities" ON public.activities 
FOR UPDATE 
USING (auth.role() = 'authenticated');

COMMIT;
