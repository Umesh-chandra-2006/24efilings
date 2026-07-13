-- FIX_RLS_SUCCESS_WORKFLOW.sql
-- Run this script in your Supabase SQL Editor to resolve RLS issues for the "Success" state workflow.
-- This script fixes row-level security (RLS) policies for the 'customers' and 'activities' tables,
-- enabling Sales Executives to successfully convert leads to customers and log activities.

BEGIN;

-- 1. Ensure helper function exists to check user roles safely without recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role::text FROM public.profiles WHERE id = auth.uid()),
    ''
  );
$$;

-- 2. Clean up existing policies for 'customers' and 'activities'
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('customers', 'activities')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 3. Configure 'activities' table RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read activities
CREATE POLICY "activities_select_policy" 
ON public.activities 
FOR SELECT 
TO authenticated 
USING (true);

-- Allow all authenticated users to insert activity log records
CREATE POLICY "activities_insert_policy" 
ON public.activities 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 4. Configure 'customers' table RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to insert a new customer (required for lead conversion workflow)
CREATE POLICY "customers_insert_policy" 
ON public.customers 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow select/read: Admins/Super Admins see all, Sales Executives see assigned, created, or lead-matched customers
CREATE POLICY "customers_select_policy" 
ON public.customers 
FOR SELECT 
TO authenticated 
USING (
  public.get_current_user_role() IN ('Super Admin', 'Admin')
  OR assigned_to = auth.uid()
  OR created_by = auth.uid()
  OR lead_id IN (
    SELECT id FROM public.leads 
    WHERE assigned_to = auth.uid() OR created_by = auth.uid()
  )
);

-- Allow update: Admins/Super Admins, or assigned/creator Sales Executives
CREATE POLICY "customers_update_policy" 
ON public.customers 
FOR UPDATE 
TO authenticated 
USING (
  public.get_current_user_role() IN ('Super Admin', 'Admin')
  OR assigned_to = auth.uid()
  OR created_by = auth.uid()
) 
WITH CHECK (true);

-- Allow delete: Admins and Super Admins only
CREATE POLICY "customers_delete_policy" 
ON public.customers 
FOR DELETE 
TO authenticated 
USING (
  public.get_current_user_role() IN ('Super Admin', 'Admin')
);

-- 5. Reload Schema Cache to make changes immediate
NOTIFY pgrst, 'reload config';

COMMIT;
