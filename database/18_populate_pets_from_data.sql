-- Populate pets table with data from pets.ts
-- This script can be run in Supabase SQL Editor

-- First, temporarily disable RLS to allow bulk insert
ALTER TABLE pets DISABLE ROW LEVEL SECURITY;

-- Clear existing pets data
DELETE FROM pets;

-- Insert pets data (using gen_random_uuid() for proper UUID generation)
INSERT INTO pets (id, name, age, breed, location, description, personality, gender, size, images, created_at, updated_at) VALUES

-- Bengali pets with Unsplash images
(gen_random_uuid(), 'Luna', 2, 'Golden Retriever', 'Dhaka, Bangladesh', 
 '🌙 Luna is a sweet golden retriever who loves kids and belly rubs. She''s house-trained and knows basic commands. Perfect family companion!',
 ARRAY['Gentle', 'Loving', 'Patient', 'Loyal'], 'female', 'large', 
 ARRAY['https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&h=1200'], 
 NOW(), NOW()),

(gen_random_uuid(), 'Milo', 1, 'Husky Puppy', 'Chittagong, Bangladesh',
 '🐺 Milo is a beautiful husky puppy with stunning blue eyes! He''s full of energy and loves to play. Needs an active family who can keep up with his adventures.',
 ARRAY['Energetic', 'Playful', 'Smart', 'Curious'], 'male', 'medium',
 ARRAY['https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=800&h=1200'],
 NOW(), NOW()),

(gen_random_uuid(), 'Coco', 3, 'Brown Tabby Cat', 'Sylhet, Bangladesh',
 '🐱 Coco is a gorgeous tabby cat who loves sunny windowsills and gentle pets. She''s perfect for someone who wants a calm, loving companion.',
 ARRAY['Independent', 'Affectionate', 'Calm', 'Graceful'], 'female', 'medium',
 ARRAY['https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=800&h=1200'],
 NOW(), NOW()),

(gen_random_uuid(), 'Rex', 4, 'German Shepherd', 'Rajshahi, Bangladesh',
 '🛡️ Rex is a noble German Shepherd with a heart of gold. He''s well-trained, protective of his family, and great with children. A true guardian companion.',
 ARRAY['Protective', 'Intelligent', 'Loyal', 'Brave'], 'male', 'large',
 ARRAY['https://images.unsplash.com/photo-1551717743-49959800b1f6?auto=format&fit=crop&w=800&h=1200'],
 NOW(), NOW()),

(gen_random_uuid(), 'Bella', 1, 'Pomeranian', 'Barisal, Bangladesh',
 '☁️ Bella is a fluffy little cloud of happiness! This tiny Pomeranian has a big personality and loves to be the center of attention.',
 ARRAY['Fluffy', 'Cheerful', 'Tiny', 'Adorable'], 'female', 'small',
 ARRAY['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&h=1200'],
 NOW(), NOW()),

(gen_random_uuid(), 'Buddy', 5, 'Beagle', 'Khulna, Bangladesh',
 '🔍 Buddy is a sweet beagle who loves sniffing around and making new friends. He''s great with kids and other pets. Always ready for an adventure!',
 ARRAY['Friendly', 'Curious', 'Gentle', 'Social'], 'male', 'medium',
 ARRAY['https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&w=800&h=1200'],
 NOW(), NOW()),

(gen_random_uuid(), 'Princess', 2, 'Persian Cat', 'Comilla, Bangladesh',
 '👑 Princess lives up to her name! This beautiful Persian cat loves luxury and gentle brushing. She''s looking for a royal family to spoil her.',
 ARRAY['Elegant', 'Regal', 'Calm', 'Affectionate'], 'female', 'medium',
 ARRAY['https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?auto=format&fit=crop&w=800&h=1200'],
 NOW(), NOW()),

(gen_random_uuid(), 'Rocky', 6, 'Rottweiler', 'Rangpur, Bangladesh',
 '💪 Rocky is a gentle giant with a heart full of love. Despite his size, he''s incredibly gentle with children and makes an excellent family guardian.',
 ARRAY['Strong', 'Loyal', 'Gentle', 'Protective'], 'male', 'large',
 ARRAY['https://images.unsplash.com/photo-1567752881298-894bb81f9379?auto=format&fit=crop&w=800&h=1200'],
 NOW(), NOW()),

