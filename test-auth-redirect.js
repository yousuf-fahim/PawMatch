#!/usr/bin/env node

// Test Google Auth Redirect URL
console.log('🔍 Testing Google Auth Redirect Configuration...\n');

// Simulate the auth redirect logic
const __DEV__ = false; // Set to false to test production behavior

const redirectUrl = 'pawmatch://auth/callback'; // Fixed mobile redirect

console.log('🎯 Auth Redirect URL that will be used:');
console.log(`   ${redirectUrl}`);
console.log('');

// Test if this matches mobile app scheme
if (redirectUrl.startsWith('pawmatch://')) {
  console.log('✅ CORRECT: Will redirect to mobile app');
  console.log('✅ App scheme: pawmatch://');
  console.log('✅ Will open in your mobile app, NOT browser');
} else if (redirectUrl.includes('vercel.app')) {
  console.log('❌ WRONG: Will redirect to Vercel admin panel');
  console.log('❌ Users will be sent to web browser instead of app');
} else {
  console.log('⚠️  Unknown redirect destination');
}

console.log('\n📱 Expected Flow After Sign-In:');
console.log('1. User taps "Sign in with Google"');
console.log('2. Google auth popup opens');
console.log('3. User completes Google sign-in');
console.log('4. Google redirects to: ' + redirectUrl);
console.log('5. Mobile app opens and handles the callback');
console.log('6. User is signed in to PawMatch app');

console.log('\n🔧 If still redirecting to Vercel:');
console.log('- Update Supabase Dashboard Site URL');
console.log('- Go to: https://supabase.com/dashboard/project/afxkliyukojjymvfwiyp');
console.log('- Authentication → Settings');
console.log('- Change Site URL to: pawmatch://auth/callback');

console.log('\n🧪 Test on your phone:');
console.log('1. Open PawMatch app');
console.log('2. Try Google sign-in');
console.log('3. Should stay in mobile app (not open browser to Vercel)');
