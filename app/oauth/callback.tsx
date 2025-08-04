/**
 * oauth/callback.tsx
 * 
 * Handles OAuth callbacks from deep links for mobile authentication
 */

import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase, authService } from '../../lib/supabase';

export default function OAuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        console.log('🔗 [OAuth Callback] Processing OAuth callback with params:', params);
        
        // Check for error first
        if (params.error) {
          console.error('🔗 [OAuth Callback] Auth error:', params.error);
          
          setTimeout(() => {
            router.push({
              pathname: '/auth',
              params: { 
                error: params.error as string,
                errorDescription: params.error_description as string || 'Authentication failed'
              }
            });
          }, 1000);
          return;
        }
        
        // Check for access token in the URL fragment
        if (params.access_token) {
          console.log('🔗 [OAuth Callback] Found access token in params');
          
          const { data, error } = await supabase.auth.setSession({
            access_token: params.access_token as string,
            refresh_token: params.refresh_token as string || ''
          });
          
          if (error) {
            console.error('🔗 [OAuth Callback] Error setting session:', error);
            router.push('/auth');
            return;
          }
          
          if (data.session) {
            console.log('🔗 [OAuth Callback] Session established successfully');
            await authService.createOrUpdateProfile(data.session.user);
            router.push('/(tabs)');
            return;
          }
        }
        
        // Check for authorization code
        if (params.code) {
          console.log('🔗 [OAuth Callback] Found authorization code in params');
          
          const { data, error } = await supabase.auth.exchangeCodeForSession(params.code as string);
          
          if (error) {
            console.error('🔗 [OAuth Callback] Error exchanging code:', error);
            router.push('/auth');
            return;
          }
          
          if (data.session) {
            console.log('🔗 [OAuth Callback] Session from code exchange successful');
            await authService.createOrUpdateProfile(data.session.user);
            router.push('/(tabs)');
            return;
          }
        }
        
        // If we get here, check for an existing session
        console.log('🔗 [OAuth Callback] No tokens/code found, checking existing session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('🔗 [OAuth Callback] Session check error:', error);
          router.push('/auth');
          return;
        }
        
        if (session) {
          console.log('🔗 [OAuth Callback] Found existing session');
          await authService.createOrUpdateProfile(session.user);
          router.push('/(tabs)');
        } else {
          console.log('🔗 [OAuth Callback] No session found, redirecting to auth');
          router.push('/auth');
        }
      } catch (error) {
        console.error('🔗 [OAuth Callback] Error processing OAuth callback:', error);
        router.push('/auth');
      }
    };
    
    processOAuthCallback();
  }, [router, params]);
  
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF6B6B" style={styles.loader} />
      <Text style={styles.title}>Completing Authentication</Text>
      <Text style={styles.subtitle}>Please wait while we sign you in...</Text>
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
