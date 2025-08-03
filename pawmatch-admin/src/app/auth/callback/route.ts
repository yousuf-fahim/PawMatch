import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createRouteHandlerClient()
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_error`)
    }

    // Check if user is admin
    const userEmail = data.user?.email
    const adminEmail = process.env.ADMIN_EMAIL || 'fahim.cse.bubt@gmail.com'
    
    if (userEmail !== adminEmail) {
      // Sign out non-admin user
      await supabase.auth.signOut()
      return NextResponse.redirect(`${requestUrl.origin}/login?error=unauthorized`)
    }

    // Redirect to dashboard for admin users
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
  }

  // Return to login if no code
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
