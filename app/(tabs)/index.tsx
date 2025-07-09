import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { X, Heart, Filter, Settings } from 'lucide-react-native';
import PetCard, { Pet } from '@/components/PetCard';
import { mockPets } from '@/data/pets';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const [pets, setPets] = useState<Pet[]>(mockPets);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedPets, setLikedPets] = useState<string[]>([]);

  const handleSwipeLeft = () => {
    if (currentIndex < pets.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSwipeRight = () => {
    const currentPet = pets[currentIndex];
    setLikedPets([...likedPets, currentPet.id]);
    
    if (currentIndex < pets.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleCardPress = () => {
    // Navigate to pet details
    console.log('Show pet details');
  };

  const renderCards = () => {
    if (currentIndex >= pets.length) {
      return (
        <View style={styles.noMoreCards}>
          <Text style={styles.noMoreText}>No more pets to discover!</Text>
          <Text style={styles.noMoreSubtext}>Check back later for more adorable pets</Text>
        </View>
      );
    }

    const cards = [];
    for (let i = Math.min(currentIndex + 2, pets.length - 1); i >= currentIndex; i--) {
      const isTop = i === currentIndex;
      const translateY = (i - currentIndex) * 10;
      const scale = 1 - (i - currentIndex) * 0.05;
      
      cards.push(
        <View
          key={pets[i].id}
          style={[
            styles.cardContainer,
            {
              transform: [{ translateY }, { scale }],
              zIndex: pets.length - i,
            },
          ]}
        >
          {isTop && (
            <PetCard
              pet={pets[i]}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              onPress={handleCardPress}
            />
          )}
          {!isTop && (
            <View style={styles.backgroundCard}>
              <Text style={styles.backgroundCardText}>{pets[i].name}</Text>
            </View>
          )}
        </View>
      );
    }
    
    return cards;
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

      <View style={styles.cardStack}>
        {renderCards()}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.passButton} onPress={handleSwipeLeft}>
          <X size={30} color="#FF6B6B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.likeButton} onPress={handleSwipeRight}>
          <Heart size={30} color="white" />
        </TouchableOpacity>
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
  cardStack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    position: 'absolute',
  },
  backgroundCard: {
    width: width - 40,
    height: height * 0.7,
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundCardText: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: '#999',
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
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  likeButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
});