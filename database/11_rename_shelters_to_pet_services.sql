-- Migration to rename the shelters table to pet_services for consistency
-- This script ensures database alignment with UI naming

-- Create a new pet_services table with the same structure as shelters
CREATE TABLE IF NOT EXISTS public.pet_services (
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
    service_type TEXT DEFAULT 'shelter', -- New field: shelter, clinic, store, grooming, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Copy all data from shelters to pet_services
INSERT INTO public.pet_services (
    id, name, email, phone, address, city, state, zip_code, 
    website, description, logo_url, is_verified, rating, created_at, updated_at
)
SELECT 
    id, name, email, phone, address, city, state, zip_code, 
    website, description, logo_url, is_verified, rating, created_at, updated_at
FROM public.shelters
ON CONFLICT (id) DO NOTHING;

-- Update all foreign key references in pets table
ALTER TABLE public.pets 
DROP CONSTRAINT IF EXISTS pets_shelter_id_fkey;

-- Rename the column from shelter_id to service_id
ALTER TABLE public.pets 
RENAME COLUMN shelter_id TO service_id;

-- Add the new foreign key constraint
ALTER TABLE public.pets 
ADD CONSTRAINT pets_service_id_fkey 
FOREIGN KEY (service_id) REFERENCES public.pet_services(id) ON DELETE SET NULL;

-- Set up storage policies for pet service logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pet-service-logos', 'pet-service-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Copy existing logos to the new bucket
-- Note: This would need to be done programmatically outside of SQL

-- Set up storage policies for pet service logos
CREATE POLICY "Allow public read access to pet service logos" ON storage.objects 
FOR SELECT USING (bucket_id = 'pet-service-logos');

CREATE POLICY "Allow admin to upload pet service logos" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'pet-service-logos');

CREATE POLICY "Allow admin to update pet service logos" ON storage.objects 
FOR UPDATE USING (bucket_id = 'pet-service-logos');

CREATE POLICY "Allow admin to delete pet service logos" ON storage.objects 
FOR DELETE USING (bucket_id = 'pet-service-logos');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pet_services_is_verified ON public.pet_services(is_verified);
CREATE INDEX IF NOT EXISTS idx_pet_services_service_type ON public.pet_services(service_type);

-- Create a view for backward compatibility (optional)
CREATE OR REPLACE VIEW public.shelters_view AS
SELECT * FROM public.pet_services WHERE service_type = 'shelter';

-- IMPORTANT: After confirming the migration worked correctly, 
-- you can drop the old shelters table with:
-- DROP TABLE public.shelters;
