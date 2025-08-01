import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Filter, Settings, Heart, X } from 'lucide-react-native';
import { mockPets } from '@/data/pets';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedPets, setLikedPets] = useState<string[]>([]);

  const currentPet = mockPets[currentIndex];

  const handleLike = () => {
    if (currentPet) {
      setLikedPets(prev => [...prev, currentPet.id]);
      console.log('Liked pet:', currentPet.name);
    }
    nextPet();
  };

  const handlePass = () => {
    console.log('Passed on pet:', currentPet?.name);
    nextPet();
  };

  const nextPet = () => {
    if (currentIndex < mockPets.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const renderPetCard = () => {
    if (!currentPet) {
      return (
        <View style={styles.noMoreCards}>
          <Text style={styles.noMoreText}>No more pets to discover!</Text>
          <Text style={styles.noMoreSubtext}>Check back later for more adorable pets</Text>
        </View>
      );
    }

    return (
      <View style={styles.petCard}>
        <Image 
          source={{ uri: currentPet.image as string }} 
          style={styles.petImage}
          onError={() => console.log('Image failed to load for:', currentPet.name)}
          onLoad={() => console.log('Image loaded for:', currentPet.name)}
        />
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{currentPet.name}</Text>
          <Text style={styles.petDetails}>{currentPet.breed} • {currentPet.age}</Text>
          <Text style={styles.petLocation}>{currentPet.location}</Text>
          <Text style={styles.petDescription}>{currentPet.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton}>
            <Filter size={24} color="#FF6B6B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Settings size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardContainer}>
        {renderPetCard()}
      </View>

      {currentPet && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.passButton} onPress={handlePass}>
            <X size={30} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
            <Heart size={30} color="#FFF" />
          </TouchableOpacity>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    padding: 8,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  petCard: {
    width: width - 40,
    height: height * 0.65,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  petImage: {
    width: '100%',
    height: '70%',
    resizeMode: 'cover',
  },
  petInfo: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  petName: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: 5,
  },
  petDetails: {
    fontSize: 16,
    fontFamily: 'Nunito-Medium',
    color: '#666',
    marginBottom: 5,
  },
  petLocation: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#999',
    marginBottom: 10,
  },
  petDescription: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    lineHeight: 20,
  },
  noMoreCards: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noMoreText: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  noMoreSubtext: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 30,
    gap: 60,
  },
  passButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  likeButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});