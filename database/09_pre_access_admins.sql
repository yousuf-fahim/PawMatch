-- Create pre_access_admins table for admin management
CREATE TABLE IF NOT EXISTS public.pre_access_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS for pre_access_admins table
ALTER TABLE public.pre_access_admins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pre_access_admins table
CREATE POLICY "Allow admins to create pre_access_admins" ON public.pre_access_admins
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );
  
CREATE POLICY "Allow admins to read pre_access_admins" ON public.pre_access_admins
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );
  
CREATE POLICY "Allow admins to delete pre_access_admins" ON public.pre_access_admins
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Insert initial admin emails
INSERT INTO public.pre_access_admins (email, created_at)
VALUES 
  ('miftahurr503@gmail.com', NOW()),
  ('21225103465@cse.bubt.edu.bd', NOW()),
  ('eiadkhan@gmail.com', NOW()),
  ('fahimysf61@gmail.com', NOW()),
  ('shamianila57@gmail.com', NOW())
ON CONFLICT (email) DO NOTHING;

-- Create a trigger function to automatically set users with pre-approved emails as admins
CREATE OR REPLACE FUNCTION public.set_admin_for_pre_approved_emails()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the new user's email exists in pre_access_admins
  IF EXISTS (SELECT 1 FROM public.pre_access_admins WHERE email = NEW.email) THEN
    -- Set is_admin to true
    NEW.is_admin = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run before insert on user_profiles
DROP TRIGGER IF EXISTS set_admin_status_trigger ON public.user_profiles;
CREATE TRIGGER set_admin_status_trigger
  BEFORE INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_admin_for_pre_approved_emails();
