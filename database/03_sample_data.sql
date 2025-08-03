-- PawMatch Sample Data
-- Run this AFTER setting up schema and RLS policies
-- This will populate your database with sample pets and articles

-- Insert sample learning articles
INSERT INTO public.learning_articles (title, content, excerpt, author, category, subcategory, difficulty, read_time, tags, featured_image, published) VALUES
('First-Time Pet Owner Guide', 
'# Getting Started with Your First Pet

Bringing home your first pet is an exciting milestone! Here''s everything you need to know to ensure a smooth transition for both you and your new companion.

## Before You Bring Your Pet Home

### Essential Supplies
- Food and water bowls
- High-quality pet food
- Comfortable bed or crate
- Toys for mental stimulation
- Leash and collar (for dogs)
- Litter box and litter (for cats)

### Preparing Your Home
Make sure your home is pet-proofed by removing hazardous items and securing loose cables.

## The First Week

Your pet will need time to adjust to their new environment. Be patient and establish routines early.

### Feeding Schedule
- Puppies: 3-4 times daily
- Adult dogs: 2 times daily  
- Cats: 2-3 times daily

### House Training
Consistency is key. Take dogs outside frequently and reward good behavior.

## Building Trust

Spend quality time with your pet through gentle play and positive interactions. This builds the foundation for a lifelong bond.

Remember, every pet is unique. Observe their personality and adjust your approach accordingly.',
'Everything you need to know for welcoming your first pet home successfully.',
'Dr. Sarah Johnson',
'pet-care',
'getting-started',
'beginner',
8,
ARRAY['first-time', 'basics', 'preparation'],
'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
true),

('Understanding Pet Nutrition', 
'# The Complete Guide to Pet Nutrition

Proper nutrition is the foundation of your pet''s health and longevity. Understanding what makes a balanced diet can help you make informed decisions about your pet''s meals.

## Key Nutritional Components

### Proteins
Essential for muscle development and repair. Look for named meat sources as the first ingredient.

### Carbohydrates
Provide energy and fiber. Whole grains and vegetables are excellent sources.

### Fats
Support skin health and provide concentrated energy. Omega-3 and Omega-6 fatty acids are particularly important.

### Vitamins and Minerals
Support immune function and overall health.

## Reading Pet Food Labels

Learn to decode ingredient lists and guaranteed analysis panels to make informed choices.

### Red Flags
- Unnamed meat by-products
- Excessive fillers
- Artificial preservatives
- Vague ingredient names

## Age-Specific Nutrition

### Puppies and Kittens
Need higher protein and fat content for growth.

### Adult Pets
Require balanced maintenance diets.

### Senior Pets
May need adjusted protein levels and joint support.

## Special Dietary Considerations

Some pets may have allergies or health conditions requiring specialized diets. Always consult your veterinarian for specific dietary recommendations.',
'Learn how to provide optimal nutrition for your pet''s health and wellbeing.',
'Dr. Michael Chen',
'pet-care',
'nutrition',
'intermediate',
12,
ARRAY['nutrition', 'health', 'diet'],
'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800',
true),

('Pet Emergency First Aid', 
'# Emergency First Aid for Pets

Knowing basic first aid can be life-saving in emergency situations. Here are essential skills every pet owner should know.

## When to Seek Emergency Care

### Immediate Emergency Signs
- Difficulty breathing
- Unconsciousness
- Severe bleeding
- Suspected poisoning
- Choking
- Seizures lasting more than 2 minutes

## Basic First Aid Techniques

### Checking Vital Signs
- **Heart Rate**: Place hand on chest or feel pulse on inner thigh
- **Breathing**: Watch chest rise and fall
- **Temperature**: Normal range is 101-102.5°F for dogs and cats

### Wound Care
1. Apply direct pressure to control bleeding
2. Clean with sterile saline if available
3. Cover with clean bandage
4. Seek veterinary care

### Choking Response
For dogs:
1. Open mouth and look for visible objects
2. Use tweezers to remove if safely accessible
3. For small dogs, hold upside down and give sharp taps between shoulder blades
4. For large dogs, lift hind legs and push firmly upward and forward just below rib cage

## Creating a Pet First Aid Kit

Essential items to keep on hand:
- Gauze pads and bandages
- Medical tape
- Antiseptic wipes
- Digital thermometer
- Emergency contact numbers
- Saline solution
- Tweezers

## Prevention is Key

Most emergencies can be prevented through proper pet-proofing and regular veterinary care.',
'Essential first aid knowledge every pet owner needs in emergency situations.',
'Emergency Vet Team',
'pet-care',
'health',
'advanced',
15,
ARRAY['emergency', 'first-aid', 'safety'],
'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800',
true),

