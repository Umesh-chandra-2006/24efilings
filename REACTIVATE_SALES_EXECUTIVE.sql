INSERT INTO public.profiles (id, email, name, role, is_active)
VALUES ('df85bbe8-f2fa-4b92-8c98-ad56b107f0f8', 'rkmarripalli@24efiling.com', 'RK Marripalli', 'Sales Executive', true)
ON CONFLICT (id) DO UPDATE 
SET is_active = true, email = EXCLUDED.email;