-- Special pet: PEU with multiple images
(gen_random_uuid(), 'PEU', 1, 'Persian', 'Mirpur, Dhaka',
 'Only Reason I''m not scratching you is cuz of those treats you have',
 ARRAY['Sassy', 'Energetic', 'Playful', 'Loyal? :3'], 'female', 'large',
 ARRAY[
   'https://i.postimg.cc/SKrr6bvQ/524633813-743262541767934-2267632741324460097-n.jpg',
   'https://i.postimg.cc/rwPDrn80/Peu.jpg',
   'https://i.postimg.cc/pTcJSYvg/524379309-741998155220040-4901113047303928629-n.jpg',
   'https://i.postimg.cc/rmw9gZB1/523413172-1287359642971831-8976397684880539111-n.jpg',
   'https://i.postimg.cc/Y0JfrrhR/522867184-2462931890741988-4345646540119893060-n.jpg',
   'https://i.postimg.cc/FzfVXds1/518140056-537361346069335-246031076602927395-n.jpg'
 ],
 NOW(), NOW()),

-- US pets from original data
(gen_random_uuid(), 'Max', 3, 'Labrador Mix', 'Los Angeles, CA',
 'Max is a gentle giant who loves cuddles and is perfect for families. He is well-trained and house-broken.',
 ARRAY['Gentle', 'Calm', 'Affectionate', 'Smart'], 'male', 'large',
 ARRAY['https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg?auto=compress&cs=tinysrgb&w=800&h=1066'],
 NOW(), NOW()),

(gen_random_uuid(), 'Bella', 1, 'French Bulldog', 'New York, NY',
 'Bella is a charming French Bulldog who loves to be around people. She is perfect for apartment living.',
 ARRAY['Charming', 'Playful', 'Adaptable', 'Sociable'], 'female', 'small',
 ARRAY['https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg?auto=compress&cs=tinysrgb&w=800&h=1066'],
 NOW(), NOW()),

(gen_random_uuid(), 'Charlie', 4, 'Border Collie', 'Seattle, WA',
 'Charlie is an incredibly smart Border Collie who loves mental challenges and physical activities.',
 ARRAY['Intelligent', 'Active', 'Focused', 'Loyal'], 'male', 'medium',
 ARRAY['https://images.pexels.com/photos/551628/pexels-photo-551628.jpeg?auto=compress&cs=tinysrgb&w=800&h=1066'],
 NOW(), NOW()),

(gen_random_uuid(), 'Daisy', 2, 'Beagle', 'Austin, TX',
 'Daisy is a sweet Beagle who loves exploring and is wonderful with children of all ages.',
 ARRAY['Curious', 'Friendly', 'Gentle', 'Patient'], 'female', 'medium',
 ARRAY['https://images.pexels.com/photos/1490908/pexels-photo-1490908.jpeg?auto=compress&cs=tinysrgb&w=800&h=1066'],
 NOW(), NOW()),

(gen_random_uuid(), 'Oliver', 3, 'Maine Coon Cat', 'Boston, MA',
 'Oliver is a magnificent Maine Coon with a gentle temperament. He enjoys quiet companionship and window watching.',
 ARRAY['Majestic', 'Calm', 'Independent', 'Affectionate'], 'male', 'large',
 ARRAY['https://images.pexels.com/photos/2194261/pexels-photo-2194261.jpeg?auto=compress&cs=tinysrgb&w=800&h=1066'],
 NOW(), NOW()),

(gen_random_uuid(), 'Mia', 1, 'Siberian Cat', 'Denver, CO',
 'Mia is a beautiful Siberian cat who loves interactive play and exploring new spaces. Great with other pets.',
 ARRAY['Playful', 'Adventurous', 'Social', 'Curious'], 'female', 'medium',
 ARRAY['https://images.pexels.com/photos/1741205/pexels-photo-1741205.jpeg?auto=compress&cs=tinysrgb&w=800&h=1066'],
 NOW(), NOW()),

