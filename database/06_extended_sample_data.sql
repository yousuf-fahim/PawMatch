-- Sample data for extended tables
-- Run after 05_extended_rls_policies.sql

-- Insert sample adoption applications
INSERT INTO adoption_applications (id, user_id, pet_id, status, application_message, submitted_at) VALUES
  (gen_random_uuid(), (SELECT id FROM auth.users LIMIT 1), 
   (SELECT id FROM pets WHERE name = 'Max' LIMIT 1), 
   'pending', 
   'I am very interested in adopting Max. I have experience with Golden Retrievers and have a large fenced yard. I work from home so I can provide plenty of attention and exercise.',
   NOW() - INTERVAL '2 days'
  ),
  (gen_random_uuid(), (SELECT id FROM auth.users LIMIT 1), 
   (SELECT id FROM pets WHERE name = 'Luna' LIMIT 1), 
   'approved', 
   'Luna would be perfect for our family. We have two children who love cats and we are looking for a gentle companion.',
   NOW() - INTERVAL '5 days'
  ),
  (gen_random_uuid(), (SELECT id FROM auth.users LIMIT 1), 
   (SELECT id FROM pets WHERE name = 'Charlie' LIMIT 1), 
   'rejected', 
   'I would love to give Charlie a loving home. I live in an apartment but take daily walks and have experience with small dogs.',
   NOW() - INTERVAL '1 week'
  );

-- Insert sample notifications (these would normally be created by triggers)
INSERT INTO notifications (id, user_id, type, title, message, pet_id, pet_name, pet_image, read, created_at) VALUES
  (gen_random_uuid(), 
   (SELECT id FROM auth.users LIMIT 1),
   'adoption_approved',
   'Adoption Request Approved! 🎉',
   'Congratulations! Your adoption application for Luna has been approved! Please contact Happy Paws Rescue to arrange pickup.',
   (SELECT id FROM pets WHERE name = 'Luna' LIMIT 1),
   'Luna',
   'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&h=400',
   false,
   NOW() - INTERVAL '1 hour'
  ),
  (gen_random_uuid(), 
   (SELECT id FROM auth.users LIMIT 1),
   'adoption_pending',
   'Application Under Review 📋',
   'Your adoption application for Max has been submitted and is under review. We will contact you within 2-3 business days.',
   (SELECT id FROM pets WHERE name = 'Max' LIMIT 1),
   'Max',
   'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=400&h=400',
   true,
   NOW() - INTERVAL '2 days'
  ),
  (gen_random_uuid(), 
   (SELECT id FROM auth.users LIMIT 1),
   'message',
   'New Message from Happy Paws Rescue 💬',
   'Thank you for your interest in adopting Max. We have a few questions about your living situation. Please check your application for details.',
   (SELECT id FROM pets WHERE name = 'Max' LIMIT 1),
   'Max',
   'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=400&h=400',
   true,
   NOW() - INTERVAL '3 days'
  ),
  (gen_random_uuid(), 
   (SELECT id FROM auth.users LIMIT 1),
   'adoption_rejected',
   'Application Update 📝',
   'Unfortunately, your application for Charlie was not selected this time. Please consider applying for other pets that might be a great match!',
   (SELECT id FROM pets WHERE name = 'Charlie' LIMIT 1),
   'Charlie',
   'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&h=400',
   true,
   NOW() - INTERVAL '1 week'
  ),
  (gen_random_uuid(), 
   (SELECT id FROM auth.users LIMIT 1),
   'system',
   'Welcome to PawMatch! 🐾',
   'Thank you for joining PawMatch! Start exploring pets available for adoption and find your perfect companion.',
   NULL,
   NULL,
   NULL,
   false,
   NOW() - INTERVAL '2 weeks'
  );

-- Update user profiles with additional information
UPDATE user_profiles SET
  phone = '+1 (555) 123-4567',
  address = '123 Pet Lover Street, Austin, TX 78701',
  emergency_contact_name = 'Jane Smith',
  emergency_contact_phone = '+1 (555) 987-6543',
  housing_type = 'house',
  has_yard = true,
  other_pets = 'One 3-year-old Golden Retriever named Buddy',
  experience_level = 'intermediate',
  date_joined = NOW() - INTERVAL '3 months'
WHERE is_admin = false;

-- Insert sample messages for applications
INSERT INTO user_messages (application_id, sender_id, receiver_id, message, read, sent_at)
SELECT 
  aa.id,
  (SELECT id FROM user_profiles WHERE is_admin = true LIMIT 1),
  aa.user_id,
  'Thank you for your application! We would like to schedule a phone interview. What days work best for you this week?',
  false,
  NOW() - INTERVAL '1 day'
FROM adoption_applications aa 
WHERE aa.status = 'pending'
LIMIT 1;
