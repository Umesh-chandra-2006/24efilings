
-- 1. Add status column to customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Success';

-- 2. Backfill existing data
UPDATE public.customers SET status = 'Success' WHERE status IS NULL;

-- 3. Configure RLS for Deletion (Allow Super Admins to delete)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super Admin can delete customers" ON public.customers;

CREATE POLICY "Super Admin can delete customers"
ON public.customers
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'Super Admin'
  )
);