(gen_random_uuid(), 'Buddy', 5, 'Poodle', 'Miami, FL',
 'Buddy is a smart Poodle who is great for families with allergies. He loves to learn new tricks.',
 ARRAY['Intelligent', 'Hypoallergenic', 'Trainable', 'Elegant'], 'male', 'medium',
 ARRAY['https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=800&h=1066'],
 NOW(), NOW()),

(gen_random_uuid(), 'Zoe', 1, 'Ragdoll Cat', 'Portland, OR',
 'Zoe is a young Ragdoll kitten with the sweetest temperament. She loves being held and cuddled.',
 ARRAY['Docile', 'Affectionate', 'Relaxed', 'Gentle'], 'female', 'medium',
 ARRAY['https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&cs=tinysrgb&w=800&h=1066'],
 NOW(), NOW()),

(gen_random_uuid(), 'Rocky', 7, 'German Shepherd', 'Phoenix, AZ',
 'Rocky is a mature, well-trained German Shepherd looking for a quiet home. Perfect for experienced dog owners.',
 ARRAY['Loyal', 'Protective', 'Intelligent', 'Calm'], 'male', 'large',
 ARRAY['https://images.pexels.com/photos/333083/pexels-photo-333083.jpeg?auto=compress&cs=tinysrgb&w=800&h=1066'],
 NOW(), NOW()),

(gen_random_uuid(), 'Coco', 2, 'Holland Lop Rabbit', 'Chicago, IL',
 'Coco is a sweet Holland Lop rabbit who enjoys gentle pets and fresh vegetables. Perfect for families.',
 ARRAY['Gentle', 'Quiet', 'Social', 'Adorable'], 'female', 'small',
 ARRAY['https://images.pexels.com/photos/326012/pexels-photo-326012.jpeg?auto=compress&cs=tinysrgb&w=800&h=1066'],
 NOW(), NOW()),

(gen_random_uuid(), 'Jasper', 4, 'Cockatiel', 'Tampa, FL',
 'Jasper is a charming Cockatiel who loves to whistle and learn new songs. He enjoys social interaction.',
 ARRAY['Musical', 'Social', 'Intelligent', 'Vocal'], 'male', 'small',
 ARRAY['https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg?auto=compress&cs=tinysrgb&w=800&h=1066'],
 NOW(), NOW()),

(gen_random_uuid(), 'Shadow', 8, 'Senior Mixed Cat', 'Nashville, TN',
 'Shadow is a senior cat looking for a peaceful retirement home. He has so much love to give to the right family.',
 ARRAY['Wise', 'Calm', 'Loving', 'Low-maintenance'], 'male', 'medium',
 ARRAY['https://images.pexels.com/photos/1484475/pexels-photo-1484475.jpeg?auto=compress&cs=tinysrgb&w=800&h=1066'],
 NOW(), NOW()),

(gen_random_uuid(), 'Hope', 3, 'Three-legged Golden Mix', 'San Diego, CA',
 'Hope is a special needs dog who proves that disabilities don''t limit love. She''s adapted wonderfully and lives life to the fullest.',
 ARRAY['Resilient', 'Happy', 'Adaptable', 'Inspiring'], 'female', 'medium',
 ARRAY['https://images.pexels.com/photos/1938126/pexels-photo-1938126.jpeg?auto=compress&cs=tinysrgb&w=800&h=1066'],
 NOW(), NOW()),

(gen_random_uuid(), 'Leo', 1, 'Bengal Cat', 'Las Vegas, NV',
 'Leo is a stunning Bengal cat with wild markings and an adventurous spirit. He needs an active family who appreciates his unique personality.',
 ARRAY['Wild', 'Energetic', 'Athletic', 'Striking'], 'male', 'medium',
 ARRAY['https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg?auto=compress&cs=tinysrgb&w=800&h=1066'],
 NOW(), NOW());

-- Re-enable RLS after insert
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- Verify the data was inserted
SELECT COUNT(*) as total_pets FROM pets;
SELECT name, breed, location FROM pets WHERE location LIKE '%Bangladesh%';

-- Note: After running this script, existing pet_favorites and pet_interactions 
-- will automatically reference the new pet IDs due to foreign key constraints
-- No manual updates needed as we're using gen_random_uuid() for new IDs

COMMIT;
