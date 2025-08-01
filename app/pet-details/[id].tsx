import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Heart, X, MapPin, Star, Calendar, Ruler, Phone, Mail, Share } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { mockPets } from '@/data/pets';
import { useState } from 'react';

const { width, height } = Dimensions.get('window');

export default function PetDetailsScreen() {
  const router = useRouter();
  const { id, isLiked: initialLiked } = useLocalSearchParams();
  const [isLiked, setIsLiked] = useState(initialLiked === 'true');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Find the pet by ID
  const pet = mockPets.find(p => p.id === id);

  if (!pet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Pet not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Handle both single image and image array
  const images = Array.isArray(pet.image) ? pet.image : [pet.image];
  const currentImage = images[currentImageIndex];

  const handleLike = () => {
    setIsLiked(!isLiked);
    // TODO: Add to liked pets in global state
  };

  const handleContact = () => {
    // For now, we'll show contact options
    // TODO: Implement proper contact flow (phone, email, messaging)
    console.log('Contact about', pet.name);
  };

  const handleShare = () => {
    // TODO: Implement native sharing
    console.log('Sharing', pet.name);
  };

  const renderImageItem = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity onPress={() => setCurrentImageIndex(index)}>
      <Image 
        source={{ uri: item }} 
        style={[
          styles.thumbnailImage,
          index === currentImageIndex && styles.activeThumbnail
        ]}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image Section */}
        <View style={styles.heroSection}>
          <Image 
            source={{ uri: currentImage }} 
            style={styles.heroImage}
          />
          
          {/* Gradient overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.4)']}
            style={styles.heroGradient}
          />
          
          {/* Header buttons */}
          <SafeAreaView style={styles.headerButtons}>
            <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.rightButtons}>
              <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
                <Share size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.headerButton, isLiked && styles.likedButton]} 
                onPress={handleLike}
              >
                <Heart size={24} color={isLiked ? "#FF6B6B" : "white"} fill={isLiked ? "#FF6B6B" : "none"} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
          
          {/* Pet basic info overlay */}
          <View style={styles.heroInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.petName}>{pet.name}</Text>
              <View style={styles.ratingBadge}>
                <Star size={16} color="#FFD700" fill="#FFD700" />
                <Text style={styles.ratingText}>4.9</Text>
              </View>
            </View>
            <Text style={styles.petBreed}>{pet.breed}</Text>
            <View style={styles.locationRow}>
              <MapPin size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.petLocation}>{pet.location}</Text>
            </View>
          </View>
        </View>

        {/* Image Gallery */}
        {images.length > 1 && (
          <View style={styles.gallerySection}>
            <Text style={styles.sectionTitle}>More Photos</Text>
            <FlatList
              data={images}
              renderItem={renderImageItem}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.galleryContainer}
            />
          </View>
        )}

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Calendar size={20} color="#FF6B6B" />
              <Text style={styles.statLabel}>Age</Text>
              <Text style={styles.statValue}>{pet.age}</Text>
            </View>
            <View style={styles.statItem}>
              <Ruler size={20} color="#FF6B6B" />
              <Text style={styles.statLabel}>Size</Text>
              <Text style={styles.statValue}>{pet.size}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.genderIcon, { color: pet.gender === 'Male' ? '#4ECDC4' : '#FF6B6B' }]}>
                {pet.gender === 'Male' ? '♂' : '♀'}
              </Text>
              <Text style={styles.statLabel}>Gender</Text>
              <Text style={styles.statValue}>{pet.gender}</Text>
            </View>
          </View>

          {/* Personality Traits */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personality</Text>
            <View style={styles.personalityContainer}>
              {pet.personality?.map((trait, index) => (
                <View key={index} style={styles.personalityTag}>
                  <Text style={styles.personalityText}>{trait}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About {pet.name}</Text>
            <Text style={styles.description}>
              {pet.description || `${pet.name} is a wonderful ${pet.breed.toLowerCase()} looking for a loving home. This ${pet.age} old ${pet.gender.toLowerCase()} is full of personality and would make a great addition to any family.`}
            </Text>
          </View>

          {/* Care Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Care Information</Text>
            <View style={styles.careGrid}>
              <View style={styles.careItem}>
                <Text style={styles.careLabel}>Vaccination</Text>
                <Text style={styles.careValue}>Up to date</Text>
              </View>
              <View style={styles.careItem}>
                <Text style={styles.careLabel}>Spayed/Neutered</Text>
                <Text style={styles.careValue}>Yes</Text>
              </View>
              <View style={styles.careItem}>
                <Text style={styles.careLabel}>House Trained</Text>
                <Text style={styles.careValue}>Yes</Text>
              </View>
              <View style={styles.careItem}>
                <Text style={styles.careLabel}>Good with Kids</Text>
                <Text style={styles.careValue}>Yes</Text>
              </View>
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shelter Information</Text>
            <View style={styles.contactCard}>
              <Text style={styles.shelterName}>Happy Paws Rescue Center</Text>
              <Text style={styles.shelterAddress}>123 Pet Street, {pet.location}</Text>
              
              <View style={styles.contactButtons}>
                <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
                  <Phone size={18} color="#4ECDC4" />
                  <Text style={styles.contactButtonText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
                  <Mail size={18} color="#4ECDC4" />
                  <Text style={styles.contactButtonText}>Email</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  heroSection: {
    height: height * 0.5,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  headerButtons: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  rightButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  likedButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  heroInfo: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  petName: {
    fontSize: 36,
    fontFamily: 'Poppins-Bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backdropFilter: 'blur(10px)',
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: 'white',
    marginLeft: 4,
  },
  petBreed: {
    fontSize: 20,
    fontFamily: 'Nunito-SemiBold',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petLocation: {
    fontSize: 16,
    fontFamily: 'Nunito-Medium',
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 6,
  },
  contentSection: {
    padding: 20,
    paddingBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Nunito-Medium',
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#333',
  },
  genderIcon: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: 16,
  },
  personalityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  personalityTag: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  personalityText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: 'white',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    lineHeight: 24,
  },
  careGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  careItem: {
    width: (width - 60) / 2,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  careLabel: {
    fontSize: 12,
    fontFamily: 'Nunito-Medium',
    color: '#666',
    marginBottom: 4,
  },
  careValue: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#4ECDC4',
  },
  contactCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  shelterName: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: 4,
  },
  shelterAddress: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    marginBottom: 16,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  contactButtonText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#4ECDC4',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    gap: 16,
  },
  passButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  adoptButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ECDC4',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: 'white',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: 'white',
  },
  gallerySection: {
    padding: 20,
    paddingTop: 0,
  },
  galleryContainer: {
    paddingHorizontal: 0,
    gap: 12,
  },
  thumbnailImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 8,
    opacity: 0.7,
  },
  activeThumbnail: {
    opacity: 1,
    borderWidth: 3,
    borderColor: '#FF6B6B',
  },
});
