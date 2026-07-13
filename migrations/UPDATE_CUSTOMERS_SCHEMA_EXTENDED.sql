BEGIN;

-- Add new columns to customers table
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS pan_number TEXT,
ADD COLUMN IF NOT EXISTS aadhar_number TEXT,
ADD COLUMN IF NOT EXISTS service_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS paid_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS due_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS feedback TEXT;

-- Update the comments/descriptions if supported (optional but good for documentation)
COMMENT ON COLUMN public.customers.service_amount IS 'Total base amount for services excluding tax';
COMMENT ON COLUMN public.customers.tax_amount IS 'Total tax amount';
COMMENT ON COLUMN public.customers.total_amount IS 'Grand total (Service + Tax)';
COMMENT ON COLUMN public.customers.paid_amount IS 'Total amount paid by the customer';
COMMENT ON COLUMN public.customers.due_amount IS 'Remaining amount to be paid';

COMMIT;
