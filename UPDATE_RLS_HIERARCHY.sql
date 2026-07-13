
-- Reset RLS for leads
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure clean slate
DROP POLICY IF EXISTS "Leads are visible to Super Admin" ON leads;
DROP POLICY IF EXISTS "Leads are visible to Admin" ON leads;
DROP POLICY IF EXISTS "Leads are visible to Sales Executive" ON leads;
DROP POLICY IF EXISTS "Enable read access for all users" ON leads;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON leads;
DROP POLICY IF EXISTS "Enable update for users based on email" ON leads;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON leads;
DROP POLICY IF EXISTS "Individuals can view their own leads" ON leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON leads;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON leads;

-- Explicitly drop the new policies we are defining to avoid conflicts on re-run
DROP POLICY IF EXISTS "Super Admin Select Details" ON leads;
DROP POLICY IF EXISTS "Admin Select All" ON leads;
DROP POLICY IF EXISTS "Sales Executive Select Own" ON leads;
DROP POLICY IF EXISTS "Enable Insert" ON leads;
DROP POLICY IF EXISTS "Super Admin Update" ON leads;
DROP POLICY IF EXISTS "Admin Update" ON leads;
DROP POLICY IF EXISTS "Sales Executive Update Own" ON leads;
DROP POLICY IF EXISTS "Super Admin Delete" ON leads;
DROP POLICY IF EXISTS "Admin Delete" ON leads;
DROP POLICY IF EXISTS "Sales Executive Delete Own" ON leads;

-- 1. SELECT Policies

-- Super Admin: Sees EVERYTHING
CREATE POLICY "Super Admin Select Details"
ON leads FOR SELECT
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'Super Admin'
);

-- Admin: Sees EVERYTHING (including own and Sales Execs)
CREATE POLICY "Admin Select All"
ON leads FOR SELECT
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'Admin'
);

-- Sales Executive: Sees ONLY leads Assigned to them or Created by them
-- This implicitly hides Admin's leads (unless assigned to the SE)
CREATE POLICY "Sales Executive Select Own"
ON leads FOR SELECT
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'Sales Executive'
  AND
  (
    assigned_to = auth.uid() OR created_by = auth.uid()
  )
);


-- 2. INSERT Policies (Allow all authenticated to create)
CREATE POLICY "Enable Insert"
ON leads FOR INSERT
TO authenticated
WITH CHECK (true);


-- 3. UPDATE Policies

-- Super Admin: Can update anything
CREATE POLICY "Super Admin Update"
ON leads FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'Super Admin'
);

-- Admin: Can update anything
CREATE POLICY "Admin Update"
ON leads FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'Admin'
);

-- Sales Executive: Can update only their own
CREATE POLICY "Sales Executive Update Own"
ON leads FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'Sales Executive'
  AND
  (
    assigned_to = auth.uid() OR created_by = auth.uid()
  )
);


-- 4. DELETE Policies

-- Super Admin: Can delete anything
CREATE POLICY "Super Admin Delete"
ON leads FOR DELETE
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'Super Admin'
);

-- Admin: Can delete anything (or restrict? Assuming full power for now)
CREATE POLICY "Admin Delete"
ON leads FOR DELETE
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'Admin'
);

-- Sales Executive: Cannot delete? Or only own? 
-- Usually Sales Execs shouldn't delete leads, but let's allow own just in case, or block.
-- Requirement didn't specify, but safer to block or restrict. 
-- For now, let's allow them to delete what they see, to avoid breaking "Delete" buttons in UI if they exist.
CREATE POLICY "Sales Executive Delete Own"
ON leads FOR DELETE
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'Sales Executive'
  AND
  (
    assigned_to = auth.uid() OR created_by = auth.uid()
  )
);
