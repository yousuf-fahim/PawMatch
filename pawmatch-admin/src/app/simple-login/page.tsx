'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Heart, Shield, AlertCircle } from 'lucide-react'

export default function SimpleLoginPage() {
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>('')

  const supabase = createClient()

  const handleGoogleSignIn = async () => {
    if (!supabase) {
      setError('Supabase not configured properly. Check environment variables.')
      setDebugInfo(`
        URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'}
        Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}
      `)
      return
    }

    try {
      setIsSigningIn(true)
      setError(null)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      
      if (error) throw error
      
      // OAuth redirect should happen automatically
      
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google')
      setIsSigningIn(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-400 via-red-400 to-orange-400">
      <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-pink-100 p-3 rounded-full">
              <Heart className="h-8 w-8 text-pink-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">PawMatch Admin</h1>
          <p className="text-gray-600">
            Administrative Dashboard
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            {debugInfo && (
              <pre className="mt-2 text-xs text-red-600 whitespace-pre-wrap">{debugInfo}</pre>
            )}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={isSigningIn || !supabase}
          className="w-full bg-white border-2 border-gray-200 rounded-xl px-6 py-4 flex items-center justify-center gap-3 hover:border-pink-300 hover:bg-pink-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Shield className="h-5 w-5 text-gray-600" />
          <span className="font-medium text-gray-700">
            {isSigningIn ? 'Signing in...' : 'Continue with Google'}
          </span>
        </button>

        <p className="text-xs text-gray-500 text-center mt-6">
          Only authorized administrators can access this panel
        </p>
        
        <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
          <strong>Debug:</strong><br/>
          Supabase: {supabase ? '✅ Available' : '❌ Not available'}<br/>
          URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set'}<br/>
          Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}
        </div>
      </div>
    </div>
  )
}
