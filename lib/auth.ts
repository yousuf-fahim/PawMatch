import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Initialize WebBrowser for expo-auth-session
WebBrowser.maybeCompleteAuthSession();

/**
 * PawMatch Auth Service
 * 
 * Provides authentication methods for both mobile and web platforms
 * Mobile: Uses WebBrowser for OAuth flow
 * Web: Uses direct Supabase OAuth with custom redirects based on port
 */
export const Auth = {
  // Internal state properties
  _authState: null as string | null,
  
  /**
   * Generate a secure state parameter for CSRF protection
   */
  _generateState() {
    const random = Math.random().toString(36).substring(2, 15);
    const timestamp = new Date().getTime().toString();
    return random + timestamp;
  },
  /**
   * Sign in with Google OAuth
   * Uses different flows for web and mobile platforms
   */
  async signInWithGoogle() {
    try {
      console.log(`🔐 Starting Google sign-in on ${Platform.OS} platform`);
      
      // === WEB PLATFORM FLOW ===
      // Check if running in a web browser environment
      if (Platform.OS === 'web' || typeof window !== 'undefined' && window.document) {
        console.log('🔐 Using web authentication flow');
        return this.webSignIn();
      }
      
      // === MOBILE PLATFORM FLOW ===
      console.log('🔐 Using mobile authentication flow');
      return this.mobileSignIn();
    } catch (error) {
      console.error('❌ Auth error:', error);
      throw error;
    }
  },

  /**
   * Web platform authentication flow
   * Detects current port to determine correct redirect URL
   */
  async webSignIn() {
    // Generate state parameter for CSRF protection
    this._authState = this._generateState();
    
    // Get the environment redirect URL (should be set in .env)
    const envRedirectUrl = process.env.EXPO_PUBLIC_OAUTH_REDIRECT_URL;
    let redirectTo;
    
    if (envRedirectUrl) {
      // Use the configured redirect URL from environment
      console.log(`🔐 Using configured redirect URL from env: ${envRedirectUrl}`);
      redirectTo = envRedirectUrl;
    } else {
      // Fallback to auto-detection (not recommended)
      console.warn('⚠️ EXPO_PUBLIC_OAUTH_REDIRECT_URL not set in environment!');
      console.warn('⚠️ Using auto-detected redirect URL, which may cause issues.');
      
      // Get the current port to determine the correct redirect
      const currentPort = window.location.port;
      
      if (['8081', '8082', '8083'].includes(currentPort)) {
        // Development mode - use auth-processor.html directly
        redirectTo = `${window.location.origin}/auth-processor.html`;
      } else if (window.location.hostname === 'localhost') {
        // Other localhost ports (admin panel)
        redirectTo = 'https://afxkliyukojjymvfwiyp.supabase.co/auth/v1/callback';
      } else {
        // Production mode
        redirectTo = `${window.location.origin}/auth-processor.html`;
      }
    }
    
    console.log('🔐 Using redirect URL:', redirectTo);
    console.log('🔐 Using state:', this._authState);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          state: this._authState // Add state parameter for security
        }
      },
    });
    
    if (error) throw error;
    return data;
  },

  /**
   * Mobile platform authentication flow
   * Uses WebBrowser to handle the OAuth flow with improved state management
   */
  async mobileSignIn() {
    console.log('🔐 Starting mobile OAuth flow');
    
    // Generate a secure state parameter
    this._authState = this._generateState();
    
    // Try to use environment variable first if available for testing in Expo Go
    const envRedirectUrl = process.env.EXPO_PUBLIC_OAUTH_REDIRECT_URL;
    let redirectUrl;
    
    if (envRedirectUrl && process.env.EXPO_PUBLIC_USE_WEB_FLOW === 'true') {
      // Use web-style redirect in some cases (for testing)
      console.log(`🔐 Using web redirect URL from env: ${envRedirectUrl}`);
      redirectUrl = envRedirectUrl;
    }
    // Otherwise use native platform redirects
    else if (Platform.OS === 'ios') {
      // iOS uses URL scheme directly
      redirectUrl = 'pawmatch://';
    } else if (Platform.OS === 'android') {
      // For Android, use the Expo scheme
      const scheme = process.env.EXPO_PUBLIC_MOBILE_SCHEME || 'pawmatch';
      redirectUrl = `${scheme}://`;
      
      // If running in Expo Go, use the Expo URL
      if (process.env.EXPO_GO) {
        redirectUrl = 'exp://192.168.68.102:8082';
      }
    } else {
      // Fallback to Supabase default
      redirectUrl = 'https://afxkliyukojjymvfwiyp.supabase.co/auth/v1/callback';
    }
    
    console.log('🔐 Using redirect URL:', redirectUrl);
    console.log('🔐 Using state:', this._authState);
    
    // Get the authorization URL from Supabase
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        scopes: 'email profile',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
          state: this._authState // Add state parameter for security
        },
      },
    });

    if (error) {
      console.error('🔐 OAuth initialization error:', error);
      throw error;
    }
    
    if (!data?.url) {
      console.error('🔐 No authentication URL provided');
      throw new Error('No authentication URL provided');
    }

    console.log('🔐 Opening browser for authentication with URL:', data.url);
    
    try {
      // Use openAuthSessionAsync which better handles redirects
      const result = await WebBrowser.openAuthSessionAsync(
        data.url, 
        redirectUrl
      );
      
      console.log('🔐 Auth session result type:', result.type);
      
      if (result.type === 'success' && result.url) {
        console.log('🔐 Success URL received:', result.url);
        
        // Verify state if present to prevent CSRF attacks
        const url = new URL(result.url);
        const receivedState = url.searchParams.get('state');
        
        if (receivedState && this._authState && receivedState !== this._authState) {
          console.error('🔐 State mismatch! Possible CSRF attack');
          throw new Error('Authentication failed: State mismatch');
        }
        
        // Check for error parameters
        if (url.searchParams.has('error')) {
          const error = url.searchParams.get('error');
          const errorDesc = url.searchParams.get('error_description');
          console.error('🔐 Auth error from redirect:', error, errorDesc);
          throw new Error(`Authentication failed: ${errorDesc || error}`);
        }
        
        // Handle success - check for session
        return this.verifySession();
      } else if (result.type === 'cancel') {
        console.log('🔐 Auth was cancelled by user');
        throw new Error('Authentication was cancelled');
      } else {
        console.error('🔐 Auth failed with result type:', result.type);
        throw new Error(`Authentication failed: ${result.type}`);
      }
    } catch (err) {
      console.error('❌ Error in WebBrowser session:', err);
      throw new Error('Authentication failed. Please try again.');
    }
  },

  /**
   * Verify if a session was created after OAuth flow
   * Tries multiple times with increasing delays
   */
  async verifySession(maxAttempts = 5, initialDelay = 1000) {
    console.log('🔐 Verifying authentication session');
    
    // Wait for the initial delay
    await new Promise(resolve => setTimeout(resolve, initialDelay));
    
    // Try multiple times with increasing delays
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`🔐 Session check attempt ${attempt}/${maxAttempts}`);
      
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Session verification error:', error);
        if (attempt === maxAttempts) throw error;
      }
      
      if (data?.session) {
        console.log('✅ Session verified successfully!');
        return { 
          success: true, 
          session: data.session,
          user: data.session.user
        };
      }
      
      if (attempt < maxAttempts) {
        const delay = initialDelay * (attempt + 1);
        console.log(`🔐 No session found, waiting ${delay}ms before retry`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('Authentication was not completed after multiple attempts');
  },
  
  /**
   * Sign out the current user
   */
  async signOut() {
    console.log('🔐 Signing out');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  },
  
  /**
   * Get the current session
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data;
  },
  
  /**
   * Get the current user
   */
  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  }
};
