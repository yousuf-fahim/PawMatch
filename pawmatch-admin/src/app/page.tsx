'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()

  // Check if Supabase is configured
  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase_url_here') &&
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('your_supabase_anon_key_here')

  useEffect(() => {
    if (!loading) {
      if (!isSupabaseConfigured) {
        console.error('Supabase not configured')
        router.push('/login?error=config')
      } else if (user && isAdmin) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [user, loading, isAdmin, router, isSupabaseConfigured])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-400 via-red-400 to-orange-400">
      <div className="bg-white rounded-3xl p-8 shadow-2xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
        <p className="text-gray-600 mt-4 text-center">
          {!isSupabaseConfigured ? 'Checking configuration...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  )
}
