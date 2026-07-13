-- Create Assets Table
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    serial_no TEXT UNIQUE NOT NULL,
    purchase_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('In Stock', 'Assigned', 'Damaged', 'Lost')),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create Asset Assignments Table
CREATE TABLE IF NOT EXISTS public.asset_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assign_date DATE NOT NULL,
    return_date DATE,
    condition_on_assign TEXT NOT NULL CHECK (condition_on_assign IN ('New', 'Good', 'Fair', 'Damaged')),
    condition_on_return TEXT CHECK (condition_on_return IN ('Good', 'Fair', 'Damaged', 'Lost')),
    notes TEXT,
    return_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_assignments ENABLE ROW LEVEL SECURITY;

-- Drop Policies if strictly recreating
DROP POLICY IF EXISTS "Manage Assets" ON public.assets;
DROP POLICY IF EXISTS "View Assigned Assets" ON public.assets;
DROP POLICY IF EXISTS "Manage Assignments" ON public.asset_assignments;
DROP POLICY IF EXISTS "View Own Assignments" ON public.asset_assignments;

-- Assets Policies
-- Super Admin, Admin: Full Control (Select, Insert, Update, Delete)
CREATE POLICY "Manage Assets" ON public.assets
FOR ALL USING (
    (COALESCE(current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'user_role', '')::text IN ('Super Admin', 'Admin'))
);

-- Employee: Read Only (View assets assigned to them OR assets in general if 'Asset List' is public? 
-- User said "Employee View only assets assigned to them (read-only)"
CREATE POLICY "View Assigned Assets" ON public.assets
FOR SELECT USING (
    id IN (SELECT asset_id FROM public.asset_assignments WHERE employee_id = auth.uid() AND return_date IS NULL)
);

-- Asset Assignments Policies
-- Super Admin, Admin: Full Control
CREATE POLICY "Manage Assignments" ON public.asset_assignments
FOR ALL USING (
    (COALESCE(current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'user_role', '')::text IN ('Super Admin', 'Admin'))
);

-- Employee: View Own Assignments
CREATE POLICY "View Own Assignments" ON public.asset_assignments
FOR SELECT USING (
    employee_id = auth.uid()
);

-- Grant permissions (if needed, usually handled by default role but good to be explicit for authenticated)
GRANT ALL ON public.assets TO authenticated;
GRANT ALL ON public.asset_assignments TO authenticated;
