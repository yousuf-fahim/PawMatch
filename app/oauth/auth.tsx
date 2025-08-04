/**
 * oauth/auth.tsx
 * 
 * Handles OAuth auth callbacks specifically for the pawmatch://auth scheme
 */

import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase, authService } from '../../lib/supabase';

export default function OAuthAuthScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  useEffect(() => {
    const processAuthCallback = async () => {
      try {
        console.log('🔐 [Auth Callback] Processing auth scheme callback with params:', params);
        
        // This handles the pawmatch://auth deep link
        // The params should contain OAuth response data
        
        // Check for error
        if (params.error) {
          console.error('🔐 [Auth Callback] Auth error:', params.error);
          router.push('/auth');
          return;
        }
        
        // Check for access token
        if (params.access_token) {
          console.log('🔐 [Auth Callback] Found access token, setting session');
          
          const { data, error } = await supabase.auth.setSession({
            access_token: params.access_token as string,
            refresh_token: params.refresh_token as string || ''
          });
          
          if (error) {
            console.error('🔐 [Auth Callback] Error setting session:', error);
            router.push('/auth');
            return;
          }
          
          if (data.session) {
            console.log('🔐 [Auth Callback] Session established from auth scheme');
            await authService.createOrUpdateProfile(data.session.user);
            router.push('/(tabs)');
            return;
          }
        }
        
        // Check for authorization code
        if (params.code) {
          console.log('🔐 [Auth Callback] Found code, exchanging for session');
          
          const { data, error } = await supabase.auth.exchangeCodeForSession(params.code as string);
          
          if (error) {
            console.error('🔐 [Auth Callback] Error exchanging code:', error);
            router.push('/auth');
            return;
          }
          
          if (data.session) {
            console.log('🔐 [Auth Callback] Session from code exchange (auth scheme)');
            await authService.createOrUpdateProfile(data.session.user);
            router.push('/(tabs)');
            return;
          }
        }
        
        // If no specific auth data, just redirect to main app
        console.log('🔐 [Auth Callback] No specific auth data, checking session');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('🔐 [Auth Callback] Found existing session');
          await authService.createOrUpdateProfile(session.user);
          router.push('/(tabs)');
        } else {
          console.log('🔐 [Auth Callback] No session, redirecting to auth');
          router.push('/auth');
        }
      } catch (error) {
        console.error('🔐 [Auth Callback] Error in auth scheme callback:', error);
        router.push('/auth');
      }
    };
    
    processAuthCallback();
  }, [router, params]);
  
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF6B6B" style={styles.loader} />
      <Text style={styles.title}>Completing Sign In</Text>
      <Text style={styles.subtitle}>Finalizing your authentication...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  loader: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
