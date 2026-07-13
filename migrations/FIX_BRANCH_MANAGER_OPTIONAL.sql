-- FIX_BRANCH_MANAGER_OPTIONAL.sql
-- Enterprise-level Branch Management: decouples branch creation from user assignment.
-- Run this in Supabase SQL Editor.

BEGIN;









-- ══════════════════════════════════════════════════════════════════════════════
-- 1. Make manager_id fully nullable (ensure no NOT NULL constraint exists)
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE public.branches ALTER COLUMN manager_id DROP NOT NULL;

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. Make branch code optional (allow NULL so branches can be created without a code)
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE public.branches ALTER COLUMN code DROP NOT NULL;

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. Ensure Head Office exists as a permanent system entity
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.branches (name, code, address, is_active)
VALUES ('Head Office', 'HO-001', 'Main Office', true)
ON CONFLICT (code) DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. Add is_head_office flag column to distinguish permanent branches
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS is_head_office BOOLEAN DEFAULT false;

-- Mark Head Office permanently
UPDATE public.branches SET is_head_office = true WHERE code = 'HO-001';

-- ══════════════════════════════════════════════════════════════════════════════
-- 5. Update Branch RLS: Head Office cannot be deleted even by Super Admin
-- ══════════════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "branch_delete_policy" ON public.branches;
CREATE POLICY "branch_delete_policy" ON public.branches
  FOR DELETE TO authenticated
  USING (
    get_current_user_role() = 'Super Admin'
    AND is_head_office = false
  );

-- ══════════════════════════════════════════════════════════════════════════════
-- 6. Auto-clear Branch Manager when user is DELETED from profiles
-- ══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.on_manager_profile_deleted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- When a user profile is deleted, remove them as branch manager
  UPDATE public.branches
  SET manager_id = NULL
  WHERE manager_id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_clear_branch_manager_on_delete ON public.profiles;
CREATE TRIGGER trg_clear_branch_manager_on_delete
  BEFORE DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.on_manager_profile_deleted();

-- ══════════════════════════════════════════════════════════════════════════════
-- 7. Auto-clear Branch Manager when user is DEACTIVATED (is_active = false)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.on_manager_deactivated()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only fires when is_active changes from true → false
  IF OLD.is_active = true AND NEW.is_active = false THEN
    UPDATE public.branches
    SET manager_id = NULL
    WHERE manager_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_clear_branch_manager_on_deactivate ON public.profiles;
CREATE TRIGGER trg_clear_branch_manager_on_deactivate
  AFTER UPDATE OF is_active ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.on_manager_deactivated();

-- ══════════════════════════════════════════════════════════════════════════════
-- 8. Allow Admins (not just Super Admin) to also insert/update branches
--    so Admin role can create branches in their city
-- ══════════════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "branch_insert_policy" ON public.branches;
CREATE POLICY "branch_insert_policy" ON public.branches
  FOR INSERT TO authenticated
  WITH CHECK (get_current_user_role() IN ('Super Admin', 'Admin'));

DROP POLICY IF EXISTS "branch_update_policy" ON public.branches;
CREATE POLICY "branch_update_policy" ON public.branches
  FOR UPDATE TO authenticated
  USING (get_current_user_role() IN ('Super Admin', 'Admin'))
  WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════════════════════
-- 9. Reload schema cache
-- ══════════════════════════════════════════════════════════════════════════════
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';

COMMIT;
