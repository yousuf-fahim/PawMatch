import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera, Save, Heart, MapPin, Calendar, Ruler, User, ChevronDown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function AddPetScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    gender: 'Male',
    size: 'Medium',
    location: 'Mirpur, Dhaka',
    description: '',
    personality: [] as string[],
    image: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800&h=1066',
    isForAdoption: false,
  });

  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);

  const genderOptions = ['Male', 'Female'];
  const sizeOptions = ['Small', 'Medium', 'Large'];
  
  const personalityOptions = [
    'Friendly', 'Energetic', 'Playful', 'Loyal', 'Gentle', 'Calm', 
    'Affectionate', 'Smart', 'Independent', 'Social', 'Curious', 
    'Protective', 'Active', 'Charming', 'Patient', 'Brave'
  ];

  const handleSave = () => {
    if (!formData.name || !formData.breed || !formData.age) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    Alert.alert(
      'Pet Added Successfully!',
      `${formData.name} has been added to your pets.`,
      [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]
    );
  };

  const handleImagePicker = () => {
    Alert.alert(
      'Add Photo',
      'Photo picker functionality will be implemented soon.',
      [{ text: 'OK' }]
    );
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePersonality = (trait: string) => {
    setFormData(prev => ({
      ...prev,
      personality: prev.personality.includes(trait)
        ? prev.personality.filter(p => p !== trait)
        : [...prev.personality, trait]
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Pet</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Pet Photo Section */}
        <View style={styles.photoSection}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: formData.image }} style={styles.petImage} />
            <TouchableOpacity style={styles.cameraButton} onPress={handleImagePicker}>
              <Camera size={20} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.photoLabel}>Add your pet's photo</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          {/* Pet Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Pet Name *</Text>
            <View style={styles.inputContainer}>
              <Heart size={20} color="#FF6B6B" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(text) => updateField('name', text)}
                placeholder="Enter your pet's name"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Breed */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Breed *</Text>
            <View style={styles.inputContainer}>
              <User size={20} color="#FF6B6B" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={formData.breed}
                onChangeText={(text) => updateField('breed', text)}
                placeholder="e.g., Golden Retriever, Persian Cat"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Age */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Age *</Text>
            <View style={styles.inputContainer}>
              <Calendar size={20} color="#FF6B6B" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={formData.age}
                onChangeText={(text) => updateField('age', text)}
                placeholder="e.g., 2 years, 6 months"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Gender */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Gender</Text>
            <TouchableOpacity 
              style={styles.pickerContainer}
              onPress={() => setShowGenderPicker(!showGenderPicker)}
            >
              <User size={20} color="#FF6B6B" style={styles.inputIcon} />
              <Text style={styles.pickerText}>{formData.gender}</Text>
              <ChevronDown size={20} color="#666" />
            </TouchableOpacity>
            {showGenderPicker && (
              <View style={styles.optionsContainer}>
                {genderOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.optionItem}
                    onPress={() => {
                      updateField('gender', option);
                      setShowGenderPicker(false);
                    }}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Size */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Size</Text>
            <TouchableOpacity 
              style={styles.pickerContainer}
              onPress={() => setShowSizePicker(!showSizePicker)}
            >
              <Ruler size={20} color="#FF6B6B" style={styles.inputIcon} />
              <Text style={styles.pickerText}>{formData.size}</Text>
              <ChevronDown size={20} color="#666" />
            </TouchableOpacity>
            {showSizePicker && (
              <View style={styles.optionsContainer}>
                {sizeOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.optionItem}
                    onPress={() => {
                      updateField('size', option);
                      setShowSizePicker(false);
                    }}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Location */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Location</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color="#FF6B6B" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={formData.location}
                onChangeText={(text) => updateField('location', text)}
                placeholder="Enter location"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Personality Traits */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Personality Traits</Text>
            <Text style={styles.fieldSubtitle}>Select traits that describe your pet</Text>
            <View style={styles.personalityGrid}>
              {personalityOptions.map((trait) => (
                <TouchableOpacity
                  key={trait}
                  style={[
                    styles.personalityTag,
                    formData.personality.includes(trait) && styles.personalityTagSelected
                  ]}
                  onPress={() => togglePersonality(trait)}
                >
                  <Text
                    style={[
                      styles.personalityText,
                      formData.personality.includes(trait) && styles.personalityTextSelected
                    ]}
                  >
                    {trait}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Description</Text>
            <View style={[styles.inputContainer, styles.descriptionContainer]}>
              <TextInput
                style={[styles.textInput, styles.descriptionInput]}
                value={formData.description}
                onChangeText={(text) => updateField('description', text)}
                placeholder="Tell us about your pet's personality, habits, and what makes them special..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Adoption Toggle */}
          <View style={styles.adoptionContainer}>
            <Text style={styles.fieldLabel}>Available for Adoption</Text>
            <TouchableOpacity
              style={[styles.toggleButton, formData.isForAdoption && styles.toggleButtonActive]}
              onPress={() => updateField('isForAdoption', !formData.isForAdoption)}
            >
              <View style={[styles.toggleCircle, formData.isForAdoption && styles.toggleCircleActive]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <LinearGradient
            colors={['#FF6B6B', '#FF8E8E']}
            style={styles.saveButton}
          >
            <TouchableOpacity style={styles.saveButtonInner} onPress={handleSave}>
              <Save size={20} color="white" />
              <Text style={styles.saveButtonText}>Add Pet</Text>
            </TouchableOpacity>
          </LinearGradient>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  petImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FF6B6B',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#FF6B6B',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  photoLabel: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666',
  },
  form: {
    paddingHorizontal: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  fieldSubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  descriptionContainer: {
    alignItems: 'flex-start',
    paddingVertical: 16,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pickerText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#333',
    marginLeft: 12,
  },
  optionsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#333',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#333',
  },
  descriptionInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  personalityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  personalityTag: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  personalityTagSelected: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderColor: '#FF6B6B',
  },
  personalityText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#666',
  },
  personalityTextSelected: {
    color: '#FF6B6B',
  },
  adoptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleButton: {
    width: 60,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    alignSelf: 'flex-start',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  saveButton: {
    borderRadius: 16,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
  },
});
