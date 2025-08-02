import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';

export default function FilterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get current filter values from params
  const [selectedPetType, setSelectedPetType] = useState<string>(params.petType as string || '');
  const [selectedAge, setSelectedAge] = useState<string>(params.age as string || '');
  const [pottyTrained, setPottyTrained] = useState<string>(params.pottyTrained as string || '');

  // Filter options
  const petTypes = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Fish'];
  const ageGroups = ['Puppy/Kitten', 'Young', 'Adult', 'Senior'];
  const pottyOptions = ['Potty Trained', 'Not Potty Trained'];

  const handleBack = () => {
    router.back();
  };

  const clearFilters = () => {
    setSelectedPetType('');
    setSelectedAge('');
    setPottyTrained('');
  };

  const applyFilters = () => {
    // Navigate back to search with filter parameters
    router.push({
      pathname: '/search',
      params: {
        petType: selectedPetType,
        age: selectedAge,
        pottyTrained: pottyTrained,
        query: params.query || '',
      }
    });
  };

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
        <Text style={styles.headerTitle}>Filter Pets</Text>
        <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Pet Type Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Pet Type</Text>
          <View style={styles.optionGrid}>
            {petTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionButton,
                  selectedPetType === type && styles.selectedOption
                ]}
                onPress={() => setSelectedPetType(selectedPetType === type ? '' : type)}
              >
                <Text style={[
                  styles.optionText,
                  selectedPetType === type && styles.selectedOptionText
                ]}>
                  {type}
                </Text>
                {selectedPetType === type && (
                  <Check size={16} color="white" style={styles.checkIcon} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Age Group Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Age Group</Text>
          <View style={styles.optionGrid}>
            {ageGroups.map((age) => (
              <TouchableOpacity
                key={age}
                style={[
                  styles.optionButton,
                  selectedAge === age && styles.selectedOption
                ]}
                onPress={() => setSelectedAge(selectedAge === age ? '' : age)}
              >
                <Text style={[
                  styles.optionText,
                  selectedAge === age && styles.selectedOptionText
                ]}>
                  {age}
                </Text>
                {selectedAge === age && (
                  <Check size={16} color="white" style={styles.checkIcon} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Potty Training Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Potty Training</Text>
          <View style={styles.optionGrid}>
            {pottyOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  pottyTrained === option && styles.selectedOption
                ]}
                onPress={() => setPottyTrained(pottyTrained === option ? '' : option)}
              >
                <Text style={[
                  styles.optionText,
                  pottyTrained === option && styles.selectedOptionText
                ]}>
                  {option}
                </Text>
                {pottyTrained === option && (
                  <Check size={16} color="white" style={styles.checkIcon} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Apply Button */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
          <Text style={styles.applyButtonText}>
            Apply Filters {(selectedPetType || selectedAge || pottyTrained) && `(${[selectedPetType, selectedAge, pottyTrained].filter(Boolean).length})`}
          </Text>
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
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  clearButtonText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  filterSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    backgroundColor: 'white',
    minWidth: 100,
  },
  selectedOption: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#666',
    flex: 1,
  },
  selectedOptionText: {
    color: 'white',
  },
  checkIcon: {
    marginLeft: 8,
  },
  bottomActions: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  applyButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
  },
});
