-- ==============================================================
-- 24EFiling CRM - User Transfer Migration
-- ==============================================================

BEGIN;

-- 1. Add Address field to Profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS address TEXT;

-- 2. Create User Transfer Logs Table
CREATE TABLE IF NOT EXISTS public.user_transfer_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    from_city_id UUID,
    from_branch_id UUID,
    to_city_id UUID,
    to_branch_id UUID,
    transferred_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    transfer_type TEXT NOT NULL CHECK (transfer_type IN ('Branch Transfer', 'City Transfer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS
ALTER TABLE public.user_transfer_logs ENABLE ROW LEVEL SECURITY;

-- 4. Set Policies for user_transfer_logs
-- Super Admins and Admins can view all transfer logs
CREATE POLICY "Admin View Transfer Logs" ON public.user_transfer_logs FOR SELECT USING (
  (COALESCE(get_my_claim('user_role'), '')::text IN ('Super Admin', 'Admin'))
);

-- Super Admins and Admins can insert transfer logs
CREATE POLICY "Admin Insert Transfer Logs" ON public.user_transfer_logs FOR INSERT WITH CHECK (
  (COALESCE(get_my_claim('user_role'), '')::text IN ('Super Admin', 'Admin'))
);

COMMIT;
