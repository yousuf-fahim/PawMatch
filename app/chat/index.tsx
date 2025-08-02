import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, MessageCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ChatScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleOpenWhatsApp = () => {
    const message = "Hi! I'm interested in adopting a pet from PawMatch. Could you please help me?";
    const phoneNumber = '01706561532'; // Replace with actual support number
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(whatsappUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(whatsappUrl);
        } else {
          Alert.alert('WhatsApp not installed', 'Please install WhatsApp to contact us.');
        }
      })
      .catch(err => console.error('Error opening WhatsApp:', err));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FF6F61', '#D32F2F']}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Support</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.messageContainer}>
          <MessageCircle size={64} color="#FF6B6B" />
          <Text style={styles.title}>Chat Coming Soon!</Text>
          <Text style={styles.description}>
            We're working on an amazing chat feature. For now, you can reach us directly on WhatsApp for any questions about pet adoption.
          </Text>
          
          <TouchableOpacity style={styles.whatsappButton} onPress={handleOpenWhatsApp}>
            <Text style={styles.whatsappButtonText}>Contact via WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  messageContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 30,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  whatsappButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
  },
});