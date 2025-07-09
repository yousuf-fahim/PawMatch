import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, MapPin, MessageCircle, Share2 } from 'lucide-react-native';
import { mockPets } from '@/data/pets';

export default function SavedScreen() {
  // Mock saved pets (first 3 pets)
  const savedPets = mockPets.slice(0, 3);

  const handleMessage = (petId: string) => {
    console.log('Message pet owner:', petId);
  };

  const handleShare = (petId: string) => {
    console.log('Share pet:', petId);
  };

  const renderPetItem = ({ item }: { item: typeof mockPets[0] }) => (
    <View style={styles.petCard}>
      <Image source={{ uri: item.image }} style={styles.petImage} />
      <View style={styles.petInfo}>
        <View style={styles.petHeader}>
          <Text style={styles.petName}>{item.name}</Text>
          <TouchableOpacity>
            <Heart size={20} color="#FF6B6B" fill="#FF6B6B" />
          </TouchableOpacity>
        </View>
        <Text style={styles.petBreed}>{item.breed} • {item.age}</Text>
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
            onPress={() => handleMessage(item.id)}
          >
            <MessageCircle size={16} color="white" />
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={() => handleShare(item.id)}
          >
            <Share2 size={16} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Pets</Text>
        <Text style={styles.subtitle}>Your favorite furry friends</Text>
      </View>

      {savedPets.length === 0 ? (
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
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#666',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#999',
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  petCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  petImage: {
    width: 100,
    height: 120,
    resizeMode: 'cover',
  },
  petInfo: {
    flex: 1,
    padding: 15,
  },
  petHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  petName: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  petBreed: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    marginBottom: 5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
    gap: 5,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    fontFamily: 'Nunito-SemiBold',
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
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  messageButtonText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
  },
  shareButton: {
    padding: 8,
  },
});