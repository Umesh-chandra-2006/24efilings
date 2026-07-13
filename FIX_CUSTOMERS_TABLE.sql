-- Add missing columns to the customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS business_address text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS residential_address text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS sub_service text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS whatsapp_number text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS payment_details jsonb;

-- Ensure RLS is enabled
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
