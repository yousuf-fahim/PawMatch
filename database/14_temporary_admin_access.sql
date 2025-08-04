-- Temporary admin access policy to allow admin operations with anon key
-- This allows authenticated users who are in pre_access_admins to perform admin operations

-- Allow authenticated admin users to bypass RLS for pets
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

-- Allow authenticated admin users to bypass RLS for learning_articles  
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

-- Allow authenticated admin users to bypass RLS for user_profiles
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

-- Allow authenticated admin users to bypass RLS for adoption_applications
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

-- Allow authenticated admin users to manage services
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

-- Add your current admin email
INSERT INTO public.pre_access_admins (email, created_at)
VALUES ('fahim.cse.bubt@gmail.com', NOW())
ON CONFLICT (email) DO NOTHING;
