import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Heart, MapPin, MessageCircle, Share2, Clock, CheckCircle, XCircle, Search } from 'lucide-react-native';
import { mockPets } from '@/data/pets';
import { supabase, databaseService, authService, Pet } from '@/lib/supabase';

// Mock adoption requests data
const mockAdoptionRequests = [
  {
    id: '1',
    petId: '1',
    petName: 'Max',
    petImage: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=400&h=400',
    status: 'approved',
    submittedDate: '2025-08-01',
    responseDate: '2025-08-02',
    shelter: 'Happy Paws Rescue'
  },
  {
    id: '2',
    petId: '2',
    petName: 'Luna',
    petImage: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&h=400',
    status: 'pending',
    submittedDate: '2025-07-30',
    responseDate: null,
    shelter: 'City Animal Shelter'
  },
  {
    id: '3',
    petId: '3',
    petName: 'Charlie',
    petImage: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&h=400',
    status: 'rejected',
    submittedDate: '2025-07-25',
    responseDate: '2025-07-28',
    shelter: 'Furry Friends Foundation'
  }
];

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'approved':
      return <CheckCircle size={20} color="#10B981" />;
    case 'pending':
      return <Clock size={20} color="#F59E0B" />;
    case 'rejected':
      return <XCircle size={20} color="#EF4444" />;
    default:
      return <Clock size={20} color="#9CA3AF" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return '#10B981';
    case 'pending':
      return '#F59E0B';
    case 'rejected':
      return '#EF4444';
    default:
      return '#9CA3AF';
  }
};

