import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  LogOut,
  ChevronRight
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { signOut } from '../../lib/mobile-auth-simple';

export default function AccountSettingsScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            // Handle logout logic
            router.replace('/auth' as any);
          }
        }
      ]
    );
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
        <Text style={styles.headerTitle}>Account Settings</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <View style={styles.sectionContent}>
            <View style={styles.infoItem}>
              <View style={styles.infoLeft}>
                <View style={styles.iconContainer}>
                  <User size={20} color="#666" />
                </View>
                <View>
                  <Text style={styles.infoLabel}>Full Name</Text>
                  <Text style={styles.infoValue}>Yousuf Fahim</Text>
                </View>
              </View>
              <ChevronRight size={16} color="#999" />
            </View>
            
            <View style={styles.infoItem}>
              <View style={styles.infoLeft}>
                <View style={styles.iconContainer}>
                  <Mail size={20} color="#666" />
                </View>
                <View>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>yousuf.fahim@email.com</Text>
                </View>
              </View>
              <ChevronRight size={16} color="#999" />
            </View>
            
            <View style={styles.infoItem}>
              <View style={styles.infoLeft}>
                <View style={styles.iconContainer}>
                  <Phone size={20} color="#666" />
                </View>
                <View>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>+880 1706-561532</Text>
                </View>
              </View>
              <ChevronRight size={16} color="#999" />
            </View>
            
            <View style={styles.infoItem}>
              <View style={styles.infoLeft}>
                <View style={styles.iconContainer}>
                  <MapPin size={20} color="#666" />
                </View>
                <View>
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoValue}>Mirpur, Dhaka</Text>
                </View>
              </View>
              <ChevronRight size={16} color="#999" />
            </View>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.actionItem} onPress={handleLogout}>
              <View style={styles.actionLeft}>
                <View style={styles.iconContainer}>
                  <LogOut size={20} color="#FF9800" />
                </View>
                <View>
                  <Text style={styles.actionLabel}>Logout</Text>
                  <Text style={styles.actionDescription}>Sign out of your account</Text>
                </View>
              </View>
              <ChevronRight size={16} color="#999" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.actionItem} onPress={handleLogout}>
              <View style={styles.actionLeft}>
                <View style={styles.iconContainer}>
                  <LogOut size={20} color="#FF9800" />
                </View>
                <View>
                  <Text style={styles.actionLabel}>Logout</Text>
                  <Text style={styles.actionDescription}>Sign out of your account</Text>
                </View>
              </View>
              <ChevronRight size={16} color="#999" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#333',
  },
  passwordSection: {
    padding: 16,
  },
  passwordTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#333',
  },
  passwordInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  changePasswordButton: {
    backgroundColor: '#FF6F61',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  changePasswordText: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: 'white',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionLabel: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#333',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#666',
  },
});
