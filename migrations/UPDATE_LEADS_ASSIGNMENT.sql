-- Add assigned_at column if not exists
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ DEFAULT NOW();

-- Create or Replace Trigger Function to update assigned_at
CREATE OR REPLACE FUNCTION public.handle_lead_assignment_change()
RETURNS TRIGGER AS $$
BEGIN
    -- If assigned_to changed, update assigned_at
    IF (OLD.assigned_to IS DISTINCT FROM NEW.assigned_to) THEN
        NEW.assigned_at := NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists to avoid duplication
DROP TRIGGER IF EXISTS on_lead_assigned_to_change ON public.leads;

-- Create Trigger
CREATE TRIGGER on_lead_assigned_to_change
BEFORE UPDATE OF assigned_to ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.handle_lead_assignment_change();

-- Backfill existing leads using created_at as fallback for missing updated_at
UPDATE public.leads
SET assigned_at = created_at
WHERE assigned_at IS NULL AND assigned_to IS NOT NULL;
