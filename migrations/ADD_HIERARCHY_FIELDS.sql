-- Add employee_code and reporting_to fields to profiles table for organizational hierarchy support

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS employee_code TEXT,
ADD COLUMN IF NOT EXISTS reporting_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Create an index on reporting_to to optimize hierarchy queries
CREATE INDEX IF NOT EXISTS idx_profiles_reporting_to ON public.profiles(reporting_to);

-- Note: No additional RLS policies are strictly necessary just for adding these columns, 
-- as the existing profiles RLS policies cover the entire row.
