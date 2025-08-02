import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X, ChevronDown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface Filters {
  breed: string;
  age: string;
  size: string;
  distance: string;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: Filters) => void;
  currentFilters: Filters;
}

const breedOptions = ['All Breeds', 'Golden Retriever', 'Labrador', 'German Shepherd', 'Husky', 'Poodle', 'Bulldog', 'Beagle', 'Tabby Cat', 'Persian Cat', 'Siamese Cat', 'Maine Coon'];
const ageOptions = ['All Ages', 'Puppy (0-1 year)', 'Young (1-3 years)', 'Adult (3-7 years)', 'Senior (7+ years)'];
const sizeOptions = ['All Sizes', 'Small', 'Medium', 'Large'];
const distanceOptions = ['Any Distance', '5 km', '10 km', '25 km', '50 km'];

export default function FilterModal({ visible, onClose, onApplyFilters, currentFilters }: FilterModalProps) {
  const [filters, setFilters] = useState<Filters>(currentFilters);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: Filters = {
      breed: 'All Breeds',
      age: 'All Ages',
      size: 'All Sizes',
      distance: 'Any Distance'
    };
    setFilters(resetFilters);
  };

  const renderFilterDropdown = (
    label: string,
    value: string,
    options: string[],
    filterKey: keyof Filters
  ) => {
    const isActive = activeDropdown === filterKey;
    
    return (
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>{label}</Text>
        <TouchableOpacity
          style={[styles.dropdown, isActive && styles.dropdownActive]}
          onPress={() => setActiveDropdown(isActive ? null : filterKey)}
        >
          <Text style={styles.dropdownText}>{value}</Text>
          <ChevronDown 
            size={20} 
            color="#666" 
            style={[styles.chevron, isActive && styles.chevronActive]} 
          />
        </TouchableOpacity>
        
        {isActive && (
          <View style={styles.dropdownOptions}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.option,
                  option === value && styles.optionSelected
                ]}
                onPress={() => {
                  setFilters(prev => ({ ...prev, [filterKey]: option }));
                  setActiveDropdown(null);
                }}
              >
                <Text style={[
                  styles.optionText,
                  option === value && styles.optionTextSelected
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Filter Pets</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {renderFilterDropdown('Breed', filters.breed, breedOptions, 'breed')}
            {renderFilterDropdown('Age', filters.age, ageOptions, 'age')}
            {renderFilterDropdown('Size', filters.size, sizeOptions, 'size')}
            {renderFilterDropdown('Distance', filters.distance, distanceOptions, 'distance')}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
              <LinearGradient
                colors={['#FF6B6B', '#FF8E8E']}
                style={styles.applyButtonGradient}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dropdownActive: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#333',
  },
  chevron: {
    transform: [{ rotate: '0deg' }],
  },
  chevronActive: {
    transform: [{ rotate: '180deg' }],
  },
  dropdownOptions: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  option: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionSelected: {
    backgroundColor: '#FFF5F5',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#333',
  },
  optionTextSelected: {
    color: '#FF6B6B',
    fontFamily: 'Nunito-SemiBold',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#666',
  },
  applyButton: {
    flex: 2,
  },
  applyButtonGradient: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
  },
});
