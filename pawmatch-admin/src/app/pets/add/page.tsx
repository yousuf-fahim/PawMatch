'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@supabase/supabase-js'
import { 
  ArrowLeft, 
  Upload, 
  X,
  Plus,
  Save,
  Camera
} from 'lucide-react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface PetFormData {
  name: string
  breed: string
  age: number
  gender: 'male' | 'female'
  size: 'small' | 'medium' | 'large'
  color: string
  location: string
  description: string
  personality: string[]
  health_status: string
  adoption_fee: number
  images: File[]
  species: string
}

const personalityOptions = [
  'Friendly', 'Energetic', 'Calm', 'Playful', 'Gentle', 'Loyal',
  'Independent', 'Affectionate', 'Protective', 'Social', 'Quiet', 'Active'
]

export default function AddPetPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [formData, setFormData] = useState<PetFormData>({
    name: '',
    breed: '',
    age: 1,
    gender: 'male',
    size: 'medium',
    color: '',
    location: '',
    description: '',
    personality: [],
    health_status: 'healthy',
    adoption_fee: 0,
    images: [],
    species: 'Dog'
  })
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleInputChange = (field: keyof PetFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handlePersonalityToggle = (trait: string) => {
    setFormData(prev => ({
      ...prev,
      personality: prev.personality.includes(trait)
        ? prev.personality.filter(p => p !== trait)
        : [...prev.personality, trait]
    }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...files].slice(0, 6) // Max 6 images
      }))

      // Create preview URLs
      files.forEach(file => {
        const url = URL.createObjectURL(file)
        setImagePreviewUrls(prev => [...prev, url])
      })
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Pet name is required'
    if (!formData.breed.trim()) newErrors.breed = 'Breed is required'
    if (!formData.species.trim()) newErrors.species = 'Species is required'
    if (!formData.location.trim()) newErrors.location = 'Location is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (formData.personality.length === 0) newErrors.personality = 'Select at least one personality trait'
    if (formData.images.length === 0) newErrors.images = 'At least one image is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = []
    
    try {
      // First, check if the bucket exists and create it if not
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'pet-images');
      
      if (!bucketExists) {
        // Create the bucket
        const { error: createBucketError } = await supabase.storage.createBucket('pet-images', {
          public: true,
          fileSizeLimit: 5242880 // 5MB
        });
        
        if (createBucketError) {
          console.error('Error creating bucket:', createBucketError);
          throw new Error('Failed to create storage bucket');
        }
      }
      
      // Now proceed with uploads
      for (const image of formData.images) {
        const fileName = `pets/${Date.now()}-${Math.random()}.${image.name.split('.').pop()}`
        
        const { data, error } = await supabase.storage
          .from('pet-images')
          .upload(fileName, image)

        if (error) {
          console.error('Error uploading image:', error)
          throw new Error('Failed to upload images: ' + error.message)
        }

        const { data: { publicUrl } } = supabase.storage
          .from('pet-images')
          .getPublicUrl(fileName)

        uploadedUrls.push(publicUrl)
      }
    } catch (error) {
      console.error('Error in image upload process:', error);
      throw error;
    }
    
    return uploadedUrls;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setImageUploading(true)

    try {
      // Upload images first
      const imageUrls = await uploadImages()
      setImageUploading(false)

      // Create pet record
      const { data, error } = await supabase
        .from('pets')
        .insert({
          name: formData.name,
          breed: formData.breed,
          species: formData.species,
          age: formData.age,
          gender: formData.gender,
          size: formData.size,
          color: formData.color,
          location: formData.location,
          description: formData.description,
          personality: formData.personality,
          health_status: formData.health_status,
          adoption_fee: formData.adoption_fee,
          images: imageUrls,
          status: 'available',
          created_at: new Date().toISOString()
        })
        .select()

      if (error) {
        throw error
      }

      // Success
      setSuccessMessage('Pet added successfully!')
      
      // Reset form
      setFormData({
        name: '',
        breed: '',
        age: 1,
        gender: 'male',
        size: 'medium',
        color: '',
        location: '',
        description: '',
        personality: [],
        health_status: 'healthy',
        adoption_fee: 0,
        images: [],
        species: 'Dog'
      })
      setImagePreviewUrls([])
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/pets?success=Pet added successfully')
      }, 2000)
      
    } catch (error: any) {
      console.error('Error creating pet:', error)
      setErrors({ submit: error.message || 'Failed to create pet. Please try again.' })
    } finally {
      setLoading(false)
      setImageUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/pets')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Pets</span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Add New Pet</h1>
                  <p className="text-sm text-gray-500">Create a new pet listing for adoption</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form Errors */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {errors.submit}
          </div>
        )}
        
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Pet Information</h2>
            <p className="text-sm text-gray-500 mt-1">Basic details about the pet</p>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-200">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pet Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter pet name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Species
              </label>
              <select
                value={formData.species}
                onChange={(e) => handleInputChange('species', e.target.value)}
                className={`w-full border ${errors.species ? 'border-red-300' : 'border-gray-300'} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
                <option value="Small Mammal">Small Mammal</option>
                <option value="Fish">Fish</option>
                <option value="Reptile">Reptile</option>
                <option value="Other">Other</option>
              </select>
              {errors.species && (
                <p className="mt-1 text-sm text-red-600">{errors.species}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Breed
              </label>
              <input
                type="text"
                value={formData.breed}
                onChange={(e) => handleInputChange('breed', e.target.value)}
                className={`w-full border ${errors.breed ? 'border-red-300' : 'border-gray-300'} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter breed"
              />
              {errors.breed && (
                <p className="mt-1 text-sm text-red-600">{errors.breed}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age (years)
              </label>
              <input
                type="number"
                min="0"
                max="30"
                step="0.1"
                value={formData.age}
                onChange={(e) => handleInputChange('age', parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.gender === 'male'}
                    onChange={() => handleInputChange('gender', 'male')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Male</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.gender === 'female'}
                    onChange={() => handleInputChange('gender', 'female')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Female</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size
              </label>
              <select
                value={formData.size}
                onChange={(e) => handleInputChange('size', e.target.value as any)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter color(s)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className={`w-full border ${errors.location ? 'border-red-300' : 'border-gray-300'} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="City, State"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Health Status
              </label>
              <select
                value={formData.health_status}
                onChange={(e) => handleInputChange('health_status', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="healthy">Healthy</option>
                <option value="minor_issues">Minor Health Issues</option>
                <option value="special_needs">Special Needs</option>
                <option value="senior">Senior Care</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adoption Fee ($)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.adoption_fee}
                onChange={(e) => handleInputChange('adoption_fee', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Personality Traits */}
          <div className="p-6 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Personality Traits
            </label>
            {errors.personality && (
              <p className="mb-3 text-sm text-red-600">{errors.personality}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {personalityOptions.map((trait) => (
                <button
                  key={trait}
                  type="button"
                  onClick={() => handlePersonalityToggle(trait)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    formData.personality.includes(trait)
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-gray-100 text-gray-800 border-gray-200'
                  } border transition-colors`}
                >
                  {trait}
                </button>
              ))}
            </div>
          </div>
          
          {/* Description */}
          <div className="p-6 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className={`w-full border ${errors.description ? 'border-red-300' : 'border-gray-300'} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Describe the pet's story, characteristics, and any special needs"
            ></textarea>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>
          
          {/* Image Upload */}
          <div className="p-6 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Pet Photos
            </label>
            {errors.images && (
              <p className="mb-3 text-sm text-red-600">{errors.images}</p>
            )}
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
              {/* Image Previews */}
              {imagePreviewUrls.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img 
                    src={url} 
                    alt={`Pet preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-red-100"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}
              
              {/* Add Image Button */}
              {formData.images.length < 6 && (
                <label className="cursor-pointer aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
                  <Upload className="w-6 h-6 text-gray-400 mb-2" />
                  <span className="text-xs text-gray-500">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            
            <p className="text-xs text-gray-500">
              Upload up to 6 photos. First photo will be used as the main image.
            </p>
          </div>
          
          {/* Submit */}
          <div className="p-6 flex justify-end">
            <button
              type="button"
              onClick={() => router.push('/pets')}
              className="mr-3 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  {imageUploading ? 'Uploading Images...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Pet
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
