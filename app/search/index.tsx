import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Search, ArrowLeft, MapPin, Heart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { mockPets } from '@/data/pets';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(mockPets);

  const handleBack = () => {
    router.back();
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    if (text.trim() === '') {
      setSearchResults(mockPets);
      return;
    }

    // Apply search query
    const filtered = mockPets.filter(pet => 
      pet.name.toLowerCase().includes(text.toLowerCase()) ||
      pet.breed.toLowerCase().includes(text.toLowerCase()) ||
      pet.personality.some(trait => trait.toLowerCase().includes(text.toLowerCase()))
    );

    setSearchResults(filtered);
  };

  const handlePetPress = (petId: string) => {
    router.push({
      pathname: '/pet-details/[id]' as any,
      params: { id: petId }
    });
  };

  const renderPetItem = ({ item }: { item: typeof mockPets[0] }) => (
    <TouchableOpacity style={styles.petCard} onPress={() => handlePetPress(item.id)}>
      <Image source={{ uri: Array.isArray(item.image) ? item.image[0] : item.image }} style={styles.petImage} />
      <View style={styles.petInfo}>
        <Text style={styles.petName}>{item.name}</Text>
        <Text style={styles.petBreed}>{item.breed}</Text>
        <View style={styles.petMeta}>
          <MapPin size={14} color="#666" />
          <Text style={styles.petDistance}>{item.location}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.heartButton}>
        <Heart size={20} color="#FF6B6B" />
      </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Search Pets</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, breed, personality..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* Results */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>
          {searchQuery ? `Results for "${searchQuery}"` : 'All Pets'} ({searchResults.length})
        </Text>
        
        <FlatList
          data={searchResults}
          renderItem={renderPetItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          numColumns={2}
          columnWrapperStyle={styles.row}
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#333',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  petCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: '48%',
  },
  petImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 2,
  },
  petBreed: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    marginBottom: 4,
  },
  petMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  petDistance: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    marginLeft: 4,
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    backgroundColor: 'white',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});