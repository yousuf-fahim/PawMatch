-- Fixed Admin Access Policy Script
-- Run this in Supabase SQL Editor

-- Add your admin emails first (this must work before policies)
INSERT INTO public.pre_access_admins (email, created_at)
VALUES 
  ('fahim.cse.bubt@gmail.com', NOW()),
  ('miftahurr503@gmail.com', NOW()),
  ('21225103465@cse.bubt.edu.bd', NOW()),
  ('eiadkhan@gmail.com', NOW()),
  ('fahimysf61@gmail.com', NOW()),
  ('shamianila57@gmail.com', NOW())
ON CONFLICT (email) DO NOTHING;

-- Now create admin policies for all tables
-- Pets table
DROP POLICY IF EXISTS "Allow admin users full access to pets" ON public.pets;
CREATE POLICY "Allow admin users full access to pets" ON public.pets
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pre_access_admins 
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- Learning articles table  
DROP POLICY IF EXISTS "Allow admin users full access to articles" ON public.learning_articles;
CREATE POLICY "Allow admin users full access to articles" ON public.learning_articles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pre_access_admins 
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- User profiles table
DROP POLICY IF EXISTS "Allow admin users full access to user_profiles" ON public.user_profiles;
CREATE POLICY "Allow admin users full access to user_profiles" ON public.user_profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pre_access_admins 
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- Adoption applications table
DROP POLICY IF EXISTS "Allow admin users full access to adoption_applications" ON public.adoption_applications;
CREATE POLICY "Allow admin users full access to adoption_applications" ON public.adoption_applications
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pre_access_admins 
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- Services table (create table if not exists first)
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    contact_info JSONB,
    location TEXT,
    service_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on services table
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Services policy
DROP POLICY IF EXISTS "Allow admin users full access to services" ON public.services;
CREATE POLICY "Allow admin users full access to services" ON public.services
FOR ALL
TO authenticated  
USING (
  EXISTS (
    SELECT 1 FROM public.pre_access_admins 
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- Verify the setup
SELECT 'Setup completed successfully!' as result;
