-- Add date_of_birth and gender to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;

-- We also previously added these to customers but just in case
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS date_of_birth TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS gender TEXT;
