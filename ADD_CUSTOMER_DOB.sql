-- Add Date of Birth column to customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS date_of_birth DATE;
