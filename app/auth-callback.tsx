/**
 * auth-callback.tsx
 * 
 * This screen handles deep links back to the app after authentication.
 * For example, when redirecting from web authentication to the mobile app.
 */

import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase, authService } from '../lib/supabase';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  useEffect(() => {
    // Function to process the authentication callback
    const processAuthCallback = async () => {
      try {
        console.log('🔄 Processing auth callback, params:', params);
        
        // Check if we have an auth code in the params
        if (params.code) {
          console.log('🔄 Found auth code in params');
          // The code would be automatically processed by Supabase
        }
        
        // Check if we have an auth error
        if (params.error) {
          console.error('❌ Auth error:', params.error);
          console.error('❌ Error description:', params.error_description);
          
          // Navigate back to auth screen with error
          setTimeout(() => {
            router.push({
              pathname: '/auth',
              params: { 
                error: params.error as string,
                errorDescription: params.error_description as string
              }
            });
          }, 1000);
          return;
        }
        
        // Check for a session
        console.log('🔄 Checking for session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session error:', error);
          router.push('/auth');
          return;
        }
        
        if (session) {
          console.log('✅ Found session, user:', session.user.email);
          
          // Create or update user profile
          await authService.createOrUpdateProfile(session.user);
          
          // Navigate to the main app
          router.push('/(tabs)');
        } else {
          console.log('⚠️ No session found, redirecting to auth');
          router.push('/auth');
        }
      } catch (error) {
        console.error('❌ Error processing auth callback:', error);
        router.push('/auth');
      }
    };
    
    // Process the auth callback
    processAuthCallback();
  }, [router, params]);
  
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF6B6B" />
      <Text style={styles.text}>Completing authentication...</Text>
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
  text: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
