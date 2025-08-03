-- Additional tables for notifications and adoption management
-- Run after the main schema setup

-- Notifications table for user notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('adoption_approved', 'adoption_rejected', 'adoption_pending', 'message', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
  pet_name VARCHAR(100),
  pet_image TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adoption applications table
CREATE TABLE IF NOT EXISTS adoption_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  application_message TEXT,
  admin_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES auth.users(id)
);

-- User messages/conversations table
CREATE TABLE IF NOT EXISTS user_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES adoption_applications(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Extend user_profiles table with additional fields
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS housing_type VARCHAR(50) CHECK (housing_type IN ('house', 'apartment', 'condo', 'other')),
ADD COLUMN IF NOT EXISTS has_yard BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS other_pets TEXT,
ADD COLUMN IF NOT EXISTS experience_level VARCHAR(20) CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
ADD COLUMN IF NOT EXISTS date_joined TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_adoption_applications_user_id ON adoption_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_adoption_applications_pet_id ON adoption_applications(pet_id);
CREATE INDEX IF NOT EXISTS idx_adoption_applications_status ON adoption_applications(status);
CREATE INDEX IF NOT EXISTS idx_user_messages_application_id ON user_messages(application_id);

-- Create admin statistics view
CREATE OR REPLACE VIEW admin_stats AS
SELECT 
  (SELECT COUNT(*) FROM pets WHERE adoption_status = 'available') as available_pets,
  (SELECT COUNT(*) FROM pets WHERE adoption_status = 'adopted') as adopted_pets,
  (SELECT COUNT(*) FROM pets WHERE adoption_status = 'pending') as pending_pets,
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM learning_articles WHERE published = true) as published_articles,
  (SELECT COUNT(*) FROM adoption_applications WHERE status = 'pending') as pending_applications,
  (SELECT COUNT(*) FROM adoption_applications WHERE status = 'approved') as approved_applications,
  (SELECT COUNT(*) FROM notifications WHERE read = false) as unread_notifications,
  (SELECT COUNT(*) FROM pets WHERE created_at >= NOW() - INTERVAL '30 days') as new_pets_this_month,
  (SELECT COUNT(*) FROM adoption_applications WHERE submitted_at >= NOW() - INTERVAL '30 days') as new_applications_this_month;

-- Update existing updated_at trigger for new tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_notifications_updated_at 
  BEFORE UPDATE ON notifications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create notification when adoption application is submitted
CREATE OR REPLACE FUNCTION create_adoption_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Get pet information
  INSERT INTO notifications (user_id, type, title, message, pet_id, pet_name, pet_image)
  SELECT 
    NEW.user_id,
    'adoption_pending',
    'Application Submitted Successfully! 📋',
    'Your adoption application for ' || p.name || ' has been submitted and is under review. We will contact you within 2-3 business days.',
    NEW.pet_id,
    p.name,
    p.images[1]
  FROM pets p 
  WHERE p.id = NEW.pet_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for adoption applications
CREATE TRIGGER adoption_application_notification 
  AFTER INSERT ON adoption_applications 
  FOR EACH ROW EXECUTE FUNCTION create_adoption_notification();

-- Function to create notification when adoption application status changes
CREATE OR REPLACE FUNCTION create_status_change_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    INSERT INTO notifications (user_id, type, title, message, pet_id, pet_name, pet_image)
    SELECT 
      NEW.user_id,
      CASE 
        WHEN NEW.status = 'approved' THEN 'adoption_approved'
        WHEN NEW.status = 'rejected' THEN 'adoption_rejected'
        ELSE 'system'
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN 'Adoption Request Approved! 🎉'
        WHEN NEW.status = 'rejected' THEN 'Application Update 📝'
        ELSE 'Application Status Updated'
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN 'Congratulations! Your adoption application for ' || p.name || ' has been approved! Please contact us to arrange pickup.'
        WHEN NEW.status = 'rejected' THEN 'Unfortunately, your application for ' || p.name || ' was not selected this time. Please consider applying for other pets.'
        ELSE 'Your application status for ' || p.name || ' has been updated to: ' || NEW.status
      END,
      NEW.pet_id,
      p.name,
      p.images[1]
    FROM pets p 
    WHERE p.id = NEW.pet_id;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for adoption application status changes
CREATE TRIGGER adoption_status_change_notification 
  AFTER UPDATE ON adoption_applications 
  FOR EACH ROW EXECUTE FUNCTION create_status_change_notification();
