-- FIX_FOREIGN_KEYS_CASCADE.sql
-- This script updates foreign key constraints to allow deleting profiles 
-- (e.g. employees) without violating referential integrity.

BEGIN;

-- =========================================================
-- 1. LEADS TABLE
-- =========================================================

-- Drop existing restricted constraints if they exist
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_assigned_by_fkey;
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_assigned_to_fkey;
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_created_by_fkey;

-- Re-add with SET NULL
ALTER TABLE public.leads 
  ADD CONSTRAINT leads_assigned_by_fkey 
  FOREIGN KEY (assigned_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.leads 
  ADD CONSTRAINT leads_assigned_to_fkey 
  FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.leads 
  ADD CONSTRAINT leads_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


-- =========================================================
-- 2. CUSTOMERS TABLE
-- =========================================================

-- Drop existing
ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_assigned_to_fkey;
ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_created_by_fkey;

-- Re-add with SET NULL
ALTER TABLE public.customers 
  ADD CONSTRAINT customers_assigned_to_fkey 
  FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.customers 
  ADD CONSTRAINT customers_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


-- =========================================================
-- 3. ACTIVITIES TABLE
-- =========================================================

-- Drop existing
ALTER TABLE public.activities DROP CONSTRAINT IF EXISTS activities_user_id_fkey;

-- Re-add with CASCADE or SET NULL
-- Activities are better as CASCADE if logs aren't needed after user is gone,
-- or SET NULL to keep the log content. Let's use CASCADE for logs linked to profile.
ALTER TABLE public.activities 
  ADD CONSTRAINT activities_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


-- =========================================================
-- 4. TASKS TABLE
-- =========================================================

ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_created_by_fkey;

ALTER TABLE public.tasks 
  ADD CONSTRAINT tasks_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;


-- =========================================================
-- 5. NOTIFICATIONS TABLE
-- =========================================================

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

ALTER TABLE public.notifications 
  ADD CONSTRAINT notifications_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- =========================================================
-- 6. USER_ACTIVITIES TABLE
-- =========================================================

-- Check if column name is user_id
ALTER TABLE public.user_activities DROP CONSTRAINT IF EXISTS user_activities_user_id_fkey;

-- Re-add with CASCADE
ALTER TABLE public.user_activities 
  ADD CONSTRAINT user_activities_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

COMMIT;
