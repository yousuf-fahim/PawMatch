#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://afxkliyukojjymvfwiyp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmeGtsaXl1a29qanltdmZ3aXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNjc1NTcsImV4cCI6MjA2OTc0MzU1N30.tAn3GDt39F4xVMubXBpgYKEXh9eleIQzGg6SmEucAdc'
);

// Import a simplified version of pets data
const { mockPets } = require('./data/pets-simple.js');

async function populateDatabase() {
  console.log('🚀 Starting database population with new pets data...');
  
  try {
    // Clear existing pets
    console.log('🧹 Clearing existing pets...');
    const { error: deleteError } = await supabase
      .from('pets')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.log('Note: Could not clear existing pets:', deleteError.message);
    }

    // Transform mockPets data to match database schema
    console.log('📝 Transforming and inserting pets...');
    const transformedPets = mockPets.map(pet => ({
      name: pet.name,
      breed: pet.breed,
      age: parseInt(pet.age.split(' ')[0]) || 1, // Extract number from "2 years"
      gender: pet.gender.toLowerCase(),
      size: pet.size.toLowerCase(),
      color: 'Mixed', // Default color since not in mockPets
      personality: pet.personality,
      description: pet.description,
      images: Array.isArray(pet.image) ? pet.image : [pet.image],
      location: pet.location,
      contact_info: {
        phone: '+8801712345678',
        email: `${pet.name.toLowerCase().replace(/[^a-z]/g, '')}@pawmatch.bd`,
        address: pet.location
      },
      adoption_status: 'available'
    }));

    const { data, error } = await supabase
      .from('pets')
      .insert(transformedPets);

    if (error) {
      console.error('❌ Error inserting pets:', error);
      console.log('');
      console.log('💡 Possible solutions:');
      console.log('1. Create admin user in Supabase Auth dashboard');
      console.log('2. Run admin access SQL scripts in Supabase SQL Editor');
      console.log('3. Temporarily disable RLS on pets table');
      return;
    }

    console.log('✅ Successfully added', transformedPets.length, 'pets to database!');
    
    // Verify insertion
    const { data: verifyData, error: verifyError } = await supabase
      .from('pets')
      .select('name, breed')
      .limit(10);

    if (verifyError) {
      console.error('❌ Error verifying pets:', verifyError);
    } else {
      console.log('🔍 Sample pets in database:');
      verifyData.forEach((pet, index) => {
        console.log(`  ${index + 1}. ${pet.name} - ${pet.breed}`);
      });
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

populateDatabase();
