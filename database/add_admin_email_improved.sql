-- This SQL script adds the admin email to the pre_access_admins table via direct insert
-- Using postgres ON CONFLICT to ensure idempotence

DO $$
BEGIN
  -- Check if the pre_access_admins table exists
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'pre_access_admins'
  ) THEN
    -- Check if pawfect.mew@gmail.com already exists in the table
    IF NOT EXISTS (
      SELECT 1 FROM public.pre_access_admins 
      WHERE email = 'pawfect.mew@gmail.com'
    ) THEN
      -- Insert the admin email if it doesn't exist
      INSERT INTO public.pre_access_admins (email, created_at)
      VALUES ('pawfect.mew@gmail.com', NOW());
      
      RAISE NOTICE 'Admin email pawfect.mew@gmail.com added successfully';
    ELSE
      RAISE NOTICE 'Admin email pawfect.mew@gmail.com already exists';
    END IF;
  ELSE
    RAISE EXCEPTION 'Table pre_access_admins does not exist';
  END IF;
END
$$;
