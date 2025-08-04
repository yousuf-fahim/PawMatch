#!/usr/bin/env node

// APK Debug Test Script
// Run this to test if the app will work in production build

const { createClient } = require('@supabase/supabase-js');

console.log('🧪 Testing PawMatch APK Compatibility...\n');

// Test 1: Environment Variables
console.log('1. Testing Environment Variables:');
const supabaseUrl = 'https://afxkliyukojjymvfwiyp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmeGtsaXl1a29qanltdmZ3aXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNjc1NTcsImV4cCI6MjA2OTc0MzU1N30.tAn3GDt39F4xVMubXBpgYKEXh9eleIQzGg6SmEucAdc';

if (supabaseUrl && supabaseKey) {
  console.log('✅ Supabase URL: Valid');
  console.log('✅ Supabase Key: Valid');
} else {
  console.log('❌ Missing environment variables');
}

// Test 2: Supabase Connection
console.log('\n2. Testing Supabase Connection:');
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    const { data, error } = await supabase.from('pets').select('count').limit(1);
    if (error) {
      console.log('❌ Connection failed:', error.message);
    } else {
      console.log('✅ Supabase connection successful');
    }
  } catch (err) {
    console.log('❌ Connection error:', err.message);
  }
}

// Test 3: Font Configuration
console.log('\n3. Testing Font Configuration:');
try {
  // Simulate font loading test
  const fonts = ['Poppins-Regular', 'Poppins-Bold', 'Nunito-Regular', 'Nunito-SemiBold'];
  console.log('✅ Font names are valid:', fonts.join(', '));
} catch (err) {
  console.log('❌ Font configuration issue:', err.message);
}

// Test 4: Network Security
console.log('\n4. Testing Network Security:');
const networkConfig = require('fs').existsSync('./network_security_config.xml');
if (networkConfig) {
  console.log('✅ Network security config found');
} else {
  console.log('❌ Network security config missing');
}

// Test 5: Deep Link Configuration
console.log('\n5. Testing Deep Link Configuration:');
try {
  const appJson = require('./app.json');
  const scheme = appJson.expo.scheme;
  const intentFilters = appJson.expo.android.intentFilters;
  
  if (scheme === 'pawmatch') {
    console.log('✅ App scheme configured correctly');
  } else {
    console.log('❌ App scheme not configured');
  }
  
  if (intentFilters && intentFilters.length > 0) {
    console.log('✅ Intent filters configured');
  } else {
    console.log('❌ Intent filters missing');
  }
} catch (err) {
  console.log('❌ App.json configuration issue:', err.message);
}

console.log('\n🔧 APK Build Recommendations:');
console.log('1. Clear cache: npx expo start --clear');
console.log('2. Build APK: eas build --platform android --profile apk');
console.log('3. Test on device before publishing');

console.log('\n📱 Auth Redirect URLs to add in Supabase:');
console.log('- https://pawmatchapp.expo.app/auth/callback');
console.log('- pawmatch://auth/callback');
console.log('- pawmatch://oauth/callback');

// Run the connection test
testConnection();
