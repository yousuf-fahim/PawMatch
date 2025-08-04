import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ArrowLeft, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { supabase, authService } from '../lib/supabase';
import { GoogleAuth } from '../lib/googleAuth';

export default function AuthScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async () => {
    if (!supabase) {
      Alert.alert('Error', 'Authentication service not configured.');
      return;
    }

    try {
      setLoading(true);
      
      // Use the Google Auth helper
      const result = await GoogleAuth.signInWithGoogle();

      if (result && ('user' in result && result.user)) {
        // Successfully signed in, navigate to main app
        router.push('/(tabs)');
      } else if (result && 'success' in result) {
        // For mobile, the browser opened successfully
        Alert.alert(
          'Complete Sign In', 
          'Please complete the sign-in process in your browser, then return to the app.',
          [
            {
              text: 'I\'ve signed in',
              onPress: () => {
                // Check if user is now authenticated
                checkAuthStatus();
              }
            }
          ]
        );
      }
      
    } catch (error: any) {
      console.error('Google auth error:', error);
      Alert.alert('Error', error.message || 'Google sign in failed. Please try again.');
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

          <View style={styles.authOptions}>
            {/* Google Sign In Button */}
            <TouchableOpacity
              style={[styles.socialButton, { opacity: loading ? 0.7 : 1 }]}
              onPress={handleGoogleAuth}
              disabled={loading}
            >
              <View style={styles.socialButtonContent}>
                <View style={styles.googleIcon}>
                  <Text style={styles.googleIconText}>G</Text>
                </View>
                <Text style={styles.socialButtonText}>Continue with Google</Text>
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
            >
              <User size={20} color="#FF6B6B" />
              <Text style={styles.guestButtonText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimer}>
            Sign in with Google to save your favorites and get personalized recommendations
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
    padding: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 50,
  },
  authOptions: {
    gap: 20,
  },
  socialButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 15,
    fontSize: 14,
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
    gap: 8,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  disclaimer: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 30,
    lineHeight: 16,
  },
});
