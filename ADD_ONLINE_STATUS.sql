-- Add columns for tracking online status
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Allow users to update their own last_seen and is_online status
DROP POLICY IF EXISTS "Users can update their own online status" ON public.profiles;

CREATE POLICY "Users can update their own online status"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Explicitly allow the columns to be updated (if using column-level security, though RLS usually covers rows)
-- In Supabase, if RLS is on, we just need the policy above.
