'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@supabase/supabase-js'
import { 
  ArrowLeft, 
  Save,
  Eye,
  Upload,
  X,
  Plus
} from 'lucide-react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const categories = [
  'Basic Pet Care',
  'Pet Training', 
  'Health & Wellness',
  'Breed Guides',
  'Pet Services',
  'Emergency Care'
]

const difficultyLevels = [
  { value: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-800' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'advanced', label: 'Advanced', color: 'bg-red-100 text-red-800' }
]

interface ArticleFormData {
  title: string
  content: string
  excerpt: string
  category: string
  author: string
  featured_image?: File
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  read_time: number
  featured: boolean
  published: boolean
}

export default function AddArticlePage() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [newTag, setNewTag] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    content: '',
    excerpt: '',
    category: categories[0],
    author: user?.email || '',
    tags: [],
    difficulty: 'beginner',
    read_time: 5,
    featured: false,
    published: false
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect if not admin (only after auth is loaded)
  if (!authLoading && !isAdmin) {
    router.push('/login')
    return null
  }

  const handleInputChange = (field: keyof ArticleFormData, value: any) => {
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        featured_image: file
      }))
      
      // Create preview URL
      const url = URL.createObjectURL(file)
      setImagePreview(url)
    }
  }

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      featured_image: undefined
    }))
    setImagePreview('')
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.content.trim()) newErrors.content = 'Content is required'
    if (!formData.excerpt.trim()) newErrors.excerpt = 'Excerpt is required'
    if (!formData.author.trim()) newErrors.author = 'Author is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const uploadFeaturedImage = async (): Promise<string | null> => {
    if (!formData.featured_image) return null
    
    try {
      // First, check if the bucket exists and create it if not
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'article-images');
      
      if (!bucketExists) {
        // Create the bucket
        const { error: createBucketError } = await supabase.storage.createBucket('article-images', {
          public: true,
          fileSizeLimit: 5242880 // 5MB
        });
        
        if (createBucketError) {
          console.error('Error creating bucket:', createBucketError);
          throw new Error('Failed to create storage bucket');
        }
      }
      
      // Now proceed with upload
      const fileName = `articles/${Date.now()}-${Math.random()}.${formData.featured_image.name.split('.').pop()}`
      
      const { data, error } = await supabase.storage
        .from('article-images')
        .upload(fileName, formData.featured_image)

      if (error) {
        console.error('Error uploading image:', error)
        throw new Error('Failed to upload featured image: ' + error.message)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Error in image upload process:', error);
      throw error;
    }
  }

  const handleSubmit = async (e: React.FormEvent, publishNow = false) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setImageUploading(!!formData.featured_image)

    try {
      // Upload featured image if exists
      let featuredImageUrl = null
      if (formData.featured_image) {
        featuredImageUrl = await uploadFeaturedImage()
        setImageUploading(false)
      }

      // Create article record
      const { data, error } = await supabase
        .from('learning_articles')
        .insert({
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          category: formData.category,
          author: formData.author,
          featured_image: featuredImageUrl,
          tags: formData.tags,
          difficulty: formData.difficulty,
          read_time: formData.read_time,
          featured: formData.featured,
          published: publishNow || formData.published,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          view_count: 0
        })
        .select()

      if (error) {
        throw error
      }

      // Success
      const message = publishNow ? 'Article published successfully' : 'Article saved successfully'
      setSuccessMessage(message)
      
      // Reset form or redirect after 2 seconds
      setTimeout(() => {
        router.push(`/content/articles?success=${encodeURIComponent(message)}`)
      }, 2000)
      
    } catch (error: any) {
      console.error('Error creating article:', error)
      setErrors({ submit: error.message || 'Failed to create article. Please try again.' })
    } finally {
      setLoading(false)
      setImageUploading(false)
    }
  }

  const estimateReadTime = (content: string): number => {
    const wordsPerMinute = 200
    const words = content.trim().split(/\s+/).length
    return Math.ceil(words / wordsPerMinute) || 1
  }

  // Auto-update read time when content changes
  const handleContentChange = (content: string) => {
    handleInputChange('content', content)
    const readTime = estimateReadTime(content)
    handleInputChange('read_time', readTime)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/content/articles')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Articles</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Article</h1>
                <p className="text-sm text-gray-500">Create educational content for pet owners</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-4 py-2 flex items-center gap-2 rounded-lg ${
                  previewMode 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } transition-colors`}
              >
                <Eye className="w-4 h-4" />
                {previewMode ? 'Exit Preview' : 'Preview'}
              </button>
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

        {previewMode ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 markdown-preview">
            {formData.featured_image && (
              <div className="mb-6">
                <img 
                  src={imagePreview} 
                  alt={formData.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{formData.title}</h1>
            <div className="flex items-center gap-3 mb-6 text-sm">
              <span className="text-gray-600">By {formData.author}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{formData.read_time} min read</span>
              <span className="text-gray-400">•</span>
              <span className={`px-2 py-0.5 rounded-full ${
                difficultyLevels.find(d => d.value === formData.difficulty)?.color
              }`}>
                {difficultyLevels.find(d => d.value === formData.difficulty)?.label}
              </span>
            </div>
            <div className="prose max-w-none">
              {formData.content.split('\n').map((paragraph, index) => (
                paragraph.trim() ? <p key={index}>{paragraph}</p> : <br key={index} />
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span key={tag} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => handleSubmit(e)} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Article Details</h2>
              <p className="text-sm text-gray-500 mt-1">Basic information about your article</p>
            </div>
            
            <div className="p-6 space-y-6 border-b border-gray-200">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full border ${errors.title ? 'border-red-300' : 'border-gray-300'} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter article title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>
              
              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Excerpt
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  rows={2}
                  className={`w-full border ${errors.excerpt ? 'border-red-300' : 'border-gray-300'} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Brief summary of the article (shown in listings)"
                ></textarea>
                {errors.excerpt && (
                  <p className="mt-1 text-sm text-red-600">{errors.excerpt}</p>
                )}
              </div>
              
              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Featured Image
                </label>
                
                {imagePreview ? (
                  <div className="relative rounded-lg overflow-hidden h-48 mb-3">
                    <img 
                      src={imagePreview} 
                      alt="Featured preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-red-100"
                    >
                      <X className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500 mb-1">Click to upload an image</span>
                    <span className="text-xs text-gray-400">PNG, JPG, GIF up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  rows={15}
                  className={`w-full border ${errors.content ? 'border-red-300' : 'border-gray-300'} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono`}
                  placeholder="Enter article content (markdown supported)"
                ></textarea>
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Article text supports Markdown formatting
                </p>
              </div>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-200">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty Level
                </label>
                <div className="flex gap-3 mt-2">
                  {difficultyLevels.map(level => (
                    <label key={level.value} className="flex items-center">
                      <input
                        type="radio"
                        checked={formData.difficulty === level.value}
                        onChange={() => handleInputChange('difficulty', level.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${level.color}`}>
                        {level.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Author */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Author
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => handleInputChange('author', e.target.value)}
                  className={`w-full border ${errors.author ? 'border-red-300' : 'border-gray-300'} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Author name"
                />
                {errors.author && (
                  <p className="mt-1 text-sm text-red-600">{errors.author}</p>
                )}
              </div>
              
              {/* Read Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Read Time (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={formData.read_time}
                  onChange={(e) => handleInputChange('read_time', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Auto-calculated based on content length
                </p>
              </div>
              
              {/* Featured Toggle */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Feature this article</span>
                </label>
                <p className="mt-1 text-xs text-gray-500 ml-6">
                  Featured articles appear prominently in the app
                </p>
              </div>
              
              {/* Published Toggle */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => handleInputChange('published', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Publish immediately</span>
                </label>
                <p className="mt-1 text-xs text-gray-500 ml-6">
                  When unchecked, the article will be saved as a draft
                </p>
              </div>
            </div>
            
            {/* Tags */}
            <div className="p-6 border-b border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.tags.map(tag => (
                  <div key={tag} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                {formData.tags.length === 0 && (
                  <span className="text-sm text-gray-500">No tags added yet</span>
                )}
              </div>
              
              <div className="flex">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-r-lg flex items-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Press Enter or click the + button to add a tag
              </p>
            </div>
            
            {/* Submit */}
            <div className="p-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push('/content/articles')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
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
                    {imageUploading ? 'Uploading Image...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save as Draft
                  </>
                )}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={(e) => handleSubmit(e as any, true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Publish Now
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
