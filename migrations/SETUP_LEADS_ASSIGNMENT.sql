-- ========================================================
-- Safe Schema Update: Add assignment column to public.leads
-- ========================================================

-- Safe check to add assigned_to column if it does not exist
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