('Training Your Dog: Basic Commands', 
'# Essential Dog Training Commands

Teaching your dog basic commands creates a foundation for good behavior and strengthens your bond.

## The Big Five Commands

### 1. Sit
The most fundamental command that sets the stage for all other training.

**Training Steps:**
1. Hold treat close to dog''s nose
2. Slowly lift treat up and back over their head
3. As their head follows the treat, their bottom should touch the ground
4. Say "Sit" and immediately give treat and praise
5. Practice 5-10 times daily

### 2. Stay
Teaches impulse control and patience.

**Training Steps:**
1. Start with dog in sit position
2. Hold hand up in "stop" gesture
3. Take one small step back
4. Wait 1-2 seconds, then return and reward
5. Gradually increase distance and duration

### 3. Come
Critical for safety and recall.

**Training Steps:**
1. Start in a safe, enclosed area
2. Get down to their level and say "Come" enthusiastically
3. Reward generously when they come
4. Never call them to come for something they perceive as negative

### 4. Down
Useful for calm, controlled behavior.

**Training Steps:**
1. Start with dog in sit position
2. Hold treat to their nose, then lower to ground
3. Say "Down" as they follow the treat
4. Reward when elbows touch ground

### 5. Leave It
Prevents dogs from picking up dangerous items.

**Training Steps:**
1. Hold treat in closed fist
2. Say "Leave it"
3. Wait until they stop trying to get it
4. Reward with different treat

## Training Tips

- Keep sessions short (5-10 minutes)
- End on a positive note
- Be consistent with commands
- Use positive reinforcement
- Practice daily',
'Master the five essential commands every dog should know for safety and good behavior.',
'Professional Dog Trainer Sarah Lee',
'training',
'basic-commands',
'beginner',
10,
ARRAY['training', 'commands', 'obedience'],
'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
true),

('Cat Behavior: Understanding Your Feline', 
'# Decoding Cat Behavior

Cats communicate in subtle ways. Understanding their body language and behaviors helps you build a stronger relationship with your feline friend.

## Body Language Basics

### Tail Positions
- **Upright with curved tip**: Happy and confident
- **Puffed up**: Scared or angry
- **Low or tucked**: Anxious or submissive
- **Twitching**: Excited or agitated

### Ear Positions
- **Forward**: Alert and interested
- **Flattened back**: Scared or angry
- **Swiveling**: Listening to sounds

### Eye Contact
- **Slow blinks**: Sign of trust and affection
- **Direct stare**: Can be perceived as threatening
- **Dilated pupils**: Excited, scared, or stimulated

## Common Behaviors Explained

### Kneading
Cats knead with their paws when content, a behavior retained from nursing.

### Purring
Usually indicates contentment, but cats may also purr when stressed or in pain.

### Head Butting
A sign of affection and territorial marking with scent glands.

### Chattering
Often occurs when watching birds or prey through windows.

## Solving Common Issues

### Litter Box Problems
- Keep box clean
- Provide one box per cat plus one extra
- Use unscented, clumping litter
- Place boxes in quiet, accessible locations

### Scratching Furniture
- Provide appropriate scratching posts
- Use different textures (sisal, carpet, cardboard)
- Place posts near sleeping areas
- Trim nails regularly

### Excessive Meowing
- May indicate hunger, attention-seeking, or medical issues
- Respond to needs appropriately
- Avoid reinforcing attention-seeking behavior

## Environmental Enrichment

Cats need mental and physical stimulation:
- Interactive toys
- Climbing structures
- Window perches
- Puzzle feeders',
'Learn to understand and respond to your cat''s unique communication style and needs.',
'Feline Behaviorist Dr. Lisa Martinez',
'behavior',
'understanding-cats',
'intermediate',
11,
ARRAY['cats', 'behavior', 'communication'],
'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800',
true);

