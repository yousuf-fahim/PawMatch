import { createClient } from '@supabase/supabase-js'
import * as AuthSession from 'expo-auth-session'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

// Helper function to get the appropriate redirect URI
const getRedirectUri = () => {
  if (__DEV__) {
    // Development environment - use Expo development URL
    return AuthSession.makeRedirectUri({})
  } else {
    // Production environment - use app scheme
    return AuthSession.makeRedirectUri({ 
      scheme: 'pawmatch',
      path: 'auth/callback'
    })
  }
}

// Debug logging for redirect URIs (only in development)
if (__DEV__ && process.env.EXPO_PUBLIC_DEBUG_AUTH === 'true') {
  console.log('\n📋 [Google Console] Add these Redirect URIs:');
  console.log('- Development (Expo Go):', AuthSession.makeRedirectUri({}));
  console.log('- Alternative Dev:', 'https://auth.expo.io/@yousuf_fahim/pawmatch');
  console.log('- Production (EAS Build):', AuthSession.makeRedirectUri({ scheme: 'pawmatch', path: 'auth/callback' }));
  console.log('- Alternative Production:', 'pawmatch://auth/callback');
}

// Check if environment variables are configured and create client
let supabaseClient: ReturnType<typeof createClient> | null = null

if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl.includes('your_supabase_url_here') || 
    supabaseAnonKey.includes('your_supabase_anon_key_here')) {
  console.warn('⚠️ Supabase environment variables not configured. Using mock data.')
  supabaseClient = null
} else {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      detectSessionInUrl: false, // Prevents issues with React Native
      persistSession: true,
      autoRefreshToken: true,
    },
  })
}

export const supabase = supabaseClient

// Types for user authentication
export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  phone?: string
  location?: string
  preferences?: any
  is_admin?: boolean
  created_at: string
  updated_at: string
}

// Pet-related types and functions
export interface Pet {
  id: string
  name: string
  breed: string
  age: number
  gender: 'male' | 'female'
  size: 'small' | 'medium' | 'large'
  color: string
  personality: string[]
  description: string
  images: string[]
  location: string
  contact_info: any
  adoption_status: 'available' | 'pending' | 'adopted'
  owner_id?: string
  created_at: string
  updated_at: string
}

export interface LearningArticle {
  id: string
  title: string
  content: string
  excerpt: string
  author: string
  category: string
  subcategory?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  read_time: number
  tags: string[]
  featured_image?: string
  published: boolean
  created_at: string
  updated_at: string
}

export interface PetFavorite {
  id: string
  user_id: string
  pet_id: string
  created_at: string
}

export interface PetInteraction {
  id: string
  user_id: string
  pet_id: string
  interaction_type: 'like' | 'pass' | 'super_like'
  created_at: string
}

// Auth utility functions
export const authService = {
  async signInWithGoogle() {
    if (!supabase) {
      throw new Error('Supabase not configured. Please set up your environment variables.')
    }
    
    const redirectUri = getRedirectUri()
    
    if (__DEV__ && process.env.EXPO_PUBLIC_DEBUG_AUTH === 'true') {
      console.log('🚀 [Auth] Starting Google sign-in with redirect:', redirectUri)
    }
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    
    if (error) throw error
    return data
  },

  async signOut() {
    if (!supabase) {
      throw new Error('Supabase not configured. Please set up your environment variables.')
    }
    
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser() {
    if (!supabase) return null
    
    const { data: { session } } = await supabase.auth.getSession()
    return session?.user || null
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!supabase) return null
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
    
    return data as unknown as UserProfile
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    if (!supabase) {
      throw new Error('Supabase not configured. Please set up your environment variables.')
    }
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data as unknown as UserProfile
  }
}

// Database service functions
export const databaseService = {
  // Pet functions
  async getAvailablePets(limit = 20, offset = 0): Promise<Pet[]> {
    if (!supabase) return []
    
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('adoption_status', 'available')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('Error fetching pets:', error)
      return []
    }
    
    return (data as unknown as Pet[]) || []
  },

  async getPetById(id: string): Promise<Pet | null> {
    if (!supabase) return null
    
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching pet:', error)
      return null
    }
    
    return data as unknown as Pet
  },

  async getUserPets(userId: string): Promise<Pet[]> {
    if (!supabase) return []
    
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching user pets:', error)
      return []
    }
    
    return (data as unknown as Pet[]) || []
  },

  async addPet(pet: Omit<Pet, 'id' | 'created_at' | 'updated_at'>): Promise<Pet> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }
    
    const { data, error } = await supabase
      .from('pets')
      .insert(pet)
      .select()
      .single()
    
    if (error) throw error
    return data as unknown as Pet
  },

  // Favorites functions
  async getUserFavorites(userId: string): Promise<Pet[]> {
    if (!supabase) return []
    
    const { data, error } = await supabase
      .from('pet_favorites')
      .select(`
        *,
        pet:pet_id (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching favorites:', error)
      return []
    }
    
    return (data?.map((fav: any) => fav.pet).filter(Boolean) as unknown as Pet[]) || []
  },

  async addToFavorites(userId: string, petId: string): Promise<PetFavorite> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }
    
    const { data, error } = await supabase
      .from('pet_favorites')
      .insert({ user_id: userId, pet_id: petId })
      .select()
      .single()
    
    if (error) throw error
    return data as unknown as PetFavorite
  },

  async removeFromFavorites(userId: string, petId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }
    
    const { error } = await supabase
      .from('pet_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('pet_id', petId)
    
    if (error) throw error
  },

  async isPetFavorited(userId: string, petId: string): Promise<boolean> {
    if (!supabase) return false
    
    const { data, error } = await supabase
      .from('pet_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('pet_id', petId)
      .single()
    
    return !error && !!data
  },

  // Pet interactions (swipe history)
  async recordPetInteraction(userId: string, petId: string, interactionType: 'like' | 'pass' | 'super_like'): Promise<PetInteraction> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }
    
    const { data, error } = await supabase
      .from('pet_interactions')
      .insert({
        user_id: userId,
        pet_id: petId,
        interaction_type: interactionType
      })
      .select()
      .single()
    
    if (error) throw error
    return data as unknown as PetInteraction
  },

  async getPetsExcludingInteracted(userId: string, limit = 20): Promise<Pet[]> {
    if (!supabase) return []
    
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('adoption_status', 'available')
      .not('id', 'in', `(
        SELECT pet_id FROM pet_interactions WHERE user_id = '${userId}'
      )`)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching uninteracted pets:', error)
      return []
    }
    
    return (data as unknown as Pet[]) || []
  },

  // Learning articles functions
  async getPublishedArticles(category?: string): Promise<LearningArticle[]> {
    if (!supabase) return []
    
    let query = supabase
      .from('learning_articles')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
    
    if (category) {
      query = query.eq('category', category)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching articles:', error)
      return []
    }
    
    return (data as unknown as LearningArticle[]) || []
  },

  async getArticleById(id: string): Promise<LearningArticle | null> {
    if (!supabase) return null
    
    const { data, error } = await supabase
      .from('learning_articles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching article:', error)
      return null
    }
    
    return data as unknown as LearningArticle
  },

  async getArticlesByCategory(category: string): Promise<LearningArticle[]> {
    if (!supabase) return []
    
    const { data, error } = await supabase
      .from('learning_articles')
      .select('*')
      .eq('category', category)
      .eq('published', true)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching articles by category:', error)
      return []
    }
    
    return (data as unknown as LearningArticle[]) || []
  }
}

export default supabase
