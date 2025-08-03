import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, FlatList, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Search, ArrowLeft, MapPin, Heart, Filter, X, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';

interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
  gender: 'male' | 'female';
  size: 'small' | 'medium' | 'large';
  color: string;
  personality: string[];
  description: string;
  images: string[];
  location: string;
  adoption_status: string;
  shelter_id?: string;
  shelters?: {
    name: string;
    city: string;
    state: string;
  };
}

interface FilterOptions {
  gender: string[];
  size: string[];
  age_range: string;
  personality: string[];
  location: string;
}

const PERSONALITY_TRAITS = [
  'Friendly', 'Playful', 'Calm', 'Energetic', 'Gentle', 'Independent',
  'Social', 'Loyal', 'Protective', 'Cuddly', 'Smart', 'Active'
];

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [pets, setPets] = useState<Pet[]>([]);
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [savedSearches, setSavedSearches] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<FilterOptions>({
    gender: [],
    size: [],
    age_range: 'all',
    personality: [],
    location: ''
  });

  useEffect(() => {
    fetchPets();
    loadSavedSearches();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filters, pets]);

  const fetchPets = async () => {
    try {
      setLoading(true);
      
      if (!supabase) {
        console.error('Supabase not initialized');
        return;
      }

      const { data, error } = await supabase
        .from('pets')
        .select(`
          id,
          name,
          breed,
          age,
          gender,
          size,
          color,
          personality,
          description,
          images,
          location,
          adoption_status
        `)
        .eq('adoption_status', 'available')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pets:', error);
        return;
      }

      setPets((data as Pet[]) || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedSearches = async () => {
    try {
      // You can implement saved searches in localStorage or user preferences
      // For now, we'll use mock data
      setSavedSearches(['Golden Retriever', 'Small dogs', 'Cats near me']);
    } catch (error) {
      console.error('Error loading saved searches:', error);
    }
  };

  const applyFilters = () => {
    let filtered = pets;

    // Apply text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(pet => 
        pet.name.toLowerCase().includes(query) ||
        pet.breed.toLowerCase().includes(query) ||
        pet.personality?.some(trait => trait.toLowerCase().includes(query)) ||
        pet.color?.toLowerCase().includes(query) ||
        pet.location?.toLowerCase().includes(query)
      );
    }

    // Apply gender filter
    if (filters.gender.length > 0) {
      filtered = filtered.filter(pet => filters.gender.includes(pet.gender));
    }

    // Apply size filter
    if (filters.size.length > 0) {
      filtered = filtered.filter(pet => filters.size.includes(pet.size));
    }

    // Apply age range filter
    if (filters.age_range !== 'all') {
      filtered = filtered.filter(pet => {
        switch (filters.age_range) {
          case 'young': return pet.age <= 2;
          case 'adult': return pet.age > 2 && pet.age <= 7;
          case 'senior': return pet.age > 7;
          default: return true;
        }
      });
    }

    // Apply personality filter
    if (filters.personality.length > 0) {
      filtered = filtered.filter(pet => 
        pet.personality?.some(trait => filters.personality.includes(trait))
      );
    }

    // Apply location filter
    if (filters.location.trim()) {
      const location = filters.location.toLowerCase();
      filtered = filtered.filter(pet =>
        pet.location?.toLowerCase().includes(location)
      );
    }

    setFilteredPets(filtered);
  };

  const handleBack = () => {
    router.back();
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleFilterToggle = (filterType: keyof FilterOptions, value: string) => {
    setFilters(prev => {
      if (filterType === 'age_range' || filterType === 'location') {
        return { ...prev, [filterType]: value };
      }
      
      const currentValues = prev[filterType] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return { ...prev, [filterType]: newValues };
    });
  };

  const clearFilters = () => {
    setFilters({
      gender: [],
      size: [],
      age_range: 'all',
      personality: [],
      location: ''
    });
  };

  const saveSearch = () => {
    if (searchQuery.trim() && !savedSearches.includes(searchQuery)) {
      setSavedSearches(prev => [searchQuery, ...prev].slice(0, 5));
    }
  };

  const handlePetPress = (petId: string) => {
    router.push({
      pathname: '/pet-details/[id]' as any,
      params: { id: petId }
    });
  };

  const getActiveFilterCount = () => {
    return filters.gender.length + 
           filters.size.length + 
           filters.personality.length + 
           (filters.age_range !== 'all' ? 1 : 0) +
           (filters.location.trim() ? 1 : 0);
  };

  const renderPetItem = ({ item }: { item: Pet }) => (
    <TouchableOpacity style={styles.petCard} onPress={() => handlePetPress(item.id)}>
      <Image 
        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }} 
        style={styles.petImage} 
      />
      <View style={styles.petInfo}>
        <Text style={styles.petName}>{item.name}</Text>
        <Text style={styles.petBreed}>{item.breed} • {item.age} years old</Text>
        <View style={styles.petMeta}>
          <MapPin size={14} color="#666" />
          <Text style={styles.petLocation}>
            {item.location || 'Location not specified'}
          </Text>
        </View>
        <View style={styles.personalityTags}>
          {item.personality?.slice(0, 2).map((trait, index) => (
            <View key={index} style={styles.personalityTag}>
              <Text style={styles.personalityText}>{trait}</Text>
            </View>
          ))}
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
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, breed, or traits..."
            value={searchQuery}
            onChangeText={handleSearch}
            onSubmitEditing={saveSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Button */}
        <TouchableOpacity 
          style={[styles.filterButton, getActiveFilterCount() > 0 && styles.filterButtonActive]} 
          onPress={() => setShowFilters(true)}
        >
          <Filter size={20} color={getActiveFilterCount() > 0 ? "white" : "#666"} />
          {getActiveFilterCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Saved Searches */}
      {searchQuery === '' && savedSearches.length > 0 && (
        <View style={styles.savedSearches}>
          <Text style={styles.savedSearchesTitle}>Recent Searches</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {savedSearches.map((search, index) => (
              <TouchableOpacity
                key={index}
                style={styles.savedSearchTag}
                onPress={() => setSearchQuery(search)}
              >
                <Text style={styles.savedSearchText}>{search}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Results */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>
          {searchQuery ? `Results for "${searchQuery}"` : 'All Pets'} ({filteredPets.length})
        </Text>
        <FlatList
          data={filteredPets}
          renderItem={renderPetItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={fetchPets}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Search size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>
                {loading ? 'Searching...' : 'No pets found'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {loading 
                  ? 'Loading available pets...' 
                  : searchQuery 
                    ? 'Try adjusting your search or filters' 
                    : 'Check back later for new pets'
                }
              </Text>
            </View>
          }
        />
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <X size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={clearFilters}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Gender Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Gender</Text>
              <View style={styles.filterOptions}>
                {['male', 'female'].map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.filterOption,
                      filters.gender.includes(gender) && styles.filterOptionActive
                    ]}
                    onPress={() => handleFilterToggle('gender', gender)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.gender.includes(gender) && styles.filterOptionTextActive
                    ]}>
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </Text>
                    {filters.gender.includes(gender) && (
                      <Check size={16} color="white" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Size Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Size</Text>
              <View style={styles.filterOptions}>
                {['small', 'medium', 'large'].map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.filterOption,
                      filters.size.includes(size) && styles.filterOptionActive
                    ]}
                    onPress={() => handleFilterToggle('size', size)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.size.includes(size) && styles.filterOptionTextActive
                    ]}>
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </Text>
                    {filters.size.includes(size) && (
                      <Check size={16} color="white" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Age Range Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Age Range</Text>
              <View style={styles.filterOptions}>
                {[
                  { key: 'all', label: 'All Ages' },
                  { key: 'young', label: 'Young (0-2 years)' },
                  { key: 'adult', label: 'Adult (3-7 years)' },
                  { key: 'senior', label: 'Senior (8+ years)' }
                ].map((age) => (
                  <TouchableOpacity
                    key={age.key}
                    style={[
                      styles.filterOption,
                      filters.age_range === age.key && styles.filterOptionActive
                    ]}
                    onPress={() => handleFilterToggle('age_range', age.key)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.age_range === age.key && styles.filterOptionTextActive
                    ]}>
                      {age.label}
                    </Text>
                    {filters.age_range === age.key && (
                      <Check size={16} color="white" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Personality Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Personality</Text>
              <View style={styles.filterOptions}>
                {PERSONALITY_TRAITS.map((trait) => (
                  <TouchableOpacity
                    key={trait}
                    style={[
                      styles.filterOption,
                      filters.personality.includes(trait) && styles.filterOptionActive
                    ]}
                    onPress={() => handleFilterToggle('personality', trait)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.personality.includes(trait) && styles.filterOptionTextActive
                    ]}>
                      {trait}
                    </Text>
                    {filters.personality.includes(trait) && (
                      <Check size={16} color="white" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Location Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Location</Text>
              <TextInput
                style={styles.locationInput}
                placeholder="Enter city or state"
                value={filters.location}
                onChangeText={(text) => handleFilterToggle('location', text)}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>
                Apply Filters ({filteredPets.length} results)
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#333',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Nunito-Bold',
  },
  savedSearches: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  savedSearchesTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  savedSearchTag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  savedSearchText: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666',
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
  petCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  petBreed: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    marginBottom: 8,
  },
  petMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  petLocation: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    marginLeft: 6,
  },
  personalityTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  personalityTag: {
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  personalityText: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#FF6B6B',
  },
  heartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#999',
    textAlign: 'center',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  clearText: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#FF6B6B',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filterSection: {
    marginTop: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    gap: 8,
  },
  filterOptionActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  filterOptionText: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666',
  },
  filterOptionTextActive: {
    color: 'white',
  },
  locationInput: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#333',
  },
  modalFooter: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  applyButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
  },
});
