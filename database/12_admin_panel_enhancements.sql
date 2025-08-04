-- Add additional user tracking and configuration for admin panel
-- This ensures proper integration with the pre_access_admins feature

-- Add last_login and login_count fields to user_profiles for admin analytics
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Create a function to update login stats
CREATE OR REPLACE FUNCTION public.update_user_login_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.user_profiles
  SET 
    last_login = NOW(),
    login_count = COALESCE(login_count, 0) + 1
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to update login stats when a user signs in
DROP TRIGGER IF EXISTS user_login_stats_trigger ON auth.users;
CREATE TRIGGER user_login_stats_trigger
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION public.update_user_login_stats();

-- Create admin notification settings table
CREATE TABLE IF NOT EXISTS public.admin_notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notify_new_users BOOLEAN DEFAULT TRUE,
  notify_new_pets BOOLEAN DEFAULT TRUE,
  notify_adoptions BOOLEAN DEFAULT TRUE,
  notify_new_admins BOOLEAN DEFAULT TRUE,
  email_frequency TEXT DEFAULT 'daily', -- immediate, daily, weekly, none
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for admin_notification_settings
ALTER TABLE public.admin_notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admins to manage their own notification settings" ON public.admin_notification_settings
  FOR ALL
  TO authenticated
  USING (admin_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- Create admin activity log for auditing purposes
CREATE TABLE IF NOT EXISTS public.admin_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- login, user_update, admin_grant, etc.
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for admin_activity_log
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admins to view activity logs" ON public.admin_activity_log
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true
  ));
  
CREATE POLICY "Allow system to insert activity logs" ON public.admin_activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (admin_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- Add function to log admin activity
CREATE OR REPLACE FUNCTION public.log_admin_activity(
  activity_type TEXT,
  details JSONB DEFAULT NULL,
  ip_address TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.admin_activity_log (admin_id, activity_type, details, ip_address)
  VALUES (auth.uid(), activity_type, details, ip_address)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
