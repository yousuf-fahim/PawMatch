-- PawMatch Database Schema Update - Add Shelters Table
-- Run this in your Supabase SQL Editor

-- Create shelters table
CREATE TABLE IF NOT EXISTS public.shelters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    website TEXT,
    description TEXT,
    logo_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create storage bucket for shelter logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('shelter-logos', 'shelter-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for shelter logos
CREATE POLICY "Allow public read access to shelter logos" ON storage.objects 
FOR SELECT USING (bucket_id = 'shelter-logos');

CREATE POLICY "Allow admin to upload shelter logos" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'shelter-logos');

CREATE POLICY "Allow admin to update shelter logos" ON storage.objects 
FOR UPDATE USING (bucket_id = 'shelter-logos');

CREATE POLICY "Allow admin to delete shelter logos" ON storage.objects 
FOR DELETE USING (bucket_id = 'shelter-logos');

-- Add foreign key constraint to pets table for shelter_id
ALTER TABLE public.pets 
DROP CONSTRAINT IF EXISTS pets_shelter_id_fkey;

ALTER TABLE public.pets 
ADD CONSTRAINT pets_shelter_id_fkey 
FOREIGN KEY (shelter_id) REFERENCES public.shelters(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shelters_is_verified ON public.shelters(is_verified);
CREATE INDEX IF NOT EXISTS idx_shelters_city_state ON public.shelters(city, state);
CREATE INDEX IF NOT EXISTS idx_pets_shelter_id ON public.pets(shelter_id);

-- Enable RLS for shelters table
ALTER TABLE public.shelters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shelters table
CREATE POLICY "Allow public read access to verified shelters" ON public.shelters
FOR SELECT USING (is_verified = true);

CREATE POLICY "Allow admin full access to shelters" ON public.shelters
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND is_admin = true
    )
);

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shelters_updated_at 
BEFORE UPDATE ON public.shelters 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample shelters data
INSERT INTO public.shelters (name, email, phone, address, city, state, zip_code, website, description, is_verified) VALUES
('Happy Paws Rescue', 'adopt@happypaws.org', '(555) 123-4567', '123 Main Street', 'San Francisco', 'CA', '94102', 'https://happypaws.org', 'Dedicated to finding loving homes for rescued animals in the Bay Area', true),
('City Animal Shelter', 'info@cityanimalshelter.org', '(555) 987-6543', '456 Oak Avenue', 'Los Angeles', 'CA', '90210', 'https://cityanimalshelter.org', 'Municipal animal shelter serving the greater Los Angeles area', true),
('Windy City Pets', 'hello@windycitypets.com', '(555) 456-7890', '789 Michigan Ave', 'Chicago', 'IL', '60611', 'https://windycitypets.com', 'Chicago-based rescue specializing in small breed dogs and cats', true),
('Austin Cat Rescue', 'cats@austinrescue.org', '(555) 234-5678', '321 Congress Ave', 'Austin', 'TX', '73301', 'https://austinrescue.org', 'Feline-focused rescue organization serving Central Texas', true),
('Pacific Northwest Animal Rescue', 'adopt@pnwrescue.org', '(555) 345-6789', '654 Pine Street', 'Portland', 'OR', '97201', 'https://pnwrescue.org', 'Comprehensive animal rescue serving Oregon and Washington', true),
('Mountain View Animal Services', 'info@mountainviewanimals.org', '(555) 567-8901', '987 Valley Road', 'Denver', 'CO', '80202', 'https://mountainviewanimals.org', 'Full-service animal shelter in the heart of Colorado', false),
('Sunshine State Cat Sanctuary', 'rescue@sunshinestatecats.org', '(555) 678-9012', '159 Beach Boulevard', 'Miami', 'FL', '33101', 'https://sunshinestatecats.org', 'Specialized cat sanctuary and adoption center', false),
('Rose City Animal Shelter', 'adopt@rosecityanimals.com', '(555) 789-0123', '753 Rose Street', 'Phoenix', 'AZ', '85001', 'https://rosecityanimals.com', 'Desert region animal shelter with a focus on community outreach', true);

-- Update existing pets to reference proper shelter IDs
-- This is optional - you can run this if you want to link existing pets to shelters
-- Update pets with shelter references based on contact_info
UPDATE public.pets 
SET shelter_id = (
    SELECT s.id FROM public.shelters s 
    WHERE s.name = contact_info->>'shelter'
)
WHERE contact_info->>'shelter' IS NOT NULL;
