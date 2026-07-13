BEGIN;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  parsed_role public.user_role;
  parsed_branch_id UUID;
BEGIN
  -- Safely parse role, fallback to 'Sales Executive' if invalid
  BEGIN
    parsed_role := (NEW.raw_user_meta_data->>'role')::public.user_role;
  EXCEPTION WHEN OTHERS THEN
    parsed_role := 'Sales Executive'::public.user_role;
  END;

  -- Safely parse branch_id, fallback to NULL if invalid or empty
  BEGIN
    IF NULLIF(NEW.raw_user_meta_data->>'branch_id', '') IS NOT NULL THEN
      parsed_branch_id := (NEW.raw_user_meta_data->>'branch_id')::uuid;
    ELSE
      parsed_branch_id := NULL;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    parsed_branch_id := NULL;
  END;

  -- Insert safely into profiles, capturing any other unexpected errors
  BEGIN
    INSERT INTO public.profiles (id, email, name, role, is_active, branch_name, branch_id)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NULLIF(NEW.raw_user_meta_data->>'name', ''), 'User'),
      COALESCE(parsed_role, 'Sales Executive'::public.user_role),
      true,
      NULLIF(NEW.raw_user_meta_data->>'branch_name', ''),
      parsed_branch_id
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- If insertion into profiles fails for ANY reason (e.g. foreign key violation),
    -- do NOT crash the auth.users creation. 
    -- We can log this to Postgres logs but we MUST return NEW to let user creation succeed.
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
