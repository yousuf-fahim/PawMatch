// This script verifies Supabase configuration and provides manual setup instructions
// Run with: node update-redirect-urls.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Create Supabase client with service role key (admin privileges)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function checkSupabaseConfig() {
  try {
    console.log('� Checking Supabase Configuration...\n');
    
    // Test if we can connect to Supabase
    const { data, error } = await supabase.auth.getSession();
    
    if (error && error.message.includes('JWT')) {
      console.log('⚠️  Service role key might be invalid or expired');
    } else {
      console.log('✅ Supabase connection successful');
    }
    
    console.log('\n📋 MANUAL CONFIGURATION REQUIRED:\n');
    console.log('Since Supabase auth configuration cannot be updated programmatically,');
    console.log('you need to manually configure these settings in your Supabase dashboard:\n');
    
    console.log('🌐 SUPABASE DASHBOARD STEPS:');
    console.log('1. Go to: https://supabase.com/dashboard');
    console.log('2. Select project: afxkliyukojjymvfwiyp');
    console.log('3. Navigate to: Authentication → Settings');
    console.log('4. Set Site URL to: http://localhost:3000');
    console.log('5. Add these Redirect URLs (one per line):\n');
    
    const redirectURLs = [
      'http://localhost:3000/auth/callback',
      'http://localhost:8081/auth-processor.html',
      'http://localhost:8083/auth-processor.html',
      'https://afxkliyukojjymvfwiyp.supabase.co/auth/v1/callback'
    ];
    
    redirectURLs.forEach(url => console.log(`   ${url}`));
    
    console.log('\n🔧 GOOGLE CLOUD CONSOLE STEPS:');
    console.log('1. Go to: https://console.cloud.google.com');
    console.log('2. Navigate to: APIs & Services → Credentials');
    console.log('3. Find your OAuth 2.0 Client ID');
    console.log('4. Add these Authorized redirect URIs:\n');
    
    const googleRedirectURLs = [
      'https://afxkliyukojjymvfwiyp.supabase.co/auth/v1/callback',
      'http://localhost:3000/auth/callback',
      'http://localhost:8081/auth-processor.html',
      'http://localhost:8083/auth-processor.html'
    ];
    
    googleRedirectURLs.forEach(url => console.log(`   ${url}`));
    
    console.log('\n🧪 TESTING:');
    console.log('After configuring both dashboards:');
    console.log('1. Restart your admin panel: npm run dev');
    console.log('2. Go to: http://localhost:3001');
    console.log('3. Click "Sign in with Google"');
    console.log('4. Should redirect properly without looping\n');
    
    console.log('💡 TIP: Run "npm run debug" and go to /debug to verify configuration');
    
  } catch (error) {
    console.error('❌ Error checking Supabase config:', error.message);
    console.log('\n📋 MANUAL CONFIGURATION STILL REQUIRED (see steps above)');
  }
}

checkSupabaseConfig();
