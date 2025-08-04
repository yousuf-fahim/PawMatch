import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ArrowLeft, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { supabase, authService } from '../lib/supabase';
// Import both direct auth for web and mobile auth for mobile
import { DirectAuth } from '../lib/direct-auth';
import { authenticateWithGoogle } from '../lib/mobile-auth-simple';

export default function AuthScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let result: any;
      
      if (Platform.OS === 'web') {
        console.log('🔐 [Auth] Using DirectAuth for web platform');
        result = await DirectAuth.signInWithGoogle();
      } else {
        console.log('🔐 [Auth] Using Mobile Auth for mobile platform');
        result = await authenticateWithGoogle();
      }
      
      if (result && 'success' in result && result.success && result.user) {
        console.log('🔐 [Auth] Authentication successful!', result.user.email);
        router.replace('/(tabs)');
      } else if (result && 'type' in result && result.type === 'success') {
        console.log('🔐 [Auth] Web authentication successful!');
        router.replace('/(tabs)');
      } else {
        const errorMessage = (result && 'error' in result) ? result.error : 'Authentication failed';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('🔐 [Auth] Sign in error:', error);
      setError(error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // User is authenticated, create profile and navigate
        await authService.createOrUpdateProfile(session.user);
        router.push('/(tabs)');
      } else {
        Alert.alert('Error', 'Sign in was not completed. Please try again.');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      Alert.alert('Error', 'Could not verify sign in status.');
    }
  };

  const handleGuestMode = () => {
    // Navigate to main app without authentication
    router.push('/(tabs)');
  };

  return (
    <LinearGradient
      colors={['#FF6B6B', '#FF8E8E']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Welcome to PawMatch!</Text>
          <Text style={styles.subtitle}>Find your perfect furry companion</Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.authOptions}>
            {/* Google Sign In Button */}
            <TouchableOpacity
              style={[styles.socialButton, { opacity: loading ? 0.7 : 1 }]}
              onPress={handleGoogleSignIn}
              disabled={loading}
            >
              <View style={styles.socialButtonContent}>
                <View style={styles.googleIcon}>
                  <Text style={styles.googleIconText}>G</Text>
                </View>
                <Text style={styles.socialButtonText}>
                  {loading ? 'Signing in...' : 'Continue with Google'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Or Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Guest Mode Button */}
            <TouchableOpacity
              style={styles.guestButton}
              onPress={handleGuestMode}
              disabled={loading}
            >
              <User size={20} color="#666" />
              <Text style={styles.guestButtonText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimer}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 48,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  authOptions: {
    width: '100%',
    maxWidth: 320,
  },
  socialButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  googleIconText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 16,
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  disclaimer: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 32,
    lineHeight: 16,
  },
});
