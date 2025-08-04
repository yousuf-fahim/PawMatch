/**
 * mobile-auth.ts - Native mobile authentication that bypasses web redirects
 * 
 * This implementation uses deep linking and native OAuth flows to avoid
 * the port 3000 redirect issue entirely. It works independently of the
 * Supabase Site URL configuration, so it won't affect the admin panel.
 */

import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Initialize WebBrowser
WebBrowser.maybeCompleteAuthSession();

// Create a dedicated mobile Supabase client
const mobileSupabaseClient = createClient(
  'https://afxkliyukojjymvfwiyp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmeGtsaXl1a29qanltdmZ3aXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNjc1NTcsImV4cCI6MjA2OTc0MzU1N30.tAn3GDt39F4xVMubXBpgYKEXh9eleIQzGg6SmEucAdc',
  {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: false, // Important: don't detect session in URL for mobile
      persistSession: true,
      autoRefreshToken: true,
      debug: true
    }
  }
);

/**
 * Mobile-native Google authentication using expo-auth-session
 * This completely bypasses web redirects and uses native OAuth flows
 */
export const nativeMobileGoogleAuth = async () => {
  try {
    console.log('🚀 [Mobile Auth] Starting native mobile Google authentication');
    
    // Use AuthSession for native OAuth flow
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'pawmatch',
      path: 'oauth/callback'
    });
    
    console.log('🚀 [Mobile Auth] Using redirect URI:', redirectUri);
    
    // Create the authorization request using Google's discovery document
    const discovery = {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    };
    
    // Get the Google client ID from Supabase OAuth URL
    const { data: authData, error: authError } = await mobileSupabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        },
        skipBrowserRedirect: true
      }
    });
    
    if (authError) {
      console.error('🚀 [Mobile Auth] Error getting auth URL:', authError);
      throw authError;
    }
    
    if (!authData?.url) {
      throw new Error('No authentication URL provided by Supabase');
    }
    
    console.log('🚀 [Mobile Auth] Got auth URL from Supabase');
    
    // Extract client ID from the Supabase OAuth URL
    const clientId = extractClientIdFromUrl(authData.url);
    console.log('🚀 [Mobile Auth] Extracted client ID:', clientId.substring(0, 10) + '...');
    
    // Create the authorization request with proper parameters
    const request = new AuthSession.AuthRequest({
      clientId: clientId,
      scopes: ['openid', 'email', 'profile'],
      responseType: AuthSession.ResponseType.Code,
      redirectUri: redirectUri,
      extraParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    });
    
    console.log('🚀 [Mobile Auth] Starting auth session...');
    const result = await request.promptAsync(discovery);
    
    console.log('🚀 [Mobile Auth] Auth session result:', result.type);
    
    if (result.type === 'success') {
      console.log('🚀 [Mobile Auth] Auth successful, processing tokens...');
      
      // Extract the authorization code from the response
      const { code } = result.params;
      
      if (code) {
        console.log('🚀 [Mobile Auth] Got authorization code, exchanging for tokens...');
        
        // Exchange the code for tokens using Supabase
        const { data: tokenData, error: tokenError } = await mobileSupabaseClient.auth.exchangeCodeForSession(code);
        
        if (tokenError) {
          console.error('🚀 [Mobile Auth] Token exchange error:', tokenError);
          throw tokenError;
        }
        
        if (tokenData?.session) {
          console.log('🚀 [Mobile Auth] Successfully obtained session!');
          return {
            success: true,
            session: tokenData.session,
            user: tokenData.session.user
          };
        } else {
          throw new Error('No session returned from token exchange');
        }
      } else {
        throw new Error('No authorization code in auth response');
      }
    } else if (result.type === 'cancel') {
      console.log('🚀 [Mobile Auth] User cancelled authentication');
      return {
        success: false,
        error: 'User cancelled authentication'
      };
    } else {
      console.error('🚀 [Mobile Auth] Auth failed:', result);
      throw new Error(`Authentication failed: ${result.type}`);
    }
  } catch (error: any) {
    console.error('🚀 [Mobile Auth] Error in native mobile auth:', error);
    return {
      success: false,
      error: error.message || 'Authentication failed'
    };
  }
};

/**
 * Fallback method using WebBrowser with a custom redirect scheme
 * This avoids the web port issues by using a mobile-specific redirect
 */
