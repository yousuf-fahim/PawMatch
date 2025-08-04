-- Add initial admin emails to pre_access_admins table
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

-- Create function to send email notification when admin is added
-- This is a placeholder function that will log the email rather than sending it
-- In production, you would replace this with a proper email sending mechanism
CREATE OR REPLACE FUNCTION public.notify_admin_added()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the notification (in production, you would send an email)
  RAISE NOTICE 'Admin invitation for %: Admin privileges have been granted', NEW.email;
  
  -- The actual email sending would be handled by the Edge Function
  -- This trigger just serves as a record that an email should be sent
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run after insert on pre_access_admins
DROP TRIGGER IF EXISTS notify_admin_added_trigger ON public.pre_access_admins;
CREATE TRIGGER notify_admin_added_trigger
  AFTER INSERT ON public.pre_access_admins
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_added();

-- Add update trigger to handle existing users getting admin privileges
CREATE OR REPLACE FUNCTION public.update_existing_user_admin_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If a user with this email already exists, update their admin status
  UPDATE public.user_profiles
  SET is_admin = TRUE
  WHERE email = NEW.email;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run after insert on pre_access_admins
DROP TRIGGER IF EXISTS update_existing_user_trigger ON public.pre_access_admins;
CREATE TRIGGER update_existing_user_trigger
  AFTER INSERT ON public.pre_access_admins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_existing_user_admin_status();
