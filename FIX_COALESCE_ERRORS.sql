BEGIN;

-- Fix 1: on_profile_change() trigger function
CREATE OR REPLACE FUNCTION public.on_profile_change()
RETURNS TRIGGER AS $$
BEGIN
  -- We ONLY want to update auth.users if the metadata needs to change
  IF NEW.role IS DISTINCT FROM OLD.role OR
     NEW.branch_id IS DISTINCT FROM OLD.branch_id OR
     NEW.is_active IS DISTINCT FROM OLD.is_active THEN
     
     -- Explicitly cast UUID to text before COALESCE to avoid type mismatch
     UPDATE auth.users
     SET raw_user_meta_data = raw_user_meta_data || 
       jsonb_build_object(
           'user_role', NEW.role, 
           'user_branch', COALESCE(NEW.branch_name, ''),
           'user_branch_id', COALESCE(NEW.branch_id::text, NEW.branch_name, '')
       )
     WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Fix 2: handle_lead_creation_metadata() trigger function
CREATE OR REPLACE FUNCTION public.handle_lead_creation_metadata()
RETURNS TRIGGER AS $$
DECLARE
  creator_role public.user_role;
  creator_branch text;
  creator_branch_id uuid; -- Changed from text to uuid
  creator_id uuid;
BEGIN
  SELECT role, branch_name, branch_id, id INTO creator_role, creator_branch, creator_branch_id, creator_id 
  FROM public.profiles 
  WHERE id = auth.uid();

  IF creator_role = 'Admin' THEN
     -- Removed creator_branch (text) from COALESCE because NEW.branch_id is UUID
     NEW.branch_id := COALESCE(NEW.branch_id, creator_branch_id);
     NEW.admin_id := creator_id;
  ELSIF creator_role = 'Sales Executive' THEN
     NEW.branch_id := COALESCE(NEW.branch_id, creator_branch_id);
     IF NEW.admin_id IS NULL THEN
        -- If no admin_id provided, default to a Super Admin just to fulfill FK constraints
        NEW.admin_id := (SELECT id FROM public.profiles WHERE role = 'Super Admin' LIMIT 1);
     END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Fix 3: get_auth_claims() function
CREATE OR REPLACE FUNCTION public.get_auth_claims()
RETURNS jsonb AS $$
DECLARE
  claims jsonb;
  p public.profiles;
BEGIN
  SELECT * INTO p FROM public.profiles WHERE id = auth.uid();
  IF NOT FOUND THEN
    RETURN '{}'::jsonb;
  END IF;

  -- Cast branch_id to text here as well
  claims := jsonb_build_object(
    'user_role', p.role,
    'user_branch', COALESCE(p.branch_name, ''),
    'user_branch_id', COALESCE(p.branch_id::text, p.branch_name, '')
  );

  RETURN claims;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
