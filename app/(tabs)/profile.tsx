import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, Settings, Heart, Plus, MapPin, Phone, Mail, Calendar, Edit, LogOut } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { databaseService, supabase, UserProfile, Pet, authService } from '../../lib/supabase';
import AnimatedLoader from '../../components/AnimatedLoader';

export default function ProfileScreen() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPets, setUserPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    liked: 0,
    myPets: 0,
    nearby: 0
  });
  
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      if (!supabase) {
        // If Supabase not configured, show default data
        setUserProfile(null);
        setUserPets([]);
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserProfile(null);
        setUserPets([]);
        return;
      }

      // Load user profile - using direct supabase call since getUserProfile may not be exported
      try {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setUserProfile(profileData as unknown as UserProfile);
      } catch (profileError) {
        console.log('Profile not found, user may need to complete setup');
        setUserProfile(null);
      }

      // Load user's pets
      const pets = await databaseService.getUserPets(user.id);
      setUserPets(pets);

      // Load user's favorites for stats
      const favorites = await databaseService.getUserFavorites(user.id);
      
      // Calculate nearby pets (simplified - using available pets count)
      const availablePets = await databaseService.getAvailablePets(10);
      
      setStats({
        liked: favorites.length,
        myPets: pets.length,
        nearby: availablePets.length
      });

    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fallback data when not authenticated or no database
  const fallbackProfile = {
    full_name: 'Pet Lover',
    location: 'Location not set',
    phone: 'Phone not set',
    email: 'user@example.com',
    avatar_url: null, // Remove stock image
    created_at: new Date().toISOString(),
  };

  const fallbackPets = [
    {
      id: '1',
      name: 'Peu',
      breed: 'Persian',
      age: 1,
      gender: 'male' as const,
      size: 'medium' as const,
      color: 'Gray',
      personality: ['friendly'],
      description: 'A lovely Persian cat',
      images: ['https://i.postimg.cc/rwPDrn80/Peu.jpg'],
      location: 'Dhaka',
      shelter_id: 'user',
      available: true,
      health_status: 'healthy',
      vaccination_status: 'up_to_date',
      spayed_neutered: true,
      good_with_kids: true,
      good_with_pets: true,
      energy_level: 'medium',
      created_at: '2025-01-01',
      updated_at: '2025-01-01'
    }
  ];

  const displayProfile = userProfile || fallbackProfile;
  const displayPets = userPets.length > 0 ? userPets : fallbackPets;
  const displayStats = userProfile ? stats : { liked: 23, myPets: 1, nearby: 5 };

  const handleEditProfile = () => {
    router.push('/profile/edit' as any);
  };

  const handleAddPet = () => {
    router.push('/profile/add-pet' as any);
  };

  const handleEditPet = (petId: string) => {
    router.push(`/profile/pet/${petId}` as any);
  };

  const handleViewPet = (petId: string) => {
    router.push(`/pet-details/${petId}` as any);
  };

  const handleAppSettings = () => {
    router.push('/profile/app-settings' as any);
  };

  const handleAccountSettings = () => {
    router.push('/profile/account-settings' as any);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              if (supabase) {
                await authService.signOut();
              }
              router.replace('/auth' as any);
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <AnimatedLoader variant="dots" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#FF6F61', '#D32F2F']}
          style={styles.headerGradient}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {displayProfile.avatar_url ? (
                <Image
                  source={{ uri: displayProfile.avatar_url }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.defaultAvatar}>
                  <User size={40} color="#4ECDC4" />
                </View>
              )}
              <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                <Edit size={16} color="white" />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>{displayProfile.full_name || 'Pet Lover'}</Text>
            <Text style={styles.userLocation}>{displayProfile.location || 'Location not set'}</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Heart size={24} color="#FF6F61" />
              <Text style={styles.statNumber}>{displayStats.liked}</Text>
              <Text style={styles.statLabel}>Liked</Text>
            </View>
            <View style={styles.statItem}>
              <User size={24} color="#FF6F61" />
              <Text style={styles.statNumber}>{displayStats.myPets}</Text>
              <Text style={styles.statLabel}>My Pets</Text>
            </View>
            <View style={styles.statItem}>
              <MapPin size={24} color="#FF6F61" />
              <Text style={styles.statNumber}>{displayStats.nearby}</Text>
              <Text style={styles.statLabel}>Nearby</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Pets</Text>
              <TouchableOpacity style={styles.addButton} onPress={handleAddPet}>
                <Plus size={20} color="#FF6F61" />
              </TouchableOpacity>
            </View>
            
            {displayPets.map((pet) => (
              <TouchableOpacity key={pet.id} style={styles.petCard} onPress={() => handleViewPet(pet.id)}>
                <Image 
                  source={{ uri: Array.isArray(pet.images) ? pet.images[0] : pet.images || 'https://i.postimg.cc/rwPDrn80/Peu.jpg' }} 
                  style={styles.petImage} 
                />
                <View style={styles.petInfo}>
                  <Text style={styles.petName}>{pet.name}</Text>
                  <Text style={styles.petDetails}>{pet.breed} • {pet.age} year{pet.age !== 1 ? 's' : ''}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.editPetButton} 
                  onPress={(e) => {
                    e.stopPropagation();
                    handleEditPet(pet.id);
                  }}
                >
                  <Edit size={16} color="#666" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <View style={styles.contactItem}>
              <Phone size={20} color="#666" />
              <Text style={styles.contactText}>{displayProfile.phone || 'Phone not set'}</Text>
            </View>
            <View style={styles.contactItem}>
              <Mail size={20} color="#666" />
              <Text style={styles.contactText}>{displayProfile.email || 'Email not set'}</Text>
            </View>
            <View style={styles.contactItem}>
              <Calendar size={20} color="#666" />
              <Text style={styles.contactText}>
                Member since {displayProfile.created_at ? new Date(displayProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <TouchableOpacity style={styles.settingItem} onPress={handleAppSettings}>
              <Settings size={20} color="#666" />
              <Text style={styles.settingText}>App Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem} onPress={handleAccountSettings}>
              <User size={20} color="#666" />
              <Text style={styles.settingText}>Account Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.settingItem, styles.logoutItem]} onPress={handleLogout}>
              <LogOut size={20} color="#FF6B6B" />
              <Text style={[styles.settingText, styles.logoutText]}>Logout</Text>
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
  headerGradient: {
    paddingBottom: 30,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'white',
  },
  defaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'white',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 8,
    borderRadius: 16,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: 'white',
    marginBottom: 5,
  },
  userLocation: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginTop: -15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    marginTop: 2,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  addButton: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 2,
  },
  petDetails: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666',
  },
  editPetButton: {
    padding: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contactText: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#333',
    marginLeft: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingText: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#333',
    marginLeft: 15,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    marginTop: 16,
  },
  logoutItem: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 107, 107, 0.2)',
    marginTop: 10,
  },
  logoutText: {
    color: '#FF6B6B',
    fontFamily: 'Nunito-SemiBold',
  },
});