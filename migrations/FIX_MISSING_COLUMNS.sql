BEGIN;

-- Forcefully add columns if they don't exist (safety script)

-- 1. Profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"language": "en", "timezone": "UTC", "theme": "system"}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS security_settings JSONB DEFAULT '{"two_factor_enabled": false, "session_timeout_minutes": 120}'::jsonb;

-- 2. Organization Settings
ALTER TABLE public.organization_settings ADD COLUMN IF NOT EXISTS company_meta JSONB DEFAULT '{"gstin": "", "pan": "", "cin": "", "website": ""}'::jsonb;
ALTER TABLE public.organization_settings ADD COLUMN IF NOT EXISTS branding_settings JSONB DEFAULT '{"logo_light": "", "logo_dark": "", "primary_color": "#1c398e"}'::jsonb;
ALTER TABLE public.organization_settings ADD COLUMN IF NOT EXISTS regional_settings JSONB DEFAULT '{"currency": "INR", "timezone": "Asia/Kolkata", "date_format": "DD/MM/YYYY"}'::jsonb;
ALTER TABLE public.organization_settings ADD COLUMN IF NOT EXISTS notification_rules JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.organization_settings ADD COLUMN IF NOT EXISTS lead_settings JSONB DEFAULT '{"auto_assign": false, "statuses": ["New Lead", "Lead Confirmed", "Documents & Payments", "In-Progress", "Success", "Lost"]}'::jsonb;

-- 3. Notify Schema Cache Reload (This is a trick, sometimes helps PostgREST)
NOTIFY pgrst, 'reload schema';

COMMIT;
