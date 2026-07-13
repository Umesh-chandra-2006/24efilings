-- SQL Script to Activate User
-- Run this in your Supabase SQL Editor

BEGIN;

-- 1. Update the profile to be active and set role
UPDATE public.profiles
SET 
  is_active = true,
  role = 'Super Admin',
  last_updated = now()
WHERE email = 'sekhar.anthati@scionfinancials.com';

-- 2. Verify and output the result
SELECT id, email, role, is_active 
FROM public.profiles 
WHERE email = 'sekhar.anthati@scionfinancials.com';

COMMIT;
