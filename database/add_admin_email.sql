-- Add pawfect.mew@gmail.com to pre_access_admins table
INSERT INTO public.pre_access_admins (email, created_at)
VALUES ('pawfect.mew@gmail.com', NOW())
ON CONFLICT (email) DO NOTHING;

-- Verify the admin email was added
SELECT * FROM public.pre_access_admins WHERE email = 'pawfect.mew@gmail.com';
