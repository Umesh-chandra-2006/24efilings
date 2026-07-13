BEGIN;

-- 1. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    entity TEXT, -- e.g., 'Lead', 'Settings', 'User'
    entity_id TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super Admin View Audit Logs" ON public.audit_logs;
CREATE POLICY "Super Admin View Audit Logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'Super Admin'
        )
    );

DROP POLICY IF EXISTS "Insert Audit Logs" ON public.audit_logs;
CREATE POLICY "Insert Audit Logs" ON public.audit_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- 2. Update Profiles Table
ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS phone_number TEXT,
    ADD COLUMN IF NOT EXISTS avatar_url TEXT,
    ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"language": "en", "timezone": "UTC", "theme": "system"}'::jsonb,
    ADD COLUMN IF NOT EXISTS security_settings JSONB DEFAULT '{"two_factor_enabled": false, "session_timeout_minutes": 120}'::jsonb;

-- 3. Update Organization Settings Table
ALTER TABLE public.organization_settings
    ADD COLUMN IF NOT EXISTS company_meta JSONB DEFAULT '{"gstin": "", "pan": "", "cin": "", "website": ""}'::jsonb,
    ADD COLUMN IF NOT EXISTS branding_settings JSONB DEFAULT '{"logo_light": "", "logo_dark": "", "primary_color": "#1c398e"}'::jsonb,
    ADD COLUMN IF NOT EXISTS regional_settings JSONB DEFAULT '{"currency": "INR", "timezone": "Asia/Kolkata", "date_format": "DD/MM/YYYY"}'::jsonb,
    ADD COLUMN IF NOT EXISTS notification_rules JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS lead_settings JSONB DEFAULT '{"auto_assign": false, "statuses": ["New Lead", "Lead Confirmed", "Documents & Payments", "In-Progress", "Success", "Lost"]}'::jsonb;

-- 4. Create Roles Table (for future dynamic RBAC)
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    is_system_role BOOLEAN DEFAULT false, -- To protect Super Admin, Admin, Sales Exec
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read Roles" ON public.roles;
CREATE POLICY "Read Roles" ON public.roles FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Manage Roles" ON public.roles;
CREATE POLICY "Manage Roles" ON public.roles FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'Super Admin'
    )
);

-- Seed System Roles if not exist
INSERT INTO public.roles (name, description, is_system_role, permissions)
VALUES 
    ('Super Admin', 'Complete system control', true, '["all"]'),
    ('Admin', 'Manages leads and teams', true, '["manage_leads", "manage_team", "view_reports"]'),
    ('Sales Executive', 'Sales and lead processing', true, '["view_assigned_leads", "create_leads"]')
ON CONFLICT (name) DO NOTHING;


-- 5. Helper Function for Audit Log
CREATE OR REPLACE FUNCTION log_admin_action(
    action_name TEXT,
    entity_name TEXT,
    entity_id_val TEXT,
    details_json JSONB
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.audit_logs (user_id, action, entity, entity_id, details)
    VALUES (auth.uid(), action_name, entity_name, entity_id_val, details_json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 6. Setup 'avatars' Storage Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Avatars Public Access" ON storage.objects;
CREATE POLICY "Avatars Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatars Upload Access" ON storage.objects;
CREATE POLICY "Avatars Upload Access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

COMMIT;
