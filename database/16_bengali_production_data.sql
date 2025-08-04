-- Production data for Bangladesh PawMatch app
-- Bengali pets, services, and users

-- Insert Bengali pet data
INSERT INTO pets (
  id, name, breed, age, gender, size, color, personality, description, 
  images, location, contact_info, adoption_status, created_at, updated_at
) VALUES 
-- Bengali Dogs
(gen_random_uuid(), 'রাজা (Raja)', 'দেশি কুকুর (Deshi Dog)', 2, 'male', 'medium', 'কালো সাদা (Black & White)', 
 ARRAY['বন্ধুত্বপূর্ণ', 'অনুগত', 'খেলুড়ে'], 
 'রাজা একটি খুবই বন্ধুত্বপূর্ণ দেশি কুকুর। সে বাচ্চাদের সাথে খেলতে ভালোবাসে এবং খুবই অনুগত। ঘর পাহারা দিতে পারদর্শী।',
 ARRAY['https://images.unsplash.com/photo-1551717743-49959800b1f6?auto=format&fit=crop&w=800&h=1200'],
 'ধানমন্ডি, ঢাকা', 
 '{"phone": "+8801712345678", "email": "raja@pawmatch.bd", "address": "ধানমন্ডি ৩২, ঢাকা"}',
 'available', NOW(), NOW()),

(gen_random_uuid(), 'রানী (Rani)', 'জার্মান শেফার্ড', 3, 'female', 'large', 'বাদামী কালো (Brown & Black)', 
 ARRAY['বুদ্ধিমান', 'সুরক্ষাকারী', 'প্রশিক্ষিত'], 
 'রানী একটি প্রশিক্ষিত জার্মান শেফার্ড। সে খুবই বুদ্ধিমান এবং পরিবারের সুরক্ষা নিশ্চিত করে। বাচ্চাদের সাথে নিরাপদ।',
 ARRAY['https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=800&h=1200'],
 'উত্তরা, ঢাকা', 
 '{"phone": "+8801812345679", "email": "rani@pawmatch.bd", "address": "উত্তরা সেক্টর ৭, ঢাকা"}',
 'available', NOW(), NOW()),

(gen_random_uuid(), 'ছোটি (Choti)', 'পোমেরানিয়ান', 1, 'female', 'small', 'সাদা (White)', 
 ARRAY['আদুরে', 'ছোট', 'কৌতুকপূর্ণ'], 
 'ছোটি একটি অত্যন্ত আদুরে পোমেরানিয়ান কুকুর। সে খুবই ছোট এবং কৌতুকপূর্ণ। ফ্ল্যাটে রাখার জন্য আদর্শ।',
 ARRAY['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&h=1200'],
 'গুলশান, ঢাকা', 
 '{"phone": "+8801912345680", "email": "choti@pawmatch.bd", "address": "গুলশান ২, ঢাকা"}',
 'available', NOW(), NOW()),

-- Bengali Cats  
(gen_random_uuid(), 'মোতি (Moti)', 'পার্শিয়ান বিড়াল', 2, 'female', 'medium', 'সাদা (White)', 
 ARRAY['শান্ত', 'আদুরে', 'সুন্দর'], 
 'মোতি একটি সুন্দর সাদা পার্শিয়ান বিড়াল। সে খুবই শান্ত স্বভাবের এবং কোলে বসতে ভালোবাসে। নিয়মিত গ্রুমিং প্রয়োজন।',
 ARRAY['https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?auto=format&fit=crop&w=800&h=1200'],
 'বনানী, ঢাকা', 
 '{"phone": "+8801612345681", "email": "moti@pawmatch.bd", "address": "বনানী, ঢাকা"}',
 'available', NOW(), NOW()),

(gen_random_uuid(), 'কালো (Kalo)', 'দেশি বিড়াল', 1, 'male', 'medium', 'কালো (Black)', 
 ARRAY['স্বাধীন', 'খেলুড়ে', 'স্মার্ট'], 
 'কালো একটি স্মার্ট দেশি বিড়াল। সে খুবই স্বাধীন কিন্তু খেলুড়ে। ইঁদুর তাড়াতে খুবই দক্ষ।',
 ARRAY['https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=800&h=1200'],
 'মিরপুর, ঢাকা', 
 '{"phone": "+8801712345682", "email": "kalo@pawmatch.bd", "address": "মিরপুর ১০, ঢাকা"}',
 'available', NOW(), NOW()),

