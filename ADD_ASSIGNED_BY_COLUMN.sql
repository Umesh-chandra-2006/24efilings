
-- Add assigned_by column to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES public.profiles(id);

-- Backfill assigned_by with created_by for existing assignments as a best-effort fallback
UPDATE public.leads 
SET assigned_by = created_by 
WHERE assigned_by IS NULL AND assigned_to IS NOT NULL;
