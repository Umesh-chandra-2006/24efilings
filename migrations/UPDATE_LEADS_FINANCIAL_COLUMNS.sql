
-- Add missing financial columns to leads table
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS advance_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS remaining_amount NUMERIC DEFAULT 0;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
