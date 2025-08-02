import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Filter, Bell, Heart, X, MapPin, Star } from 'lucide-react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { mockPets } from '@/data/pets';
import FilterModal, { Filters } from '@/components/FilterModal';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 30;
const CARD_HEIGHT = height * 0.7;
const SWIPE_THRESHOLD = width * 0.25;

export default function HomeScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedPets, setLikedPets] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    breed: 'All Breeds',
    age: 'All Ages',
    size: 'All Sizes',
    distance: 'Any Distance'
  });
  const [filteredPets, setFilteredPets] = useState(mockPets);
  
  // Double buffer: maintain two separate card states
  const [cardAData, setCardAData] = useState(0); // Index for card A
  const [cardBData, setCardBData] = useState(1); // Index for card B
  const [activeCard, setActiveCard] = useState<'A' | 'B'>('A'); // Which card is currently visible

  // Animation values for both cards
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);
  
  // Opacity values for each card (only one visible at a time)
  const cardAOpacity = useSharedValue(1);
  const cardBOpacity = useSharedValue(0);

  // Safe access to pets with error handling - using double buffer
  const totalPets = filteredPets?.length || 0;
  
  // Get the current active pet based on which card is active
  const currentPetIndex = activeCard === 'A' ? cardAData : cardBData;
  const currentPet = totalPets > 0 ? filteredPets[currentPetIndex % totalPets] : null;

  // Apply filters when they change
  useEffect(() => {
    applyFilters(filters);
  }, [filters]);

  // Filter pets based on selected criteria
  const applyFilters = (newFilters: Filters) => {
    let filtered = [...mockPets];
    
    // Apply breed filter
    if (newFilters.breed !== 'All Breeds') {
      filtered = filtered.filter(pet => pet.breed === newFilters.breed);
    }
    
    // Apply age filter
    if (newFilters.age !== 'All Ages') {
      filtered = filtered.filter(pet => {
        const petAge = pet.age.toLowerCase();
        const filterAge = newFilters.age.toLowerCase();
        
        if (filterAge.includes('puppy') || filterAge.includes('kitten')) {
          return petAge.includes('month') || petAge.includes('puppy') || petAge.includes('kitten');
        }
        if (filterAge.includes('young')) {
          return petAge.includes('1') || petAge.includes('2') || petAge.includes('3');
        }
        if (filterAge.includes('adult')) {
          return petAge.includes('4') || petAge.includes('5') || petAge.includes('6') || petAge.includes('7');
        }
        if (filterAge.includes('senior')) {
          return petAge.includes('8') || petAge.includes('9') || petAge.includes('10') || petAge.includes('senior');
        }
        return true;
      });
    }
    
    // Apply size filter
    if (newFilters.size !== 'All Sizes') {
      filtered = filtered.filter(pet => pet.size === newFilters.size);
    }
    
    setFilteredPets(filtered);
    
    // Reset card positions when filters change
    setCardAData(0);
    setCardBData(1);
    setActiveCard('A');
    cardAOpacity.value = 1;
    cardBOpacity.value = 0;
  };

  const handleLike = () => {
    if (currentPet) {
      setLikedPets(prev => [...prev, currentPet.id]);
    }
    nextCard();
  };

  const handlePass = () => {
    nextCard();
  };

  const handleCardPress = () => {
    if (currentPet && !isAnimating) {
      // Navigate to pet details page with liked status
      router.push({
        pathname: '/pet-details/[id]',
        params: { 
          id: currentPet.id,
          isLiked: likedPets.includes(currentPet.id).toString()
        }
      });
    }
  };

    const nextCard = () => {
    if (totalPets === 0 || isAnimating) return;
    
    setIsAnimating(true);
    
    // Get current indices
    const currentAIndex = cardAData;
    const currentBIndex = cardBData;
    
    if (activeCard === 'A') {
      // A is currently visible, B will become visible
      // Update A to show the next pet after B
      const nextAIndex = (currentBIndex + 1) % totalPets;
      setCardAData(nextAIndex);
      
      // Switch to card B
      cardAOpacity.value = 0;
      cardBOpacity.value = 1;
      setActiveCard('B');
      setCurrentIndex(currentBIndex);
    } else {
      // B is currently visible, A will become visible  
      // Update B to show the next pet after A
      const nextBIndex = (currentAIndex + 1) % totalPets;
      setCardBData(nextBIndex);
      
      // Switch to card A
      cardBOpacity.value = 0;
      cardAOpacity.value = 1;
      setActiveCard('A');
      setCurrentIndex(currentAIndex);
    }
    
    // Reset animation values immediately
    translateX.value = 0;
    translateY.value = 0;
    scale.value = 1;
    rotate.value = 0;
    
    // Small delay to ensure React state updates are processed
    setTimeout(() => {
      setIsAnimating(false);
    }, 50);
  };

  const animatedLike = () => {
    if (isAnimating) return;
    
    translateX.value = withTiming(width, { duration: 150 }, (finished) => {
      if (finished) {
        runOnJS(handleLike)();
      }
    });
  };

  const animatedPass = () => {
    if (isAnimating) return;
    
    translateX.value = withTiming(-width, { duration: 150 }, (finished) => {
      if (finished) {
        runOnJS(handlePass)();
      }
    });
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      if (isAnimating) return;
      // Always start from current position (should be 0 after reset)
      context.startX = translateX.value;
      context.startY = translateY.value;
    },
    onActive: (event, context: any) => {
      if (isAnimating) return;
      
      translateX.value = context.startX + event.translationX;
      translateY.value = context.startY + event.translationY;
      
      // Rotation based on horizontal movement
      rotate.value = interpolate(
        translateX.value,
        [-width, 0, width],
        [-15, 0, 15],
        Extrapolate.CLAMP
      );
      
      // Scale down slightly while dragging
      scale.value = interpolate(
        Math.abs(translateX.value),
        [0, width * 0.5],
        [1, 0.95],
        Extrapolate.CLAMP
      );
    },
    onEnd: (event) => {
      if (isAnimating) return;
      
      const shouldSwipeLeft = translateX.value < -SWIPE_THRESHOLD;
      const shouldSwipeRight = translateX.value > SWIPE_THRESHOLD;
      
      if (shouldSwipeLeft) {
        // Animate card off screen, then handle the swipe
        translateX.value = withTiming(-width, { duration: 150 }, (finished) => {
          if (finished) {
            runOnJS(handlePass)();
          }
        });
      } else if (shouldSwipeRight) {
        // Animate card off screen, then handle the swipe
        translateX.value = withTiming(width, { duration: 150 }, (finished) => {
          if (finished) {
            runOnJS(handleLike)();
          }
        });
      } else {
        // Snap back to center with less bounce
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
        translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
        rotate.value = withSpring(0, { damping: 20, stiffness: 200 });
        scale.value = withSpring(1, { damping: 20, stiffness: 200 });
      }
    },
  });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const currentOpacity = activeCard === 'A' ? cardAOpacity.value : cardBOpacity.value;
    return {
      opacity: currentOpacity,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
        { scale: scale.value },
      ],
    };
  });

  const cardAAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: cardAOpacity.value,
      transform: [
        { translateX: activeCard === 'A' ? translateX.value : 0 },
        { translateY: activeCard === 'A' ? translateY.value : 0 },
        { rotate: activeCard === 'A' ? `${rotate.value}deg` : '0deg' },
        { scale: activeCard === 'A' ? scale.value : 1 },
      ],
    };
  });

  const cardBAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: cardBOpacity.value,
      transform: [
        { translateX: activeCard === 'B' ? translateX.value : 0 },
        { translateY: activeCard === 'B' ? translateY.value : 0 },
        { rotate: activeCard === 'B' ? `${rotate.value}deg` : '0deg' },
        { scale: activeCard === 'B' ? scale.value : 1 },
      ],
    };
  });

  const likeIndicatorStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, width * 0.3],
      [0, 1],
      Extrapolate.CLAMP
    );
    
    return { opacity };
  });

  const passIndicatorStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-width * 0.3, 0],
      [1, 0],
      Extrapolate.CLAMP
    );
    
    return { opacity };
  });

  const renderCard = (pet: any, isNext = false) => {
    if (!pet) return null;
    
    // Handle both single image strings and image arrays
    const imageUri = Array.isArray(pet.image) 
      ? pet.image[0] 
      : typeof pet.image === 'string' 
        ? pet.image 
        : '';
    
    return (
      <TouchableOpacity 
        style={[styles.petCard, isNext && styles.nextCard]}
        onPress={isNext ? undefined : handleCardPress}
        activeOpacity={isNext ? 1 : 0.95}
      >
        <Image 
          source={{ uri: imageUri }} 
          style={styles.petImage}
          onError={(error) => {
            // Silently handle image loading errors
          }}
        />
        
        {/* Gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
          style={styles.gradientOverlay}
        />
        
        {/* Pet info overlay */}
        <View style={styles.petInfoOverlay}>
          <View style={styles.petHeader}>
            <Text style={styles.petName}>{pet.name || 'Unknown'}</Text>
            <View style={styles.ageContainer}>
              <Text style={styles.petAge}>{pet.age || 'Unknown age'}</Text>
            </View>
          </View>
          
          <Text style={styles.petBreed}>{pet.breed || 'Mixed breed'}</Text>
          
          <View style={styles.locationContainer}>
            <MapPin size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.petLocation}>{pet.location || 'Location unknown'}</Text>
          </View>
          
          <View style={styles.personalityContainer}>
            {(pet.personality || []).slice(0, 3).map((trait: string, index: number) => (
              <View key={index} style={styles.personalityTag}>
                <Text style={styles.personalityText}>{trait}</Text>
              </View>
            ))}
          </View>
          
          <Text style={styles.petDescription} numberOfLines={2}>
            {pet.description || 'No description available'}
          </Text>
        </View>
        
        {/* Rating badge */}
        <View style={styles.ratingBadge}>
          <Star size={12} color="#FFD700" fill="#FFD700" />
          <Text style={styles.ratingText}>4.9</Text>
        </View>
        
        {/* Tap indicator for current card - aligned with rating */}
        {!isNext && (
          <View style={styles.tapIndicator}>
            <Text style={styles.tapText}>Tap for details</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <View style={styles.headerButtons}>
          
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/notifications')}>
            <Bell size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>

            <View style={styles.cardContainer}>
        {totalPets === 0 ? (
          <View style={styles.noMoreCards}>
            <Text style={styles.noMoreText}>No pets available</Text>
            <Text style={styles.noMoreSubtext}>Check back later for more adorable pets!</Text>
          </View>
        ) : (
          <>
            {/* Card A - Double Buffer System */}
            {activeCard === 'A' ? (
              <PanGestureHandler onGestureEvent={gestureHandler}>
                <Animated.View 
                  key="card-a"
                  style={[styles.cardWrapper, cardAAnimatedStyle]}
                >
                  {filteredPets[cardAData % totalPets] && renderCard(filteredPets[cardAData % totalPets], false)}
                  
                  {/* Like indicator - only show on active card */}
                  <Animated.View style={[styles.likeIndicator, likeIndicatorStyle]}>
                    <Text style={styles.indicatorText}>LIKE</Text>
                  </Animated.View>
                  
                  {/* Pass indicator - only show on active card */}
                  <Animated.View style={[styles.passIndicator, passIndicatorStyle]}>
                    <Text style={styles.indicatorText}>PASS</Text>
                  </Animated.View>
                </Animated.View>
              </PanGestureHandler>
            ) : (
              <Animated.View 
                key="card-a"
                style={[styles.cardWrapper, cardAAnimatedStyle]}
                pointerEvents="none"
              >
                {filteredPets[cardAData % totalPets] && renderCard(filteredPets[cardAData % totalPets], true)}
              </Animated.View>
            )}
            
            {/* Card B - Double Buffer System */}
            {activeCard === 'B' ? (
              <PanGestureHandler onGestureEvent={gestureHandler}>
                <Animated.View 
                  key="card-b"
                  style={[styles.cardWrapper, cardBAnimatedStyle]}
                >
                  {filteredPets[cardBData % totalPets] && renderCard(filteredPets[cardBData % totalPets], false)}
                  
                  {/* Like indicator - only show on active card */}
                  <Animated.View style={[styles.likeIndicator, likeIndicatorStyle]}>
                    <Text style={styles.indicatorText}>LIKE</Text>
                  </Animated.View>
                  
                  {/* Pass indicator - only show on active card */}
                  <Animated.View style={[styles.passIndicator, passIndicatorStyle]}>
                    <Text style={styles.indicatorText}>PASS</Text>
                  </Animated.View>
                </Animated.View>
              </PanGestureHandler>
            ) : (
              <Animated.View 
                key="card-b"
                style={[styles.cardWrapper, cardBAnimatedStyle]}
                pointerEvents="none"
              >
                {filteredPets[cardBData % totalPets] && renderCard(filteredPets[cardBData % totalPets], true)}
              </Animated.View>
            )}
          </>
        )}
      </View>

      {currentPet && totalPets > 0 && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.passButton} onPress={animatedPass}>
            <X size={30} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.likeButton} onPress={animatedLike}>
            <Heart size={30} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={setFilters}
        currentFilters={filters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#FF6B6B',
    letterSpacing: -0.5,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  headerButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 12,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 25, // Add margin to prevent overlap with header
  },
  cardWrapper: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  petCard: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 25,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
    elevation: 20,
    overflow: 'hidden',
  },
  nextCard: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  petImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  petInfoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 25,
    paddingBottom: 30,
  },
  petHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  petName: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  ageContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backdropFilter: 'blur(10px)',
  },
  petAge: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: 'white',
  },
  petBreed: {
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  petLocation: {
    fontSize: 14,
    fontFamily: 'Nunito-Medium',
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 6,
  },
  personalityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  personalityTag: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backdropFilter: 'blur(10px)',
  },
  personalityText: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    color: 'white',
  },
  petDescription: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  ratingBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backdropFilter: 'blur(10px)',
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Nunito-Bold',
    color: 'white',
    marginLeft: 4,
  },
  likeIndicator: {
    position: 'absolute',
    top: 100,
    left: 30,
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    transform: [{ rotate: '-15deg' }],
    borderWidth: 4,
    borderColor: 'white',
  },
  passIndicator: {
    position: 'absolute',
    top: 100,
    right: 30,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    transform: [{ rotate: '15deg' }],
    borderWidth: 4,
    borderColor: 'white',
  },
  indicatorText: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: 'white',
    letterSpacing: 2,
  },
  noMoreCards: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 25,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
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
    paddingBottom: 0,
    paddingTop: 5,
    gap: 80,
  },
  passButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 12,
    borderWidth: 2,
    borderColor: 'white',
  },
  likeButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 12,
    borderWidth: 2,
    borderColor: 'white',
  },
  tapIndicator: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  tapText: {
    fontSize: 11,
    fontFamily: 'Nunito-SemiBold',
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
  },
  tapDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
});