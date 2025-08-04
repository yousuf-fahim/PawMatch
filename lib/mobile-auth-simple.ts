/**
 * mobile-auth-simple.ts - Simplified mobile authentication using expo-web-browser
 * 
 * This implementation avoids expo-auth-session module issues by using
 * only expo-web-browser for authentication flows.
 */

import { createClient } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

// Configure WebBrowser for authentication
WebBrowser.maybeCompleteAuthSession();

// Create a separate Supabase client for mobile authentication
const mobileSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const mobileSupabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const mobileSupabaseClient = createClient(mobileSupabaseUrl, mobileSupabaseAnonKey, {
  auth: {
    // Use mobile-specific settings
    storage: {
      getItem: async (key: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
        return null;
      },
      setItem: async (key: string, value: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      },
      removeItem: async (key: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      },
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Important for mobile
    flowType: 'pkce' // Use PKCE flow for mobile
  }
});

/**
 * Mobile-native Google authentication using expo-web-browser
 * This approach uses Supabase's built-in OAuth flow with mobile redirect handling
 */
export const authenticateWithGoogle = async () => {
  try {
    console.log('🚀 [Mobile Auth] Starting mobile Google authentication with WebBrowser');
    console.log('🚀 [Mobile Auth] Platform:', Platform.OS);
    
    // Use environment variable for redirect URI, with fallback
    const redirectUri = process.env.EXPO_PUBLIC_OAUTH_REDIRECT_URL || 
                       process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL || 
                       Linking.createURL('oauth/callback');
    console.log('🚀 [Mobile Auth] Using redirect URI:', redirectUri);
    
    // Get the authorization URL from Supabase
    const { data: authData, error: authError } = await mobileSupabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        },
        skipBrowserRedirect: true // Don't redirect automatically
      }
    });
    
    if (authError) {
      console.error('🚀 [Mobile Auth] Error getting auth URL:', authError);
      throw authError;
    }
    
    if (!authData?.url) {
      throw new Error('No authentication URL provided by Supabase');
    }
    
    console.log('🚀 [Mobile Auth] Got auth URL from Supabase, opening browser...');
    
    // Open the authentication URL in the browser
    const result = await WebBrowser.openAuthSessionAsync(
      authData.url,
      redirectUri,
      {
        showInRecents: false,
        createTask: false
      }
    );
    
    console.log('🚀 [Mobile Auth] Browser auth result:', result.type);
    
    if (result.type === 'success') {
      console.log('🚀 [Mobile Auth] Auth successful, processing URL...');
      
      // Parse the redirect URL for tokens/code
      const url = result.url;
      const urlParams = new URL(url);
      const accessToken = urlParams.searchParams.get('access_token');
      const refreshToken = urlParams.searchParams.get('refresh_token');
      const code = urlParams.searchParams.get('code');
      
      if (accessToken && refreshToken) {
        console.log('🚀 [Mobile Auth] Got tokens directly, setting session...');
        
        // Set the session using the tokens
        const { data: sessionData, error: sessionError } = await mobileSupabaseClient.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        
        if (sessionError) {
          console.error('🚀 [Mobile Auth] Session error:', sessionError);
          throw sessionError;
        }
        
        if (sessionData?.session) {
          console.log('🚀 [Mobile Auth] Successfully obtained session!');
          return {
            success: true,
            session: sessionData.session,
            user: sessionData.session.user
          };
        }
      } else if (code) {
        console.log('🚀 [Mobile Auth] Got authorization code, exchanging for tokens...');
        
        // Exchange the code for tokens
        const { data: tokenData, error: tokenError } = await mobileSupabaseClient.auth.exchangeCodeForSession(code);
        
        if (tokenError) {
          console.error('🚀 [Mobile Auth] Token exchange error:', tokenError);
          throw tokenError;
        }
        
        if (tokenData?.session) {
          console.log('🚀 [Mobile Auth] Successfully obtained session from code exchange!');
          return {
            success: true,
            session: tokenData.session,
            user: tokenData.session.user
          };
        }
      } else {
        console.error('🚀 [Mobile Auth] No tokens or code in response');
        throw new Error('No authentication tokens received');
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
    
    throw new Error('Authentication completed but no session was established');
  } catch (error: any) {
    console.error('🚀 [Mobile Auth] Error in mobile auth:', error);
    return {
      success: false,
      error: error.message || 'Authentication failed'
    };
  }
};

/**
 * Alternative simple authentication method
 */
export const authenticateWithGoogleSimple = async () => {
  try {
    console.log('🚀 [Mobile Auth] Starting simple mobile Google authentication');
    
    // Use a simpler redirect URL approach
    const redirectUrl = Linking.createURL('auth');
    console.log('🚀 [Mobile Auth] Simple redirect URL:', redirectUrl);
    
    // Get auth URL from Supabase
    const { data, error } = await mobileSupabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true
      }
    });
    
    if (error) {
      console.error('🚀 [Mobile Auth] Simple auth URL error:', error);
      throw error;
    }
    
    if (!data?.url) {
      throw new Error('No authentication URL received from Supabase');
    }
    
    console.log('🚀 [Mobile Auth] Opening simple browser session...');
    
    // Open auth session
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
    
    if (result.type === 'success') {
      console.log('🚀 [Mobile Auth] Simple auth successful');
      
      // Wait a moment for session to be established
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if session was automatically set by Supabase
      const { data: session } = await mobileSupabaseClient.auth.getSession();
      
      if (session?.session) {
        return {
          success: true,
          session: session.session,
          user: session.session.user
        };
      } else {
        // Try to extract and process the URL manually
        return await processAuthUrl(result.url);
      }
    } else if (result.type === 'cancel') {
      return {
        success: false,
        error: 'User cancelled authentication'
      };
    } else {
      throw new Error(`Simple authentication failed: ${result.type}`);
    }
  } catch (error: any) {
    console.error('🚀 [Mobile Auth] Simple auth error:', error);
    return {
      success: false,
      error: error.message || 'Simple authentication failed'
    };
  }
};

/**
 * Process authentication URL to extract session information
 */
const processAuthUrl = async (url: string) => {
  try {
    console.log('🚀 [Mobile Auth] Processing auth URL manually...');
    
    const urlObj = new URL(url);
    const accessToken = urlObj.searchParams.get('access_token');
    const refreshToken = urlObj.searchParams.get('refresh_token');
    const code = urlObj.searchParams.get('code');
    
    if (accessToken && refreshToken) {
      const { data, error } = await mobileSupabaseClient.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      
      if (error) throw error;
      
      if (data?.session) {
        return {
          success: true,
          session: data.session,
          user: data.session.user
        };
      }
    } else if (code) {
      const { data, error } = await mobileSupabaseClient.auth.exchangeCodeForSession(code);
      
      if (error) throw error;
      
      if (data?.session) {
        return {
          success: true,
          session: data.session,
          user: data.session.user
        };
      }
    }
    
    throw new Error('Could not extract valid session from auth URL');
  } catch (error: any) {
    console.error('🚀 [Mobile Auth] URL processing error:', error);
    throw error;
  }
};

/**
 * Check if the user is already authenticated
 */
export const checkExistingSession = async () => {
  try {
    const { data: session } = await mobileSupabaseClient.auth.getSession();
    return session?.session || null;
  } catch (error) {
    console.error('🚀 [Mobile Auth] Error checking existing session:', error);
    return null;
  }
};

/**
 * Sign out the user
 */
export const signOut = async () => {
  try {
    const { error } = await mobileSupabaseClient.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('🚀 [Mobile Auth] Sign out error:', error);
    return { success: false, error: error.message };
  }
};
