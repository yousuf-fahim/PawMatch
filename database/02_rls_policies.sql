-- PawMatch Row Level Security Policies
-- Run these commands in your Supabase SQL Editor AFTER running 01_schema.sql

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- USER_PROFILES Policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create security definer function to prevent infinite recursion
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

-- Admins can view all profiles (using security definer function)
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR SELECT USING (public.is_admin());

-- Admins can update any profile (using security definer function)
CREATE POLICY "Admins can update any profile" ON public.user_profiles
    FOR UPDATE USING (public.is_admin());

-- PETS Policies
-- Everyone can view available pets
CREATE POLICY "Anyone can view available pets" ON public.pets
    FOR SELECT USING (adoption_status = 'available');

-- Users can view their own pets
CREATE POLICY "Users can view own pets" ON public.pets
    FOR SELECT USING (auth.uid() = owner_id);

-- Users can insert their own pets
CREATE POLICY "Users can insert own pets" ON public.pets
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Users can update their own pets
CREATE POLICY "Users can update own pets" ON public.pets
    FOR UPDATE USING (auth.uid() = owner_id);

-- Users can delete their own pets
CREATE POLICY "Users can delete own pets" ON public.pets
    FOR DELETE USING (auth.uid() = owner_id);

-- Admins can do everything with pets
CREATE POLICY "Admins can manage all pets" ON public.pets
    FOR ALL USING (public.is_admin());

-- LEARNING_ARTICLES Policies
-- Everyone can view published articles
CREATE POLICY "Anyone can view published articles" ON public.learning_articles
    FOR SELECT USING (published = TRUE);

-- Admins can view all articles
CREATE POLICY "Admins can view all articles" ON public.learning_articles
    FOR SELECT USING (public.is_admin());

-- Admins can manage all articles
CREATE POLICY "Admins can manage articles" ON public.learning_articles
    FOR ALL USING (public.is_admin());

-- PET_FAVORITES Policies
-- Users can view their own favorites
CREATE POLICY "Users can view own favorites" ON public.pet_favorites
    FOR SELECT USING (auth.uid() = user_id);

-- Users can manage their own favorites
CREATE POLICY "Users can manage own favorites" ON public.pet_favorites
    FOR ALL USING (auth.uid() = user_id);

-- Admins can view all favorites
CREATE POLICY "Admins can view all favorites" ON public.pet_favorites
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- PET_INTERACTIONS Policies
-- Users can view their own interactions
CREATE POLICY "Users can view own interactions" ON public.pet_interactions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can manage their own interactions
CREATE POLICY "Users can manage own interactions" ON public.pet_interactions
    FOR ALL USING (auth.uid() = user_id);

-- Admins can view all interactions
CREATE POLICY "Admins can view all interactions" ON public.pet_interactions
    FOR SELECT USING (public.is_admin());

-- AI_CHAT_SESSIONS Policies
-- Users can view their own chat sessions
CREATE POLICY "Users can view own chat sessions" ON public.ai_chat_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can manage their own chat sessions
CREATE POLICY "Users can manage own chat sessions" ON public.ai_chat_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Admins can view all chat sessions
CREATE POLICY "Admins can view all sessions" ON public.ai_chat_sessions
    FOR SELECT USING (public.is_admin());

-- AI_CHAT_MESSAGES Policies
-- Users can view messages from their own sessions
CREATE POLICY "Users can view own chat messages" ON public.ai_chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.ai_chat_sessions
            WHERE id = session_id AND user_id = auth.uid()
        )
    );

-- Users can insert messages to their own sessions
CREATE POLICY "Users can insert own chat messages" ON public.ai_chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.ai_chat_sessions
            WHERE id = session_id AND user_id = auth.uid()
        )
    );

-- Admins can view all chat messages
CREATE POLICY "Admins can view all messages" ON public.ai_chat_messages
    FOR SELECT USING (public.is_admin());

-- Create function to check if user owns pet
CREATE OR REPLACE FUNCTION public.owns_pet(pet_id UUID, user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.pets
        WHERE id = pet_id AND owner_id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
