import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Not set')
  console.log('Supabase Key:', supabaseKey ? 'Set' : 'Not set')

  // Return null if environment variables are not set (for development)
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase_url_here') || supabaseKey.includes('your_supabase_anon_key_here')) {
    console.warn('⚠️ Supabase environment variables not configured. Please set up your Supabase project.')
    console.log('URL:', supabaseUrl)
    console.log('Key:', supabaseKey)
    return null
  }

  console.log('✅ Creating Supabase client successfully')
  return createBrowserClient(supabaseUrl, supabaseKey)
}
