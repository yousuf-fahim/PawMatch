'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@supabase/supabase-js'
import { 
  ArrowLeft, 
  Save,
  Eye,
  Upload,
  X,
  Plus,
  Trash2
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
  featured_image?: string | File
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  read_time: number
  featured: boolean
  published: boolean
  new_image?: File
}

export default function EditArticlePage({ params }: { params: { id: string } }) {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
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
    featured_image: '',
    tags: [],
    difficulty: 'beginner',
    read_time: 5,
    featured: false,
    published: false
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('id', params.id)
          .single();
        
        if (error) throw error;
        if (!data) throw new Error('Article not found');
        
        setFormData({
          title: data.title,
          content: data.content,
          excerpt: data.excerpt,
          category: data.category,
          author: data.author,
          featured_image: data.featured_image,
          tags: data.tags || [],
          difficulty: data.difficulty,
          read_time: data.read_time,
          featured: data.featured,
          published: data.published
        });

        if (data.featured_image) {
          setImagePreview(data.featured_image);
        }
      } catch (error: any) {
        console.error('Error fetching article:', error);
        setErrors({ submit: error.message || 'Failed to load article data' });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (params.id) {
      fetchArticle();
    }
  }, [params.id, user?.email]);

  // Redirect if not admin
  if (!isAdmin) {
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
        new_image: file
      }))
      
      // Create preview URL
      const url = URL.createObjectURL(file)
      setImagePreview(url)
    }
  }

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      featured_image: '',
      new_image: undefined
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
    if (!formData.new_image) return formData.featured_image as string || null
    
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
      const fileName = `articles/${Date.now()}-${Math.random()}.${formData.new_image.name.split('.').pop()}`
      
      const { data, error } = await supabase.storage
        .from('article-images')
        .upload(fileName, formData.new_image)

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
    setImageUploading(!!formData.new_image)

    try {
      // Upload featured image if exists
      let featuredImageUrl = formData.featured_image as string;
      
      if (formData.new_image) {
        featuredImageUrl = await uploadFeaturedImage() || '';
        setImageUploading(false)
      }

      // Update article record
      const { data, error } = await supabase
        .from('articles')
        .update({
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
          published: publishNow ? true : formData.published,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)
        .select()

      if (error) {
        throw error
      }

      // Success
      setSuccessMessage('Article updated successfully!')
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/content/articles?success=Article updated successfully')
      }, 2000)
      
    } catch (error: any) {
      console.error('Error updating article:', error)
      setErrors({ submit: error.message || 'Failed to update article. Please try again.' })
    } finally {
      setLoading(false)
      setImageUploading(false)
    }
  }

  const handleDelete = async () => {
    // Show confirmation dialog
    if (!window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      setErrors({});
      
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', params.id);
      
      if (error) throw error;
      
      setSuccessMessage('Article deleted successfully');
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/content/articles?success=Article deleted successfully');
        router.refresh();
      }, 1500);
      
    } catch (error: any) {
      console.error('Error deleting article:', error);
      setErrors({ submit: error.message || 'Failed to delete article' });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
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
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">Edit Article</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                  previewMode ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="prose prose-blue max-w-none">
              <h1>{formData.title}</h1>
              {imagePreview && (
                <img 
                  src={imagePreview} 
                  alt={formData.title}
                  className="w-full h-[300px] object-cover rounded-lg my-6"
                />
              )}
              <div dangerouslySetInnerHTML={{ __html: formData.content }}></div>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => handleSubmit(e, false)} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Article Information</h2>
              <p className="text-sm text-gray-500 mt-1">Basic details about the article</p>
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
                  placeholder="Enter a brief excerpt"
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
                  <div className="relative rounded-lg overflow-hidden border border-gray-200">
                    <img 
                      src={imagePreview} 
                      alt="Featured image preview" 
                      className="w-full h-[200px] object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-50"
                    >
                      <X className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                ) : (
                  <label className="block w-full cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">Click or drag to upload a featured image</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                    </div>
                    <input
                      type="file"
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content (HTML)
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  rows={10}
                  className={`w-full border ${errors.content ? 'border-red-300' : 'border-gray-300'} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono`}
                  placeholder="<p>Enter your HTML content here...</p>"
                ></textarea>
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                )}
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
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
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
              
              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty Level
                </label>
                <div className="flex gap-4 mt-2">
                  {difficultyLevels.map(level => (
                    <label key={level.value} className="flex items-center">
                      <input
                        type="radio"
                        checked={formData.difficulty === level.value}
                        onChange={() => handleInputChange('difficulty', level.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${level.color}`}>
                        {level.label}
                      </span>
                    </label>
                  ))}
                </div>
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
              </div>
              
              {/* Tags */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="bg-blue-600 text-white px-3 py-2 rounded-r-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Featured & Published */}
              <div className="flex items-center gap-6 md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Feature this article</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => handleInputChange('published', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Published</span>
                </label>
              </div>
            </div>
            
            {/* Actions */}
            <div className="p-6 flex flex-wrap justify-between gap-4">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Article
                  </>
                )}
              </button>
            
              <div className="flex gap-3">
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
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save & Publish
                </button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
