-- Fixed RLS Policies to prevent infinite recursion
-- Run this to fix the infinite recursion issue

-- Drop existing problematic policies on user_profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can manage all applications" ON adoption_applications;
DROP POLICY IF EXISTS "Users can view messages in their applications" ON user_messages;
DROP POLICY IF EXISTS "Admins can send messages in any application" ON user_messages;

-- Create a security definer function to check admin status
-- This prevents recursion by using the security definer context
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_profiles 
    WHERE id = auth.uid() AND is_admin = true
  );
$$;

-- Recreate admin policies using the security definer function
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update any profile" ON public.user_profiles
    FOR UPDATE USING (public.is_admin());

-- Fix extended schema policies to use the security definer function
CREATE POLICY "Admins can manage all notifications" ON notifications
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage all applications" ON adoption_applications
  FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view messages in their applications" ON user_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM adoption_applications 
      WHERE id = application_id AND 
      (user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Admins can send messages in any application" ON user_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND public.is_admin()
  );

-- Also check if there are similar issues in other tables
-- Fix pets policies if they have admin checks
DROP POLICY IF EXISTS "Admins can manage any pet" ON public.pets;
CREATE POLICY "Admins can manage any pet" ON public.pets
    FOR ALL USING (public.is_admin());

-- Fix learning articles policies if they have admin checks  
DROP POLICY IF EXISTS "Admins can manage all articles" ON public.learning_articles;
CREATE POLICY "Admins can manage all articles" ON public.learning_articles
    FOR ALL USING (public.is_admin());
