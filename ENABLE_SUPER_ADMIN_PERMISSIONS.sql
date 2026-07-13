-- POLICY: Allow Super Admins to UPDATE any profile (for On/Off toggle)
CREATE POLICY "Super Admin Update Profiles" ON public.profiles FOR UPDATE USING (
  (COALESCE(get_my_claim('user_role'), '')::text = 'Super Admin'::text)
);

-- POLICY: Allow Super Admins to DELETE any profile (Fallback if Edge Function fails)
CREATE POLICY "Super Admin Delete Profiles" ON public.profiles FOR DELETE USING (
  (COALESCE(get_my_claim('user_role'), '')::text = 'Super Admin'::text)
);
