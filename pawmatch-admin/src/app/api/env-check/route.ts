import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return sanitized environment information
    return NextResponse.json({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set ✓' : 'Missing ✗',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set ✓' : 'Missing ✗',
      adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL ? 'Set ✓' : 'Missing ✗',
      adminEmailValue: process.env.NEXT_PUBLIC_ADMIN_EMAIL ? 
        `${process.env.NEXT_PUBLIC_ADMIN_EMAIL.substring(0, 3)}...${process.env.NEXT_PUBLIC_ADMIN_EMAIL.split('@')[1]}` : 
        'Not configured',
      nodeEnv: process.env.NODE_ENV || 'Not set',
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'Not set',
      redirectUrl: process.env.NEXT_PUBLIC_REDIRECT_URL || 'Not set',
      serviceRoleEnabled: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    });
  } catch (error: any) {
    console.error('Environment check error:', error);
    return NextResponse.json({ 
      error: 'Failed to check environment',
      message: error.message 
    }, { status: 500 });
  }
}