(gen_random_uuid(), 'ভোলা (Bhola)', 'গোল্ডেন রিট্রিভার', 4, 'male', 'large', 'সোনালি (Golden)', 
 ARRAY['ভদ্র', 'বন্ধুত্বপূর্ণ', 'সহনশীল'], 
 'ভোলা একটি খুবই ভদ্র এবং বন্ধুত্বপূর্ণ গোল্ডেন রিট্রিভার। সে সব বয়সের মানুষের সাথে মিশতে পারে। পরিবারের জন্য আদর্শ।',
 ARRAY['https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&h=1200'],
 'চট্টগ্রাম', 
 '{"phone": "+8801812345683", "email": "bhola@pawmatch.bd", "address": "আগ্রাবাদ, চট্টগ্রাম"}',
 'available', NOW(), NOW()),

(gen_random_uuid(), 'টিগার (Tiger)', 'ট্যাবি বিড়াল', 3, 'male', 'medium', 'বাদামী ডোরা (Brown Striped)', 
 ARRAY['সাহসী', 'খেলুড়ে', 'বুদ্ধিমান'], 
 'টিগার একটি সুন্দর ট্যাবি বিড়াল। সে খুবই সাহসী এবং বুদ্ধিমান। অ্যাডভেঞ্চার পছন্দ করে।',
 ARRAY['https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?auto=format&fit=crop&w=800&h=1200'],
 'সিলেট', 
 '{"phone": "+8801912345684", "email": "tiger@pawmatch.bd", "address": "জিন্দাবাজার, সিলেট"}',
 'available', NOW(), NOW()),

(gen_random_uuid(), 'লাকি (Lucky)', 'বিগল', 2, 'male', 'medium', 'ত্রিবর্ণ (Tricolor)', 
 ARRAY['কৌতূহলী', 'বন্ধুত্বপূর্ণ', 'সক্রিয়'], 
 'লাকি একটি কৌতূহলী এবং সক্রিয় বিগল। সে ঘ্রাণ নিয়ে খেলতে ভালোবাসে এবং খুবই বন্ধুত্বপূর্ণ।',
 ARRAY['https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&w=800&h=1200'],
 'রাজশাহী', 
 '{"phone": "+8801612345685", "email": "lucky@pawmatch.bd", "address": "শাহেব বাজার, রাজশাহী"}',
 'available', NOW(), NOW()),

(gen_random_uuid(), 'প্রিন্সেস (Princess)', 'পার্শিয়ান বিড়াল', 2, 'female', 'medium', 'ক্রিম (Cream)', 
 ARRAY['রাজকীয়', 'শান্ত', 'সুন্দর'], 
 'প্রিন্সেস একটি রাজকীয় পার্শিয়ান বিড়াল। সে খুবই শান্ত এবং সুন্দর। বিলাসবহুল জীবনযাত্রা পছন্দ করে।',
 ARRAY['https://images.unsplash.com/photo-1606214174585-fe31582cd92c?auto=format&fit=crop&w=800&h=1200'],
 'খুলনা', 
 '{"phone": "+8801712345686", "email": "princess@pawmatch.bd", "address": "খুলনা শহর"}',
 'available', NOW(), NOW()),

(gen_random_uuid(), 'বাদশা (Badsha)', 'রটওয়েলার', 3, 'male', 'large', 'কালো বাদামী (Black & Brown)', 
 ARRAY['শক্তিশালী', 'অনুগত', 'সুরক্ষাকারী'], 
 'বাদশা একটি শক্তিশালী এবং অনুগত রটওয়েলার। সে পরিবারের সুরক্ষার জন্য নিবেদিত। অভিজ্ঞ মালিকের জন্য উপযুক্ত।',
 ARRAY['https://images.unsplash.com/photo-1567752881298-894bb81f9379?auto=format&fit=crop&w=800&h=1200'],
 'বরিশাল', 
 '{"phone": "+8801812345687", "email": "badsha@pawmatch.bd", "address": "বরিশাল শহর"}',
 'available', NOW(), NOW()),

