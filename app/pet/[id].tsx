import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MapPin, 
  Calendar, 
  Ruler, 
  Info,
  Phone,
  MessageCircle,
  Star,
  User
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { mockPets } from '@/data/pets';
import AnimatedButton from '@/components/AnimatedButton';

const { width } = Dimensions.get('window');

export default function PetDetailScreen() {
  const { id, owner } = useLocalSearchParams();
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Check if this is the user's own pet
  const isOwnerView = owner === 'true';

  // Find the pet by ID
  const pet = mockPets.find(p => p.id === id);

  if (!pet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Pet not found</Text>
          <AnimatedButton
            title="Go Back"
            onPress={() => router.back()}
            variant="primary"
            size="medium"
          />
        </View>
      </SafeAreaView>
    );
  }

  // Generate additional images for gallery
  const galleryImages = Array.isArray(pet.image) 
    ? pet.image // Use the array if available
    : [
        pet.image,
        pet.image.replace('1108099', '1254140'), // Different pet image for demo
        pet.image.replace('1108099', '1851164'), // Another different image
        pet.image.replace('1108099', '551628'),  // Another different image
      ];

  const handleBack = () => {
    router.back();
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    // TODO: Add to favorites logic
  };

  const handleShare = () => {
    console.log('Share pet:', pet.name);
    // TODO: Share functionality
  };

  const handleContact = () => {
    console.log('Contact about:', pet.name);
    // TODO: Contact shelter/owner
  };

  const handleAdopt = () => {
    console.log('Adopt:', pet.name);
    // TODO: Adoption process
  };

  const renderPersonalityTags = () => (
    <View style={styles.personalityContainer}>
      <Text style={styles.sectionTitle}>Personality</Text>
      <View style={styles.personalityTags}>
        {pet.personality.map((trait, index) => (
          <View key={index} style={styles.personalityTag}>
            <Text style={styles.personalityText}>{trait}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderInfoCard = (icon: any, title: string, value: string) => (
    <View style={styles.infoCard}>
      <View style={styles.infoIcon}>
        {icon}
      </View>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  const renderImageGallery = () => (
    <View style={styles.imageGallery}>
      <ScrollView 
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        onScroll={(event) => {
          const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentImageIndex(slideIndex);
        }}
        scrollEventThrottle={16}
      >
        {galleryImages.map((imageUri, index) => (
          <Image key={index} source={{ uri: imageUri }} style={styles.galleryImage} />
        ))}
      </ScrollView>
      
      {/* Image Indicators */}
      <View style={styles.imageIndicators}>
        {galleryImages.map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.indicator, 
              currentImageIndex === index && styles.activeIndicator
            ]} 
          />
        ))}
      </View>

      {/* Header Controls */}
      <View style={styles.headerControls}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <ArrowLeft size={24} color="white" strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Share2 size={22} color="white" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerButton, isFavorited && styles.favoriteActive]} 
            onPress={handleFavorite}
          >
            <Heart 
              size={22} 
              color={isFavorited ? "#FF6B6B" : "white"} 
              fill={isFavorited ? "#FF6B6B" : "transparent"}
              strokeWidth={2} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        {renderImageGallery()}

        {/* Pet Info Section */}
        <View style={styles.contentContainer}>
          {/* Basic Info */}
          <View style={styles.basicInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.petName}>{pet.name}</Text>
              <View style={styles.locationContainer}>
                <MapPin size={16} color="#666" />
                <Text style={styles.location}>{pet.location}</Text>
              </View>
            </View>
            <Text style={styles.breed}>{pet.breed}</Text>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            {renderInfoCard(
              <Calendar size={20} color="#FF6B6B" />,
              "Age",
              pet.age
            )}
            {renderInfoCard(
              <User size={20} color="#FF6B6B" />,
              "Gender",
              pet.gender
            )}
            {renderInfoCard(
              <Ruler size={20} color="#FF6B6B" />,
              "Size",
              pet.size
            )}
            {renderInfoCard(
              <Star size={20} color="#FF6B6B" />,
              "Match",
              "95%"
            )}
          </View>

          {/* Personality Tags */}
          {renderPersonalityTags()}

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>About {pet.name}</Text>
            <Text style={styles.description}>{pet.description}</Text>
          </View>

          {/* Health & Care Info */}
          <View style={styles.healthContainer}>
            <Text style={styles.sectionTitle}>Health & Care</Text>
            <View style={styles.healthInfo}>
              <View style={styles.healthItem}>
                <View style={styles.healthIcon}>
                  <Info size={16} color="#4CAF50" />
                </View>
                <View style={styles.healthText}>
                  <Text style={styles.healthTitle}>Vaccinated</Text>
                  <Text style={styles.healthSubtitle}>Up to date</Text>
                </View>
              </View>
              <View style={styles.healthItem}>
                <View style={styles.healthIcon}>
                  <Info size={16} color="#4CAF50" />
                </View>
                <View style={styles.healthText}>
                  <Text style={styles.healthTitle}>Spayed/Neutered</Text>
                  <Text style={styles.healthSubtitle}>Yes</Text>
                </View>
              </View>
              <View style={styles.healthItem}>
                <View style={styles.healthIcon}>
                  <Info size={16} color="#2196F3" />
                </View>
                <View style={styles.healthText}>
                  <Text style={styles.healthTitle}>Microchipped</Text>
                  <Text style={styles.healthSubtitle}>No</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons - Only show for non-owner pets */}
          {!isOwnerView && (
            <View style={styles.actionContainer}>
              <View style={styles.secondaryActions}>
                <TouchableOpacity style={styles.secondaryButton} onPress={handleContact}>
                  <MessageCircle size={20} color="#FF6B6B" />
                  <Text style={styles.secondaryButtonText}>Message</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={handleContact}>
                  <Phone size={20} color="#FF6B6B" />
                  <Text style={styles.secondaryButtonText}>Call</Text>
                </TouchableOpacity>
              </View>
              
              <LinearGradient
                colors={['#FF6B6B', '#FF8E8E']}
                style={styles.adoptButton}
              >
                <TouchableOpacity style={styles.adoptButtonInner} onPress={handleAdopt}>
                  <Text style={styles.adoptButtonText}>Adopt {pet.name}</Text>
                  <Heart size={20} color="white" fill="white" />
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}

          {/* Owner Actions - Only show for owner pets */}
          {isOwnerView && (
            <View style={styles.actionContainer}>
              <View style={styles.secondaryActions}>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push(`/profile/pet/${pet.id}/edit` as any)}>
                  <MessageCircle size={20} color="#FF6B6B" />
                  <Text style={styles.secondaryButtonText}>Edit Info</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => console.log('Share pet')}>
                  <Phone size={20} color="#FF6B6B" />
                  <Text style={styles.secondaryButtonText}>Share</Text>
                </TouchableOpacity>
              </View>
              
              <LinearGradient
                colors={['#4CAF50', '#66BB6A']}
                style={styles.adoptButton}
              >
                <TouchableOpacity style={styles.adoptButtonInner} onPress={() => console.log('View health records')}>
                  <Text style={styles.adoptButtonText}>Health Records</Text>
                  <Heart size={20} color="white" fill="white" />
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}

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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#666',
    marginBottom: 20,
  },
  imageGallery: {
    height: 400,
    position: 'relative',
  },
  galleryImage: {
    width: width,
    height: 400,
    resizeMode: 'cover',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: 'white',
  },
  headerControls: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  basicInfo: {
    marginBottom: 20,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  petName: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    flex: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666',
  },
  breed: {
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    color: '#FF6B6B',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoIcon: {
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  personalityContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  personalityTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  personalityTag: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  personalityText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#FF6B6B',
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    lineHeight: 24,
  },
  healthContainer: {
    marginBottom: 32,
  },
  healthInfo: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  healthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  healthIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  healthText: {
    flex: 1,
  },
  healthTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#333',
  },
  healthSubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666',
  },
  actionContainer: {
    paddingBottom: 32,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#FF6B6B',
  },
  adoptButton: {
    borderRadius: 16,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  adoptButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  adoptButtonText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
  },
});
