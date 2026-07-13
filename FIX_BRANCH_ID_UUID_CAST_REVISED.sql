BEGIN;

-- 1. Fix profiles trigger (remove NULLIF on UUID)
CREATE OR REPLACE FUNCTION public.sync_profile_branch_and_city()
RETURNS TRIGGER AS $$
DECLARE
  branch_record RECORD;
BEGIN
  IF NEW.branch_id IS NOT NULL THEN
    SELECT name, city_id, city_name INTO branch_record FROM public.branches WHERE id = NEW.branch_id;
    NEW.branch_name := branch_record.name;
    NEW.city_id := branch_record.city_id;
    NEW.city_name := branch_record.city_name;
  ELSE
    NEW.branch_name := NULL;
    NEW.city_id := NULL;
    NEW.city_name := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fix leads trigger (remove NULLIF on UUID)
CREATE OR REPLACE FUNCTION public.sync_lead_branch_and_city()
RETURNS TRIGGER AS $$
DECLARE
  branch_record RECORD;
BEGIN
  IF NEW.branch_id IS NOT NULL THEN
    SELECT city_id, city_name INTO branch_record FROM public.branches WHERE id = NEW.branch_id;
    NEW.city_id := branch_record.city_id;
    NEW.city_name := branch_record.city_name;
  ELSE
    NEW.city_id := NULL;
    NEW.city_name := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Fix customers trigger (remove NULLIF on UUID)
CREATE OR REPLACE FUNCTION public.sync_customer_branch_and_city()
RETURNS TRIGGER AS $$
DECLARE
  branch_record RECORD;
BEGIN
  IF NEW.branch_id IS NOT NULL THEN
    SELECT city_id, city_name INTO branch_record FROM public.branches WHERE id = NEW.branch_id;
    NEW.city_id := branch_record.city_id;
    NEW.city_name := branch_record.city_name;
  ELSE
    NEW.city_id := NULL;
    NEW.city_name := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