-- Add Peu with multiple images
(gen_random_uuid(), 'পেউ (Peu)', 'পার্শিয়ান মিক্স', 1, 'female', 'medium', 'মিশ্র (Mixed)', 
 ARRAY['চটপটে', 'শক্তিশালী', 'খেলুড়ে', 'অনুগত'], 
 'পেউ একটি বিশেষ পার্শিয়ান মিক্স বিড়াল। সে খুবই চটপটে এবং খেলতে ভালোবাসে। ট্রিট পেলে খুশি হয়!',
 ARRAY[
   'https://i.postimg.cc/rwPDrn80/Peu.jpg',
   'https://i.postimg.cc/SKrr6bvQ/524633813-743262541767934-2267632741324460097-n.jpg',
   'https://i.postimg.cc/pTcJSYvg/524379309-741998155220040-4901113047303928629-n.jpg',
   'https://i.postimg.cc/rmw9gZB1/523413172-1287359642971831-8976397684880539111-n.jpg',
   'https://i.postimg.cc/Y0JfrrhR/522867184-2462931890741988-4345646540119893060-n.jpg',
   'https://i.postimg.cc/FzfVXds1/518140056-537361346069335-246031076602927395-n.jpg'
 ],
 'মিরপুর, ঢাকা', 
 '{"phone": "+8801712345688", "email": "peu@pawmatch.bd", "address": "মিরপুর ১০, ঢাকা"}',
 'available', NOW(), NOW());

-- Insert pet services (veterinary clinics, grooming, food stores)
INSERT INTO pet_services (
  id, name, service_type, description, address, phone, email, 
  city, state, zip_code, website, is_verified, rating, created_at, updated_at
) VALUES 
(gen_random_uuid(), 'ঢাকা ভেটেরিনারি হাসপাতাল', 'veterinary', 
 'ঢাকার প্রমুখ পশু চিকিৎসা কেন্দ্র। ২৪/৭ জরুরি সেবা উপলব্ধ।', 
 'ধানমন্ডি ১৫, ঢাকা', '+8802-9611234', 'info@dhakapet.vet',
 'ঢাকা', 'ঢাকা বিভাগ', '1205', 'https://dhakapet.vet', true,
 4.8, NOW(), NOW()),

(gen_random_uuid(), 'পেট পার্লার & গ্রুমিং', 'grooming', 
 'আপনার পোষা প্রাণীর জন্য সম্পূর্ণ গ্রুমিং সেবা। স্নান, চুল কাটা, নখ কাটা।', 
 'গুলশান ১, ঢাকা', '+8801712345678', 'contact@petparlor.bd',
 'ঢাকা', 'ঢাকা বিভাগ', '1212', 'https://petparlor.bd', true,
 4.5, NOW(), NOW()),

(gen_random_uuid(), 'পেট ফুড হাউজ', 'store', 
 'সকল ধরনের পোষা প্রাণীর খাবার ও যন্ত্রাংশ পাওয়া যায়। অনলাইন ডেলিভারি সুবিধা।', 
 'নিউ মার্কেট, ঢাকা', '+8801812345679', 'orders@petfoodhouse.bd',
 'ঢাকা', 'ঢাকা বিভাগ', '1205', 'https://petfoodhouse.bd', true,
 4.3, NOW(), NOW()),

(gen_random_uuid(), 'বাংলাদেশ এনিমেল শেল্টার', 'shelter', 
 'পরিত্যক্ত প্রাণীদের যত্ন ও দত্তক সেবা। স্বেচ্ছাসেবক হিসেবে যোগ দিন।', 
 'সাভার, ঢাকা', '+8801912345680', 'help@animalsheltbd.org',
 'সাভার', 'ঢাকা বিভাগ', '1340', 'https://animalsheltbd.org', true,
 4.9, NOW(), NOW()),

