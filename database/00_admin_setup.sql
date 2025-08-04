-- Comprehensive setup script for PawMatch admin configuration
-- This script:
-- 1. Creates the pre_access_admins table if it doesn't exist
-- 2. Adds admin emails to the table
-- 3. Displays current admin configuration

-- First, ensure the pre_access_admins table exists
CREATE TABLE IF NOT EXISTS public.pre_access_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Add RLS policies if they don't exist
DO $$
BEGIN
  -- Enable RLS on the table
  ALTER TABLE public.pre_access_admins ENABLE ROW LEVEL SECURITY;
  
  -- Create policies if they don't exist
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'pre_access_admins' AND policyname = 'Allow select for authenticated users'
  ) THEN
    CREATE POLICY "Allow select for authenticated users" 
      ON public.pre_access_admins FOR SELECT 
      TO authenticated 
      USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'pre_access_admins' AND policyname = 'Allow all for service role'
  ) THEN
    CREATE POLICY "Allow all for service role" 
      ON public.pre_access_admins FOR ALL 
      TO service_role 
      USING (true) 
      WITH CHECK (true);
  END IF;
END
$$;

-- Add admin emails to the table
INSERT INTO public.pre_access_admins (email, created_at)
VALUES 
  ('pawfect.mew@gmail.com', NOW())
ON CONFLICT (email) 
DO UPDATE SET updated_at = NOW();

-- Display current admin configuration
SELECT 
  email, 
  created_at, 
  updated_at,
  CASE 
    WHEN updated_at IS NULL THEN 'newly added'
    ELSE 'already exists'
  END AS status
FROM public.pre_access_admins
ORDER BY created_at;
