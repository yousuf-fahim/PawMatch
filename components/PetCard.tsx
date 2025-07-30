import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Heart, Calendar, Info } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  runOnJS,
  interpolate,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 40;
const CARD_HEIGHT = screenHeight * 0.7;

export interface Pet {
  id: string;
  name: string;
  age: string;
  breed: string;
  location: string;
  image: string;
  personality: string[];
  description: string;
  gender: 'Male' | 'Female';
  size: 'Small' | 'Medium' | 'Large';
}

interface PetCardProps {
  pet: Pet;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onPress: () => void;
}

export default function PetCard({ pet, onSwipeLeft, onSwipeRight, onPress }: PetCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const shimmer = useSharedValue(0);
  const pressed = useSharedValue(0);

  // Start shimmer animation
  React.useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      scale.value = withSpring(0.95);
      pressed.value = withSpring(1);
    },
    onActive: (event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    },
    onEnd: (event) => {
      scale.value = withSpring(1);
      pressed.value = withSpring(0);
      
      if (Math.abs(event.translationX) > 100) {
        translateX.value = withSpring(event.translationX > 0 ? 1000 : -1000);
        translateY.value = withSpring(event.translationY);
        
        if (event.translationX > 0) {
          runOnJS(onSwipeRight)();
        } else {
          runOnJS(onSwipeLeft)();
        }
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      translateX.value,
      [-200, 0, 200],
      [-15, 0, 15]
    );

    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, 100, 200],
      [1, 0.8, 0.6]
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { rotate: `${rotation}deg` },
      ],
      opacity,
    };
  });

  const shimmerBorderStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmer.value,
      [0, 1],
      [-100, CARD_WIDTH + 100]
    );

    const pressIntensity = interpolate(
      pressed.value,
      [0, 1],
      [0.3, 0.8]
    );

    return {
      transform: [{ translateX }],
      opacity: pressIntensity,
    };
  });

  const likeIndicatorStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, 50, 100],
      [0, 0.5, 1]
    );
    
    const scale = interpolate(
      translateX.value,
      [0, 50, 100],
      [0.8, 1, 1.2]
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const passIndicatorStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, -50, -100],
      [0, 0.5, 1]
    );
    
    const scale = interpolate(
      translateX.value,
      [0, -50, -100],
      [0.8, 1, 1.2]
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.card, animatedStyle]}>
        {/* Shimmer Border Effect */}
        <View style={styles.shimmerContainer}>
          <Animated.View style={[styles.shimmerBorderContainer, shimmerBorderStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,0.4)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shimmerBorder}
            />
          </Animated.View>
        </View>
        
        <TouchableOpacity style={styles.cardContent} onPress={onPress} activeOpacity={0.9}>
          <Image source={{ uri: pet.image }} style={styles.image} />
          
          <Animated.View style={[styles.likeIndicator, likeIndicatorStyle]}>
            <Heart size={40} color="#4CAF50" fill="#4CAF50" />
            <Text style={styles.likeText}>LIKE</Text>
          </Animated.View>
          
          <Animated.View style={[styles.passIndicator, passIndicatorStyle]}>
            <Text style={styles.passText}>PASS</Text>
          </Animated.View>
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          >
            <View style={styles.petInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.petName}>{pet.name}</Text>
                <Text style={styles.petAge}>{pet.age}</Text>
              </View>
              
              <Text style={styles.petBreed}>{pet.breed}</Text>
              
              <View style={styles.locationRow}>
                <MapPin size={16} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.location}>{pet.location}</Text>
              </View>
              
              <View style={styles.personalityTags}>
                {pet.personality.slice(0, 3).map((trait, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{trait}</Text>
                  </View>
                ))}
              </View>
            </View>
          </LinearGradient>
          
          <TouchableOpacity style={styles.infoButton} onPress={onPress}>
            <Info size={20} color="white" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  shimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    overflow: 'hidden',
    zIndex: 1,
    pointerEvents: 'none',
  },
  shimmerBorder: {
    position: 'absolute',
    top: -2,
    bottom: -2,
    width: 100,
    borderRadius: 20,
  },
  shimmerBorderContainer: {
    position: 'absolute',
    top: -2,
    bottom: -2,
    width: 100,
  },
  cardContent: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    zIndex: 2,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    justifyContent: 'flex-end',
    padding: 20,
  },
  petInfo: {
    marginBottom: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  petName: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: 'white',
    marginRight: 10,
  },
  petAge: {
    fontSize: 24,
    fontFamily: 'Nunito-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  petBreed: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  location: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 5,
  },
  personalityTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    color: 'white',
  },
  likeIndicator: {
    position: 'absolute',
    top: 50,
    right: 30,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    transform: [{ rotate: '15deg' }],
  },
  likeText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#4CAF50',
    marginTop: 5,
  },
  passIndicator: {
    position: 'absolute',
    top: 50,
    left: 30,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 20,
    transform: [{ rotate: '-15deg' }],
  },
  passText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#FF6B6B',
  },
  infoButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 8,
    borderRadius: 20,
  },
});