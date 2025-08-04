-- Adoption Applications Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.adoption_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
    application_data JSONB DEFAULT '{}',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.user_profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, pet_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_adoption_applications_user_id ON public.adoption_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_adoption_applications_pet_id ON public.adoption_applications(pet_id);
CREATE INDEX IF NOT EXISTS idx_adoption_applications_status ON public.adoption_applications(status);
CREATE INDEX IF NOT EXISTS idx_adoption_applications_submitted_at ON public.adoption_applications(submitted_at);

-- Row Level Security Policies
ALTER TABLE public.adoption_applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own applications
CREATE POLICY "Users can view their own applications" ON public.adoption_applications
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Users can create applications for themselves
CREATE POLICY "Users can create their own applications" ON public.adoption_applications
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending applications
CREATE POLICY "Users can update their own pending applications" ON public.adoption_applications
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id AND status = 'pending')
    WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Admin policies for full access
CREATE POLICY "Allow admin users full access to applications" ON public.adoption_applications
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND is_admin = true
  )
);

COMMIT;
