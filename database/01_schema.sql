-- PawMatch Database Schema Setup
-- Run these commands in your Supabase SQL Editor

-- 1. Enable Row Level Security by default
ALTER DATABASE postgres SET row_security = on;

-- 2. Create user_profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    location TEXT,
    preferences JSONB DEFAULT '{}',
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create pets table
CREATE TABLE IF NOT EXISTS public.pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    breed TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female')),
    size TEXT CHECK (size IN ('small', 'medium', 'large')),
    color TEXT,
    personality TEXT[],
    description TEXT,
    images TEXT[],
    location TEXT,
    contact_info JSONB,
    adoption_status TEXT DEFAULT 'available' CHECK (adoption_status IN ('available', 'pending', 'adopted')),
    owner_id UUID REFERENCES public.user_profiles(id),
    shelter_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create learning_articles table
CREATE TABLE IF NOT EXISTS public.learning_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author TEXT,
    category TEXT NOT NULL,
    subcategory TEXT,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    read_time INTEGER,
    tags TEXT[],
    featured_image TEXT,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create pet_favorites table (for saved pets)
CREATE TABLE IF NOT EXISTS public.pet_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, pet_id)
);

-- 6. Create pet_interactions table (swipe history)
CREATE TABLE IF NOT EXISTS public.pet_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE,
    interaction_type TEXT CHECK (interaction_type IN ('like', 'pass', 'super_like')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, pet_id)
);

-- 7. Create ai_chat_sessions table
CREATE TABLE IF NOT EXISTS public.ai_chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    session_name TEXT,
    context JSONB DEFAULT '{}',
    message_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create ai_chat_messages table
CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pets_adoption_status ON public.pets(adoption_status);
CREATE INDEX IF NOT EXISTS idx_pets_location ON public.pets(location);
CREATE INDEX IF NOT EXISTS idx_pets_breed ON public.pets(breed);
CREATE INDEX IF NOT EXISTS idx_learning_articles_category ON public.learning_articles(category);
CREATE INDEX IF NOT EXISTS idx_learning_articles_published ON public.learning_articles(published);
CREATE INDEX IF NOT EXISTS idx_pet_favorites_user_id ON public.pet_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_pet_interactions_user_id ON public.pet_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_session_id ON public.ai_chat_messages(session_id);

-- 10. Add updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Add triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_pets_updated_at
    BEFORE UPDATE ON public.pets
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_learning_articles_updated_at
    BEFORE UPDATE ON public.learning_articles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_ai_chat_sessions_updated_at
    BEFORE UPDATE ON public.ai_chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 12. Add function to create user profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Create trigger for automatic user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 14. Set admin user
UPDATE public.user_profiles 
SET is_admin = TRUE 
WHERE email = 'fahim.cse.bubt@gmail.com';

-- If the profile doesn't exist yet, insert it
INSERT INTO public.user_profiles (id, email, full_name, is_admin)
SELECT 
    auth.users.id,
    'fahim.cse.bubt@gmail.com',
    'Fahim Admin',
    TRUE
FROM auth.users 
WHERE auth.users.email = 'fahim.cse.bubt@gmail.com'
ON CONFLICT (id) DO UPDATE SET is_admin = TRUE;
