-- CORRECTED: Fixed RLS Policies to prevent infinite recursion
-- Run this to fix the infinite recursion issue
-- This version uses public schema instead of auth schema

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage all pets" ON public.pets;
DROP POLICY IF EXISTS "Admins can view all articles" ON public.learning_articles;
DROP POLICY IF EXISTS "Admins can manage articles" ON public.learning_articles;
DROP POLICY IF EXISTS "Admins can view all interactions" ON public.pet_interactions;
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.ai_chat_sessions;
DROP POLICY IF EXISTS "Admins can view all messages" ON public.ai_chat_messages;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can manage all applications" ON adoption_applications;
DROP POLICY IF EXISTS "Users can view messages in their applications" ON user_messages;
DROP POLICY IF EXISTS "Admins can send messages in any application" ON user_messages;

-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_admin(UUID);

-- Create a security definer function to check admin status in public schema
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

-- Recreate all admin policies using the security definer function
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update any profile" ON public.user_profiles
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can manage all pets" ON public.pets
    FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can view all articles" ON public.learning_articles
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage articles" ON public.learning_articles
    FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can view all interactions" ON public.pet_interactions
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can view all sessions" ON public.ai_chat_sessions
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can view all messages" ON public.ai_chat_messages
    FOR SELECT USING (public.is_admin());

-- Extended schema policies
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