-- Insert sample pets
INSERT INTO public.pets (name, breed, age, gender, size, color, personality, description, images, location, contact_info, adoption_status) VALUES
('Luna', 'Golden Retriever Mix', 2, 'female', 'medium', 'Golden', 
ARRAY['Friendly', 'Energetic', 'Loyal'], 
'Luna is a sweet 2-year-old Golden Retriever mix who loves to play fetch and go on long walks. She''s great with kids and other dogs, and is looking for an active family to call her own.',
ARRAY['https://images.unsplash.com/photo-1552053831-71594a27632d?w=400', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400'],
'New York, NY',
'{"shelter": "Happy Paws Rescue", "phone": "(555) 123-4567", "email": "adopt@happypaws.org"}',
'available'),

('Max', 'German Shepherd', 4, 'male', 'large', 'Black and Tan',
ARRAY['Protective', 'Intelligent', 'Gentle'],
'Max is a 4-year-old German Shepherd who is both gentle and protective. He''s house-trained, knows basic commands, and would make an excellent companion for an experienced dog owner.',
ARRAY['https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400', 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400'],
'Los Angeles, CA',
'{"shelter": "City Animal Shelter", "phone": "(555) 987-6543", "email": "info@cityanimalshelter.org"}',
'available'),

('Bella', 'Labrador Mix', 1, 'female', 'medium', 'Chocolate',
ARRAY['Playful', 'Smart', 'Cuddly'],
'Bella is a young Labrador mix with endless energy and love to give. She''s great with children and loves to learn new tricks. Perfect for an active family.',
ARRAY['https://images.unsplash.com/photo-1587402092301-725e37c70fd8?w=400', 'https://images.unsplash.com/photo-1616190330582-2bd85eb2854d?w=400'],
'Chicago, IL',
'{"shelter": "Windy City Pets", "phone": "(555) 456-7890", "email": "hello@windycitypets.com"}',
'available'),

('Whiskers', 'Domestic Shorthair', 3, 'male', 'medium', 'Orange Tabby',
ARRAY['Independent', 'Calm', 'Affectionate'],
'Whiskers is a beautiful orange tabby who enjoys quiet moments and gentle pets. He''s perfect for someone looking for a calm, loving companion.',
ARRAY['https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400', 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400'],
'Austin, TX',
'{"shelter": "Austin Cat Rescue", "phone": "(555) 234-5678", "email": "cats@austinrescue.org"}',
'available'),

('Ruby', 'Beagle', 5, 'female', 'small', 'Tri-color',
ARRAY['Curious', 'Friendly', 'Gentle'],
'Ruby is a sweet 5-year-old Beagle who loves exploring and meeting new people. She''s well-behaved and would be perfect for a family or individual looking for a loyal friend.',
ARRAY['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400', 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=400'],
'Seattle, WA',
'{"shelter": "Pacific Northwest Animal Rescue", "phone": "(555) 345-6789", "email": "adopt@pnwrescue.org"}',
'available'),

('Shadow', 'Border Collie Mix', 3, 'male', 'medium', 'Black and White',
ARRAY['Intelligent', 'Active', 'Loyal'],
'Shadow is a highly intelligent Border Collie mix who excels at agility and loves mental challenges. He needs an active owner who can provide plenty of exercise and stimulation.',
ARRAY['https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400', 'https://images.unsplash.com/photo-1593134257782-e89567b7718a?w=400'],
'Denver, CO',
'{"shelter": "Mountain View Animal Services", "phone": "(555) 567-8901", "email": "info@mountainviewanimals.org"}',
'available'),

('Mittens', 'Persian', 2, 'female', 'medium', 'White',
ARRAY['Quiet', 'Elegant', 'Gentle'],
'Mittens is an elegant Persian cat who enjoys a peaceful environment. She loves being brushed and would thrive in a quiet home where she can be the center of attention.',
ARRAY['https://images.unsplash.com/photo-1513245543132-31f507417b26?w=400', 'https://images.unsplash.com/photo-1571566882372-1598d88abd90?w=400'],
'Miami, FL',
'{"shelter": "Sunshine State Cat Sanctuary", "phone": "(555) 678-9012", "email": "rescue@sunshinestatecats.org"}',
'available'),

('Buddy', 'Mixed Breed', 6, 'male', 'large', 'Brown',
ARRAY['Calm', 'Friendly', 'Patient'],
'Buddy is a gentle giant who loves everyone he meets. Despite his size, he''s very calm and patient, making him great with kids. He''s looking for a loving home to spend his golden years.',
ARRAY['https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400', 'https://images.unsplash.com/photo-1587059328142-d1ad08d18fdc?w=400'],
'Portland, OR',
'{"shelter": "Rose City Animal Shelter", "phone": "(555) 789-0123", "email": "adopt@rosecityanimals.com"}',
'available');

-- Create some sample user interactions (you'll need actual user IDs after users sign up)
-- This is commented out since we don't have real users yet
/*
INSERT INTO public.pet_interactions (user_id, pet_id, interaction_type) VALUES
-- These would be real user IDs once users start signing up
*/
