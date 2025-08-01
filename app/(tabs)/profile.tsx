import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, Settings, Heart, Plus, MapPin, Phone, Mail, Calendar, CreditCard as Edit3 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const router = useRouter();
  
  const userPets = [
    {
      id: '1',
      name: 'Peu',
      breed: 'Persian',
      age: '1 year',
      image: 'https://i.postimg.cc/rwPDrn80/Peu.jpg',
    },
  ];

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
    router.push(`/pet/${petId}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#2E3192', '#1BFFFF']}
          style={styles.headerGradient}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: 'https://i.postimg.cc/NjFjx6M3/fahim.jpg' }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                <Edit3 size={16} color="white" />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>Yousuf Fahim</Text>
            <Text style={styles.userLocation}>Mirpur, Dhaka</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Heart size={24} color="#60c4fdff" />
              <Text style={styles.statNumber}>23</Text>
              <Text style={styles.statLabel}>Liked</Text>
            </View>
            <View style={styles.statItem}>
              <User size={24} color="#60c4fdff" />
              <Text style={styles.statNumber}>1</Text>
              <Text style={styles.statLabel}>My Pets</Text>
            </View>
            <View style={styles.statItem}>
              <MapPin size={24} color="#60c4fdff" />
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Nearby</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Pets</Text>
              <TouchableOpacity style={styles.addButton} onPress={handleAddPet}>
                <Plus size={20} color="#60c4fdff" />
              </TouchableOpacity>
            </View>
            
            {userPets.map((pet) => (
              <TouchableOpacity key={pet.id} style={styles.petCard} onPress={() => handleViewPet(pet.id)}>
                <Image source={{ uri: Array.isArray(pet.image) ? pet.image[0] : pet.image }} style={styles.petImage} />
                <View style={styles.petInfo}>
                  <Text style={styles.petName}>{pet.name}</Text>
                  <Text style={styles.petDetails}>{pet.breed} • {pet.age}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.editPetButton} 
                  onPress={(e) => {
                    e.stopPropagation();
                    handleEditPet(pet.id);
                  }}
                >
                  <Edit3 size={16} color="#666" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <View style={styles.contactItem}>
              <Phone size={20} color="#666" />
              <Text style={styles.contactText}>+880 1706-561532</Text>
            </View>
            <View style={styles.contactItem}>
              <Mail size={20} color="#666" />
              <Text style={styles.contactText}>yousuf.fahim@email.com</Text>
            </View>
            <View style={styles.contactItem}>
              <Calendar size={20} color="#666" />
              <Text style={styles.contactText}>Member since March 2025</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <TouchableOpacity style={styles.settingItem}>
              <Settings size={20} color="#666" />
              <Text style={styles.settingText}>App Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <User size={20} color="#666" />
              <Text style={styles.settingText}>Account Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <Heart size={20} color="#666" />
              <Text style={styles.settingText}>Notifications</Text>
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
});