(gen_random_uuid(), 'চট্টগ্রাম পশু হাসপাতাল', 'veterinary', 
 'চট্টগ্রামের আধুনিক পশু চিকিৎসা কেন্দ্র। বিশেষজ্ঞ চিকিৎসক দ্বারা সেবা।', 
 'আগ্রাবাদ, চট্টগ্রাম', '+8801612345681', 'care@ctgpethos.com',
 'চট্টগ্রাম', 'চট্টগ্রাম বিভাগ', '4100', 'https://ctgpethos.com', true,
 4.6, NOW(), NOW());

-- Insert sample users (pet owners and adopters)
INSERT INTO user_profiles (
  id, email, full_name, phone, location, 
  preferences, is_admin, created_at, updated_at
) VALUES 
(gen_random_uuid(), 'rahman.ahmed@gmail.com', 'আহমেদ রহমান', '+8801712345001', 'ধানমন্ডি, ঢাকা',
 '{"preferred_pets": ["dogs", "cats"], "size_preference": ["medium", "large"], "experience": "intermediate"}',
 false, NOW(), NOW()),

(gen_random_uuid(), 'fatima.begum@yahoo.com', 'ফাতিমা বেগম', '+8801812345002', 'উত্তরা, ঢাকা',
 '{"preferred_pets": ["cats"], "size_preference": ["small", "medium"], "experience": "beginner"}',
 false, NOW(), NOW()),

(gen_random_uuid(), 'karim.hassan@hotmail.com', 'করিম হাসান', '+8801912345003', 'গুলশান, ঢাকা',
 '{"preferred_pets": ["dogs"], "size_preference": ["large"], "experience": "advanced"}',
 false, NOW(), NOW()),

(gen_random_uuid(), 'nasir.uddin@gmail.com', 'নাসির উদ্দিন', '+8801612345004', 'চট্টগ্রাম',
 '{"preferred_pets": ["dogs", "cats"], "size_preference": ["any"], "experience": "intermediate"}',
 false, NOW(), NOW()),

(gen_random_uuid(), 'salma.khatun@gmail.com', 'সালমা খাতুন', '+8801712345005', 'সিলেট',
 '{"preferred_pets": ["cats"], "size_preference": ["small"], "experience": "beginner"}',
 false, NOW(), NOW()),

-- Admin user
(gen_random_uuid(), 'pawfect.mew@gmail.com', 'PawMatch Admin', '+8801700000000', 'ঢাকা',
 '{"role": "admin", "permissions": ["all"]}',
 true, NOW(), NOW());

-- Insert some sample learning articles in Bengali
INSERT INTO learning_articles (
  id, title, content, excerpt, author, category, subcategory,
  difficulty, read_time, tags, featured_image, published, created_at, updated_at
) VALUES 
(gen_random_uuid(), 'কুকুরের যত্ন নেওয়ার বেসিক গাইড', 
 'আপনার নতুন কুকুরের যত্ন নেওয়া একটি আনন্দদায়ক অভিজ্ঞতা হতে পারে। এই গাইডে আমরা আলোচনা করব কীভাবে আপনি আপনার কুকুরের সঠিক যত্ন নিতে পারেন...', 
 'নতুন কুকুরের মালিকদের জন্য প্রয়োজনীয় তথ্য', 'ডাঃ আবুল কাসেম', 'pet_care', 'dogs',
 'beginner', 5, ARRAY['কুকুর', 'যত্ন', 'খাবার', 'স্বাস্থ্য'], 
 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=800&h=600',
 true, NOW(), NOW()),

(gen_random_uuid(), 'বিড়ালের স্বাস্থ্য রক্ষা', 
 'বিড়াল একটি স্বাধীন প্রাণী হলেও তাদের নিয়মিত স্বাস্থ্য পরীক্ষা প্রয়োজন। এই আর্টিকেলে আমরা জানব কীভাবে আপনার বিড়ালের স্বাস্থ্য ভালো রাখবেন...', 
 'বিড়ালের স্বাস্থ্য সুরক্ষার জন্য গুরুত্বপূর্ণ টিপস', 'ডাঃ রাহেলা খানম', 'health', 'cats',
 'intermediate', 7, ARRAY['বিড়াল', 'স্বাস্থ্য', 'টিকা', 'চেকআপ'], 
 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&h=600',
 true, NOW(), NOW());

COMMIT;
