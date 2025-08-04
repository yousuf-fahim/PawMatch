// Fixed OAuth implementation for Google Sign-In

import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';

// Initialize WebBrowser for expo-auth-session
WebBrowser.maybeCompleteAuthSession();

// Hard-coded Supabase credentials (from your .env file)
const SUPABASE_URL = 'https://afxkliyukojjymvfwiyp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmeGtsaXl1a29qanltdmZ3aXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNjc1NTcsImV4cCI6MjA2OTc0MzU1N30.tAn3GDt39F4xVMubXBpgYKEXh9eleIQzGg6SmEucAdc';

// Create a direct Supabase client just for authentication
const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    detectSessionInUrl: Platform.OS === 'web',
    persistSession: true,
    autoRefreshToken: true,
    flowType: 'pkce',
    debug: true
  },
});

/**
 * Fixed Google Sign-In Implementation
 * Uses a simplified, direct approach
 */
export const fixedGoogleSignIn = async () => {
  try {
    console.log(`🔧 Starting FIXED Google sign-in on ${Platform.OS}`);
    
    // === WEB PLATFORM FLOW ===
    if (Platform.OS === 'web') {
      return await webSignIn();
    }
    
    // === MOBILE PLATFORM FLOW ===
    return await mobileSignIn();
  } catch (error) {
    console.error('❌ Auth error:', error);
    throw error;
  }
};

/**
 * Web platform authentication flow
 */
const webSignIn = async () => {
  console.log('🔧 Using FIXED web authentication flow');
  
  // Hard-coded redirect for localhost:8081
  const redirectTo = 'http://localhost:8081/auth-processor.html';
  console.log('🔧 Using redirect URL:', redirectTo);
  
  const { data, error } = await supabaseAuth.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
    },
  });
  
  if (error) {
    console.error('❌ OAuth error:', error);
    throw error;
  }
  
  return data;
};

/**
 * Mobile platform authentication flow
 */
const mobileSignIn = async () => {
  console.log('🔧 Using FIXED mobile authentication flow');
  
  // For mobile, use a direct scheme redirect
  let redirectUrl = 'pawmatch://';
  
  if (Platform.OS === 'android') {
    // Use our special Android callback handler
    redirectUrl = 'http://localhost:8081/assets/web/android-auth-callback.html';
    console.log('🔧 Using Android-specific auth callback page');
  }
  
  console.log('🔧 Using redirect URL:', redirectUrl);
  
  const { data, error } = await supabaseAuth.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      scopes: 'email profile',
    },
  });
  
  if (error) {
    console.error('❌ OAuth error:', error);
    throw error;
  }
  
  if (!data?.url) {
    throw new Error('No authentication URL provided');
  }
  
  console.log('🔧 Opening browser for authentication with URL:', data.url);
  
  try {
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectUrl,
      {
        showInRecents: true,
        createTask: true,
        preferEphemeralSession: false
      }
    );
    
    console.log('🔧 Auth session result:', result.type);
    
    if (result.type === 'success' && result.url) {
      console.log('🔧 Auth session result URL:', result.url);
      
      // Get code parameter from the URL if present
      try {
        const url = new URL(result.url);
        const code = url.searchParams.get('code');
        
        if (code) {
          console.log('🔧 Found authorization code in result URL');
          // We have the code, now exchange it for a session
        }
      } catch (e) {
        console.log('❌ Could not parse result URL:', e);
      }
      
      return await verifySession();
    } else {
      throw new Error(`Authentication failed: ${result.type}`);
    }
  } catch (err) {
    console.error('❌ Error in WebBrowser session:', err);
    throw new Error('Authentication failed. Please try again.');
  }
};

/**
 * Verify if a session was created after OAuth flow
 */
const verifySession = async () => {
  console.log('🔧 Verifying authentication session');
  
  // Wait for the session to be established
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Try multiple times with increasing delays
  for (let attempt = 1; attempt <= 5; attempt++) {
    console.log(`🔧 Session check attempt ${attempt}/5`);
    
    const { data, error } = await supabaseAuth.auth.getSession();
    
    if (error) {
      console.error('❌ Session verification error:', error);
      if (attempt === 5) throw error;
    }
    
    if (data?.session) {
      console.log('✅ Session verified successfully!');
      return { 
        success: true, 
        session: data.session,
        user: data.session.user
      };
    }
    
    if (attempt < 5) {
      const delay = 1000 * (attempt + 1);
      console.log(`🔧 No session found, waiting ${delay}ms before retry`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Authentication was not completed after multiple attempts');
};

// Export this for direct usage
export const FixedAuth = {
  signInWithGoogle: fixedGoogleSignIn,
  getSession: async () => await supabaseAuth.auth.getSession(),
  getUser: async () => {
    const { data, error } = await supabaseAuth.auth.getUser();
    if (error) throw error;
    return data.user;
  },
  signOut: async () => await supabaseAuth.auth.signOut()
};
