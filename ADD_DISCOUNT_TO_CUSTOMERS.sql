BEGIN;

-- Add discount_amount column to customers table
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;

COMMENT ON COLUMN public.customers.discount_amount IS 'Total discount amount applied';

COMMIT;