export default function SavedScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'saved' | 'requests'>('saved');
  const [savedPets, setSavedPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadSavedPets();
  }, []);

  const loadSavedPets = async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      
      if (currentUser && supabase) {
        // Load user's favorite pets from database
        const favorites = await databaseService.getUserFavorites(currentUser.id);
        setSavedPets(favorites);
      } else {
        // Fallback to mock data if not logged in or Supabase not configured
        const mockPetsConverted = convertMockPetsToDBFormat(mockPets.slice(0, 3));
        setSavedPets(mockPetsConverted);
      }
    } catch (error) {
      console.error('Error loading saved pets:', error);
      // Fallback to mock data on error
      const mockPetsConverted = convertMockPetsToDBFormat(mockPets.slice(0, 3));
      setSavedPets(mockPetsConverted);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert mock pets to database format (same function as in index.tsx)
  const convertMockPetsToDBFormat = (mockPets: any[]): Pet[] => {
    return mockPets.map(pet => ({
      id: pet.id,
      name: pet.name,
      breed: pet.breed,
      age: parseInt(pet.age.replace(/[^\d]/g, '')) || 1,
      gender: pet.gender.toLowerCase() as 'male' | 'female',
      size: pet.size.toLowerCase() as 'small' | 'medium' | 'large',
      color: 'Mixed',
      personality: pet.personality || [],
      description: pet.description || 'A wonderful pet looking for a loving home.',
      images: pet.image ? [pet.image] : [],
      location: pet.location || 'Unknown',
      contact_info: { shelter: 'Local Shelter', phone: '(555) 123-4567' },
      adoption_status: 'available' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  };

  const handleRemoveFromFavorites = async (petId: string) => {
    if (user && supabase) {
      try {
        await databaseService.removeFromFavorites(user.id, petId);
        // Update local state
        setSavedPets(prev => prev.filter(pet => pet.id !== petId));
      } catch (error) {
        console.error('Error removing from favorites:', error);
      }
    } else {
      // Just update local state for mock data
      setSavedPets(prev => prev.filter(pet => pet.id !== petId));
    }
  };

  const handlePetPress = (petId: string) => {
    router.push({
      pathname: '/pet-details/[id]',
      params: { id: petId }
    });
  };

  const handleRequestPress = (request: typeof mockAdoptionRequests[0]) => {
    router.push({
      pathname: '/pet-details/[id]',
      params: { id: request.petId }
    });
  };

  const handleMessage = (petId: string) => {
    const pet = savedPets.find(p => p.id === petId);
    if (pet) {
      const message = `Hi! I'm interested in adopting ${pet.name}, a ${pet.breed}. Could you please provide more information?`;
      const phoneNumber = '1234567890'; // This would come from the pet owner/shelter
      const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
      
      Linking.canOpenURL(whatsappUrl)
        .then(supported => {
          if (supported) {
            return Linking.openURL(whatsappUrl);
          } else {
            Alert.alert('WhatsApp not installed', 'Please install WhatsApp to send messages.');
          }
        })
        .catch(err => console.error('Error opening WhatsApp:', err));
    }
  };

  const handleShare = (petId: string) => {
    const pet = savedPets.find(p => p.id === petId);
    if (pet) {
      const shareMessage = `🐾 Check out this adorable ${pet.breed} named ${pet.name}! They're looking for a loving home. ❤️`;
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(shareMessage)}`;
      
      Linking.canOpenURL(whatsappUrl)
        .then(supported => {
          if (supported) {
            return Linking.openURL(whatsappUrl);
          } else {
            Alert.alert('WhatsApp not installed', 'Please install WhatsApp to share.');
          }
        })
        .catch(err => console.error('Error sharing via WhatsApp:', err));
    }
  };

  const renderAdoptionRequest = ({ item }: { item: typeof mockAdoptionRequests[0] }) => (
    <TouchableOpacity style={styles.requestCard} onPress={() => handleRequestPress(item)}>
      <Image source={{ uri: item.petImage }} style={styles.requestPetImage} />
      <View style={styles.requestInfo}>
        <View style={styles.requestHeader}>
          <Text style={styles.requestPetName}>{item.petName}</Text>
          <View style={styles.statusBadge}>
            <StatusIcon status={item.status} />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={styles.shelterName}>{item.shelter}</Text>
        <Text style={styles.requestDate}>
          Submitted: {new Date(item.submittedDate).toLocaleDateString()}
        </Text>
        {item.responseDate && (
          <Text style={styles.responseDate}>
            Response: {new Date(item.responseDate).toLocaleDateString()}
          </Text>
        )}
        {item.status === 'approved' && (
          <TouchableOpacity 
            style={styles.contactButton} 
            onPress={() => {
              const message = `Hi! I received approval for adopting ${item.petName}. What are the next steps?`;
              const phoneNumber = '1234567890'; // Shelter contact number
              const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
              
              Linking.canOpenURL(whatsappUrl)
                .then(supported => {
                  if (supported) {
                    return Linking.openURL(whatsappUrl);
                  } else {
                    Alert.alert('WhatsApp not installed', 'Please install WhatsApp to contact the shelter.');
                  }
                })
                .catch(err => console.error('Error opening WhatsApp:', err));
            }}
          >
            <MessageCircle size={16} color="#FF6B6B" />
            <Text style={styles.contactButtonText}>Contact Shelter</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderPetItem = ({ item }: { item: Pet }) => (
    <TouchableOpacity style={styles.petCard} onPress={() => handlePetPress(item.id)}>
      <Image 
        source={{ 
          uri: item.images && item.images.length > 0 
            ? item.images[0] 
            : 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400'
        }} 
        style={styles.petImage} 
      />
      <View style={styles.petInfo}>
        <View style={styles.petHeader}>
          <Text style={styles.petName}>{item.name}</Text>
          <TouchableOpacity onPress={() => handleRemoveFromFavorites(item.id)}>
            <Heart size={20} color="#FF6B6B" fill="#FF6B6B" />
          </TouchableOpacity>
        </View>
        <Text style={styles.petBreed}>{item.breed} • {item.age} {item.age === 1 ? 'year' : 'years'} old</Text>
        <View style={styles.locationRow}>
          <MapPin size={14} color="#666" />
          <Text style={styles.location}>{item.location}</Text>
        </View>
        <View style={styles.personalityTags}>
          {item.personality.slice(0, 2).map((trait, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{trait}</Text>
            </View>
          ))}
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.messageButton}
            onPress={(e) => {
              e.stopPropagation();
              handleMessage(item.id);
            }}
          >
            <MessageCircle size={16} color="white" />
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={(e) => {
              e.stopPropagation();
              handleShare(item.id);
            }}
          >
            <Share2 size={16} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
            onPress={() => setActiveTab('saved')}
          >
            <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>
              Saved Pets
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
            onPress={() => setActiveTab('requests')}
          >
            <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
              Adoption Requests
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'saved' ? (
        savedPets.length === 0 ? (
          <View style={styles.emptyState}>
            <Heart size={60} color="#E0E0E0" />
            <Text style={styles.emptyText}>No saved pets yet</Text>
            <Text style={styles.emptySubtext}>Start swiping to find your perfect match!</Text>
          </View>
        ) : (
          <FlatList
            data={savedPets}
            renderItem={renderPetItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : (
        mockAdoptionRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <Search size={60} color="#E0E0E0" />
            <Text style={styles.emptyText}>No adoption requests yet</Text>
            <Text style={styles.emptySubtext}>Apply to adopt a pet to see your request status here</Text>
          </View>
        ) : (
          <FlatList
            data={mockAdoptionRequests}
            renderItem={renderAdoptionRequest}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FF6B6B',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  listContainer: {
    padding: 20,
  },
  petCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  petImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  petInfo: {
    padding: 16,
  },
  petHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  petName: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#333',
  },
  petBreed: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#666',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  location: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    marginLeft: 4,
  },
  personalityTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Nunito-Medium',
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  messageButtonText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    marginLeft: 4,
  },
  shareButton: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  // Adoption Request Styles
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  requestPetImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  requestInfo: {
    flex: 1,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestPetName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    marginLeft: 4,
  },
  shelterName: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#666',
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#999',
    marginBottom: 2,
  },
  responseDate: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#999',
    marginBottom: 8,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  contactButtonText: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    color: '#FF6B6B',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});