-- Fix for RLS policy issues with pre_access_admins
-- This script addresses the "new row violates row-level security policy" error and adds missing functionality

-- 1. First, disable RLS temporarily to fix data issues
ALTER TABLE public.pre_access_admins DISABLE ROW LEVEL SECURITY;

-- 2. Create a policy to allow any authenticated user to insert (needed for the first admin)
CREATE POLICY "Allow any authenticated user to create first admin" ON public.pre_access_admins
  FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT EXISTS (SELECT 1 FROM public.pre_access_admins)
    OR
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 3. Update the existing policies to include UPDATE permission
DROP POLICY IF EXISTS "Allow admins to read pre_access_admins" ON public.pre_access_admins;
CREATE POLICY "Allow admins to read pre_access_admins" ON public.pre_access_admins
  FOR SELECT
  TO authenticated
  USING (TRUE); -- Everyone can see the list - it doesn't contain sensitive info

DROP POLICY IF EXISTS "Allow admins to update pre_access_admins" ON public.pre_access_admins;
CREATE POLICY "Allow admins to update pre_access_admins" ON public.pre_access_admins
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 4. Add public access policy for anon role (needed for signup)
CREATE POLICY "Allow public to check pre-access emails" ON public.pre_access_admins
  FOR SELECT
  TO anon
  USING (TRUE);

-- 5. Re-insert the initial admins (with error handling)
INSERT INTO public.pre_access_admins (email, created_at)
VALUES 
  ('miftahurr503@gmail.com', NOW()),
  ('21225103465@cse.bubt.edu.bd', NOW()),
  ('eiadkhan@gmail.com', NOW()),
  ('fahimysf61@gmail.com', NOW()),
  ('shamianila57@gmail.com', NOW())
ON CONFLICT (email) DO NOTHING;

-- 6. Create a function to validate the user's email on signup
CREATE OR REPLACE FUNCTION public.check_admin_access()
RETURNS TRIGGER AS $$
BEGIN
  -- If user email exists in pre_access_admins, grant admin privilege
  IF EXISTS (SELECT 1 FROM public.pre_access_admins WHERE email = NEW.email) THEN
    NEW.is_admin = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Re-enable RLS after fixes
ALTER TABLE public.pre_access_admins ENABLE ROW LEVEL SECURITY;
