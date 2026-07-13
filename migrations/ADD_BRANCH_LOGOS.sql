BEGIN;

-- 1. Add logo_url to branches
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS logo_url TEXT;

COMMIT;
