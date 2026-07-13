-- 1. Create the 'documents' bucket (Public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- 2. RLS is already enabled on storage.objects by default in Supabase.
-- Skipping ALTER TABLE to avoid ownership errors.

-- 3. Cleanup existing policies for the 'documents' bucket to avoid conflicts
DO $$
BEGIN
    DROP POLICY IF EXISTS "Give users access to own folder 1ok257x_0" ON storage.objects;
    DROP POLICY IF EXISTS "Give users access to own folder 1ok257x_1" ON storage.objects;
    DROP POLICY IF EXISTS "Give users access to own folder 1ok257x_2" ON storage.objects;
    DROP POLICY IF EXISTS "Give users access to own folder 1ok257x_3" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
END $$;

-- 4. Create Policies

-- Allow any authenticated user to upload files to the 'documents' bucket
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Allow any authenticated user to view files in the 'documents' bucket
CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- Allow any authenticated user to update files (e.g. replace)
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents');

-- Allow any authenticated user to delete files
-- Note: In a production app you might restrict this to the uploader or admin,
-- but for this CRM's collaborative nature, we'll allow authenticated users for now.
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');

-- 5. Fix Database Schema (Ensure all columns exist)
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS business_address text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS residential_address text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS sub_service text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS whatsapp_number text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS payment_details jsonb;