export const fallbackMobileGoogleAuth = async () => {
  try {
    console.log('🔄 [Mobile Auth] Starting fallback mobile Google authentication');
    
    // Use a custom scheme that won't conflict with web ports
    const redirectUri = 'pawmatch://oauth/callback';
    
    console.log('🔄 [Mobile Auth] Using custom redirect URI:', redirectUri);
    
    // Get the authorization URL from Supabase
    const { data, error } = await mobileSupabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });
    
    if (error) throw error;
    if (!data?.url) throw new Error('No authentication URL provided');
    
    console.log('🔄 [Mobile Auth] Opening browser for OAuth...');
    
    // Open the browser with the auth URL
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri, {
      showInRecents: true,
      createTask: true,
      preferEphemeralSession: false
    });
    
    console.log('🔄 [Mobile Auth] Browser result:', result.type);
    
    if (result.type === 'success' && result.url) {
      console.log('🔄 [Mobile Auth] Success! Processing callback URL...');
      
      // Parse the callback URL to extract tokens or code
      const url = new URL(result.url);
      const fragment = url.hash.substring(1);
      const params = new URLSearchParams(fragment);
      
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      
      if (accessToken) {
        console.log('🔄 [Mobile Auth] Found access token in callback');
        
        // Set the session in Supabase
        const { data: sessionData, error: sessionError } = await mobileSupabaseClient.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        });
        
        if (sessionError) throw sessionError;
        
        return {
          success: true,
          session: sessionData.session,
          user: sessionData.user
        };
      } else {
        // Check for authorization code
        const code = url.searchParams.get('code');
        if (code) {
          console.log('🔄 [Mobile Auth] Found authorization code in callback');
          
          // Exchange code for session
          const { data: tokenData, error: tokenError } = await mobileSupabaseClient.auth.exchangeCodeForSession(code);
          
          if (tokenError) throw tokenError;
          
          return {
            success: true,
            session: tokenData.session,
            user: tokenData.user
          };
        } else {
          throw new Error('No access token or code found in callback URL');
        }
      }
    } else {
      return {
        success: false,
        error: `Authentication failed: ${result.type}`
      };
    }
  } catch (error: any) {
    console.error('🔄 [Mobile Auth] Error in fallback mobile auth:', error);
    return {
      success: false,
      error: error.message || 'Authentication failed'
    };
  }
};

/**
 * Extract Google OAuth client ID from Supabase OAuth URL
 */
const extractClientIdFromUrl = (url: string): string => {
  try {
    // Parse the Supabase OAuth URL to extract client_id parameter
    const urlObj = new URL(url);
    const clientId = urlObj.searchParams.get('client_id');
    
    if (clientId) {
      console.log('🚀 [Mobile Auth] Successfully extracted client ID from Supabase URL');
      return clientId;
    }
    
    // If we can't extract client_id, this is a critical error
    throw new Error('Could not extract Google OAuth client ID from Supabase URL');
  } catch (error: any) {
    console.error('🚀 [Mobile Auth] Error extracting client ID:', error);
    throw new Error(`Invalid OAuth URL format: ${error.message}`);
  }
};

/**
 * Main mobile authentication function that tries multiple approaches
 */
export const authenticateWithGoogle = async () => {
  console.log('📱 [Mobile Auth] Starting mobile Google authentication');
  
  if (Platform.OS === 'web') {
    throw new Error('This function is only for mobile platforms');
  }
  
  try {
    // Try the native approach first
    console.log('📱 [Mobile Auth] Attempting native auth...');
    const nativeResult = await nativeMobileGoogleAuth();
    
    if (nativeResult.success) {
      return nativeResult;
    }
    
    console.log('📱 [Mobile Auth] Native auth failed, trying fallback...');
    
    // If native fails, try the fallback method
    const fallbackResult = await fallbackMobileGoogleAuth();
    
    if (fallbackResult.success) {
      return fallbackResult;
    }
    
    throw new Error('Both native and fallback authentication methods failed');
  } catch (error: any) {
    console.error('📱 [Mobile Auth] All authentication methods failed:', error);
    return {
      success: false,
      error: error.message || 'Authentication failed'
    };
  }
};

/**
 * Get the current session
 */
export const getMobileSession = async () => {
  const { data, error } = await mobileSupabaseClient.auth.getSession();
  if (error) throw error;
  return data.session;
};

/**
 * Sign out
 */
export const signOutMobile = async () => {
  const { error } = await mobileSupabaseClient.auth.signOut();
  if (error) throw error;
  return { success: true };
};

/**
 * Export the mobile auth service
 */
export const MobileAuth = {
  signInWithGoogle: authenticateWithGoogle,
  getSession: getMobileSession,
  signOut: signOutMobile,
  native: nativeMobileGoogleAuth,
  fallback: fallbackMobileGoogleAuth
};
