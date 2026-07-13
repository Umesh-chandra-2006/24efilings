BEGIN;

-- Reload Supabase Schema Cache
NOTIFY pgrst, 'reload config';

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Drop all known existing policies to ensure clean slate
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.tasks;
DROP POLICY IF EXISTS "Super Admin Full Access Tasks" ON public.tasks;
DROP POLICY IF EXISTS "Task Access" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated Users Task Access" ON public.tasks;
DROP POLICY IF EXISTS "sales_exec_insert_task" ON public.tasks;
DROP POLICY IF EXISTS "tasks_allow_all" ON public.tasks;

-- Create Permissive Policy for Authenticated Users
-- This allows any logged-in user to View, Create, Update, and Delete tasks.
CREATE POLICY "tasks_allow_all" ON public.tasks
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

COMMIT;

NOTIFY pgrst, 'reload config';
