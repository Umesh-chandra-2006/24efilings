BEGIN;

-- Make lead_id nullable in customers table to support imported legacy customers
ALTER TABLE public.customers
ALTER COLUMN lead_id DROP NOT NULL;

COMMIT;
