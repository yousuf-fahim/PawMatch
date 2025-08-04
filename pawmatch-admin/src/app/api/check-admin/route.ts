import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    const supabase = await createRouteHandlerClient()
    
    // 1. Check if email matches the environment admin email
    const envAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
    
    console.log('🔍 API: Checking admin status for:', email)
    console.log('🔍 API: Environment admin email:', envAdminEmail)

    if (email.toLowerCase() === envAdminEmail?.toLowerCase()) {
      return NextResponse.json({
        isAdmin: true,
        source: 'environment',
        email
      })
    }

    // 2. Check if email exists in pre_access_admins table
    const { data: adminData, error } = await supabase
      .from('pre_access_admins')
      .select('*')
      .eq('email', email.toLowerCase())
    
    console.log('🔍 API: Database check result:', adminData)
    console.log('🔍 API: Database check error:', error)

    if (error) {
      return NextResponse.json(
        { 
          error: 'Error checking admin status',
          details: error.message,
          email,
          isAdmin: false
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      isAdmin: adminData && adminData.length > 0,
      data: adminData,
      email,
      source: 'database'
    })

  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Unexpected error',
        details: error.message,
        isAdmin: false
      },
      { status: 500 }
    )
  }
}
