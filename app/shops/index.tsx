import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Star, Phone, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Mock pet shops data
const mockPetShops = [
  {
    id: '1',
    name: 'Happy Paws Pet Store',
    category: 'Pet Store',
    rating: 4.8,
    reviews: 124,
    distance: '0.8 km',
    image: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&w=400&h=300',
    address: 'Dhanmondi, Dhaka',
    phone: '+880 1234-567890',
    hours: 'Open • Closes 10 PM',
    specialties: ['Pet Food', 'Toys', 'Accessories']
  },
  {
    id: '2',
    name: 'City Veterinary Clinic',
    category: 'Veterinary',
    rating: 4.9,
    reviews: 89,
    distance: '1.2 km',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=400&h=300',
    address: 'Gulshan, Dhaka',
    phone: '+880 1234-567891',
    hours: 'Open • 24 Hours',
    specialties: ['Emergency Care', 'Surgery', 'Vaccination']
  },
  {
    id: '3',
    name: 'Pawsome Grooming',
    category: 'Grooming',
    rating: 4.7,
    reviews: 156,
    distance: '2.1 km',
    image: 'https://images.unsplash.com/photo-1559190394-90caa8fc893c?auto=format&fit=crop&w=400&h=300',
    address: 'Uttara, Dhaka',
    phone: '+880 1234-567892',
    hours: 'Open • Closes 8 PM',
    specialties: ['Bath & Brush', 'Nail Trimming', 'Styling']
  },
  {
    id: '4',
    name: 'Pet Paradise Training',
    category: 'Training',
    rating: 4.6,
    reviews: 67,
    distance: '3.5 km',
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=400&h=300',
    address: 'Bashundhara, Dhaka',
    phone: '+880 1234-567893',
    hours: 'Open • Closes 6 PM',
    specialties: ['Obedience Training', 'Puppy Classes', 'Behavior']
  }
];

export default function ShopsScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleShopPress = (shopId: string) => {
    // Navigate to shop details (placeholder for now)
    console.log('Shop pressed:', shopId);
  };

  const handleCall = (phone: string) => {
    console.log('Call:', phone);
  };

  const renderShopItem = ({ item }: { item: typeof mockPetShops[0] }) => (
    <TouchableOpacity style={styles.shopCard} onPress={() => handleShopPress(item.id)}>
      <Image source={{ uri: item.image }} style={styles.shopImage} />
      <View style={styles.shopInfo}>
        <View style={styles.shopHeader}>
          <Text style={styles.shopName}>{item.name}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>
        
        <View style={styles.ratingContainer}>
          <Star size={16} color="#FFB800" fill="#FFB800" />
          <Text style={styles.rating}>{item.rating}</Text>
          <Text style={styles.reviews}>({item.reviews} reviews)</Text>
        </View>
        
        <View style={styles.locationContainer}>
          <MapPin size={16} color="#666" />
          <Text style={styles.address}>{item.address}</Text>
          <Text style={styles.distance}>• {item.distance}</Text>
        </View>
        
        <Text style={styles.hours}>{item.hours}</Text>
        
        <View style={styles.specialtiesContainer}>
          {item.specialties.slice(0, 2).map((specialty, index) => (
            <View key={index} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          ))}
          {item.specialties.length > 2 && (
            <Text style={styles.moreSpecialties}>+{item.specialties.length - 2} more</Text>
          )}
        </View>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.callButton}
            onPress={() => handleCall(item.phone)}
          >
            <Phone size={16} color="white" />
            <Text style={styles.callButtonText}>Call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.visitButton}>
            <Text style={styles.visitButtonText}>Visit Store</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FF6F61', '#D32F2F']}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pet Shops & Services</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.subtitle}>Discover nearby pet stores, clinics, and services</Text>
        
        <FlatList
          data={mockPetShops}
          renderItem={renderShopItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  shopCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  shopImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  shopInfo: {
    padding: 16,
  },
  shopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  shopName: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    backgroundColor: '#FF6F61',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    color: 'white',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#333',
    marginLeft: 4,
  },
  reviews: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    marginLeft: 4,
  },
  distance: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666',
  },
  hours: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#10B981',
    marginBottom: 12,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  specialtyTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  specialtyText: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    color: '#374151',
  },
  moreSpecialties: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  callButtonText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: 'white',
    marginLeft: 4,
  },
  visitButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visitButtonText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#374151',
  },
});