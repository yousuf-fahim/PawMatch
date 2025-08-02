import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Star, Phone, Clock, ExternalLink, Heart } from 'lucide-react-native';

// Mock pet services data
const mockPetServices = [
  {
    id: '1',
    name: 'Happy Paws Veterinary Clinic',
    type: 'Veterinary',
    image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=400&h=300',
    rating: 4.8,
    distance: '2.5 km',
    address: 'Gulshan-1, Dhaka',
    phone: '+880 1234567890',
    hours: '9:00 AM - 9:00 PM',
    specialties: ['Surgery', 'Dental Care', 'Emergency'],
    description: 'Full-service veterinary clinic with experienced doctors and modern equipment.'
  },
  {
    id: '2',
    name: 'Furry Friends Grooming Salon',
    type: 'Grooming',
    image: 'https://images.unsplash.com/photo-1522276498395-f4f68f7f8454?auto=format&fit=crop&w=400&h=300',
    rating: 4.6,
    distance: '1.8 km',
    address: 'Dhanmondi, Dhaka',
    phone: '+880 1234567891',
    hours: '10:00 AM - 7:00 PM',
    specialties: ['Bathing', 'Haircuts', 'Nail Trimming'],
    description: 'Professional pet grooming services with gentle care for your beloved pets.'
  },
  {
    id: '3',
    name: 'Pet Paradise Training Center',
    type: 'Training',
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=400&h=300',
    rating: 4.9,
    distance: '3.2 km',
    address: 'Uttara, Dhaka',
    phone: '+880 1234567892',
    hours: '8:00 AM - 6:00 PM',
    specialties: ['Obedience Training', 'Behavioral Therapy', 'Puppy Classes'],
    description: 'Expert pet training services to help your pet become well-behaved and happy.'
  },
  {
    id: '4',
    name: 'PetMart Supplies Store',
    type: 'Pet Store',
    image: 'https://images.unsplash.com/photo-1601758260760-5c23c84b2a88?auto=format&fit=crop&w=400&h=300',
    rating: 4.4,
    distance: '1.2 km',
    address: 'Mirpur, Dhaka',
    phone: '+880 1234567893',
    hours: '9:00 AM - 10:00 PM',
    specialties: ['Pet Food', 'Toys', 'Accessories'],
    description: 'One-stop shop for all your pet needs with high-quality products.'
  },
  {
    id: '5',
    name: 'Cozy Paws Pet Hotel',
    type: 'Boarding',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&h=300',
    rating: 4.7,
    distance: '4.1 km',
    address: 'Banani, Dhaka',
    phone: '+880 1234567894',
    hours: '24/7',
    specialties: ['Pet Boarding', 'Day Care', 'Play Time'],
    description: 'Safe and comfortable boarding facility for pets when you\'re away.'
  }
];

const serviceTypeColors: Record<string, string> = {
  'Veterinary': '#10B981',
  'Grooming': '#8B5CF6',
  'Training': '#F59E0B',
  'Pet Store': '#3B82F6',
  'Boarding': '#EF4444'
};

export default function ServicesScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string>('All');
  const [favorites, setFavorites] = useState<string[]>([]);

  const serviceTypes = ['All', ...new Set(mockPetServices.map(service => service.type))];
  
  const filteredServices = selectedType === 'All' 
    ? mockPetServices 
    : mockPetServices.filter(service => service.type === selectedType);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const toggleFavorite = (serviceId: string) => {
    setFavorites(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const renderServiceItem = ({ item }: { item: typeof mockPetServices[0] }) => (
    <View style={styles.serviceCard}>
      <Image source={{ uri: item.image }} style={styles.serviceImage} />
      
      <View style={styles.serviceContent}>
        <View style={styles.serviceHeader}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{item.name}</Text>
            <View style={styles.typeContainer}>
              <View style={[styles.typeBadge, { backgroundColor: serviceTypeColors[item.type] + '20' }]}>
                <Text style={[styles.typeText, { color: serviceTypeColors[item.type] }]}>
                  {item.type}
                </Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
            <Heart 
              size={20} 
              color="#FF6B6B" 
              fill={favorites.includes(item.id) ? "#FF6B6B" : "none"} 
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

        <View style={styles.detailsRow}>
          <View style={styles.ratingContainer}>
            <Star size={14} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.rating}>{item.rating}</Text>
          </View>
          
          <View style={styles.locationContainer}>
            <MapPin size={14} color="#666" />
            <Text style={styles.distance}>{item.distance}</Text>
          </View>
          
          <View style={styles.hoursContainer}>
            <Clock size={14} color="#666" />
            <Text style={styles.hours}>{item.hours}</Text>
          </View>
        </View>

        <View style={styles.specialtiesContainer}>
          {item.specialties.slice(0, 3).map((specialty, index) => (
            <View key={index} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.callButton} 
            onPress={() => handleCall(item.phone)}
          >
            <Phone size={16} color="white" />
            <Text style={styles.callButtonText}>Call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.detailsButton}>
            <ExternalLink size={16} color="#FF6B6B" />
            <Text style={styles.detailsButtonText}>Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pet Services</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          data={serviceTypes}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedType === item && styles.activeFilterButton
              ]}
              onPress={() => setSelectedType(item)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedType === item && styles.activeFilterButtonText
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filteredServices}
        renderItem={renderServiceItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MapPin size={48} color="#CCC" />
            <Text style={styles.emptyTitle}>No services found</Text>
            <Text style={styles.emptyMessage}>
              Try selecting a different service type
            </Text>
          </View>
        }
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterList: {
    paddingHorizontal: 16,
  },
  filterButton: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  activeFilterButton: {
    backgroundColor: '#FF6B6B',
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#666',
  },
  activeFilterButtonText: {
    color: 'white',
  },
  listContainer: {
    padding: 16,
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  serviceImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  serviceContent: {
    padding: 16,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  typeContainer: {
    flexDirection: 'row',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
  },
  description: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  rating: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    color: '#333',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  distance: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    marginLeft: 4,
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  hours: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    marginLeft: 4,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  specialtyTag: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  specialtyText: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    borderRadius: 8,
  },
  callButtonText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: 'white',
    marginLeft: 6,
  },
  detailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  detailsButtonText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#FF6B6B',
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    textAlign: 'center',
  },
});
