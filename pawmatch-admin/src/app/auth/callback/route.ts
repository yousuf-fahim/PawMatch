import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const state = requestUrl.searchParams.get('state')
  
  // Check for error parameter
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  
  if (error) {
    console.error('🔐 Auth callback received error:', error, errorDescription);
    return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || '')}`);
  }

  if (code) {
    const supabase = await createRouteHandlerClient()
    
    // Log the state parameter (verification would happen on client side)
    if (state) {
      console.log('🔐 Admin auth callback: Received state parameter:', state);
    } else {
      console.warn('⚠️ Admin auth callback: No state parameter received');
    }
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('❌ Auth callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_error`)
    }

    // Check if user is admin by looking up in pre_access_admins table
    const userEmail = data.user?.email
    console.log('🔍 Admin auth callback: User email:', userEmail);
    
    if (!userEmail) {
      console.log('❌ Admin auth callback: No email provided');
      await supabase.auth.signOut()
      return NextResponse.redirect(`${requestUrl.origin}/login?error=no_email`)
    }
    
    // Also check against env variable admin email
    const envAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    console.log('🔍 Admin auth callback: Checking against env admin email:', envAdminEmail);
    
    if (userEmail.toLowerCase() === envAdminEmail?.toLowerCase()) {
      console.log('✅ Admin auth callback: Email matches env admin email');
      return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
    }
    
    // Check if email exists in pre_access_admins table
    console.log('🔍 Admin auth callback: Checking pre_access_admins table');
    const { data: adminCheck, error: adminError } = await supabase
      .from('pre_access_admins')
      .select('*')
      .eq('email', userEmail.toLowerCase())
    
    console.log('🔍 Admin auth callback: pre_access_admins result:', adminCheck);
    console.log('🔍 Admin auth callback: pre_access_admins error:', adminError);
    
    if (adminError || !adminCheck || adminCheck.length === 0) {
      console.log('❌ Admin auth callback: User not in pre_access_admins table');
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
