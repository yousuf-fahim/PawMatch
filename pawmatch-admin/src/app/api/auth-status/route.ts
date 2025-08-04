import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('mode') || 'basic';

  try {
    const supabase = await createRouteHandlerClient();
    
    // Basic information about auth settings
    const basicInfo: {
      authEnabled: boolean;
      providers: {
        google: {
          enabled: boolean;
          redirectUrl: string;
          clientId: string;
        };
      };
      supabaseUrl: string | undefined;
      currentUrl: string;
      serviceRoleConfigured?: boolean;
      authConfig?: any;
      error?: string;
      errorDetails?: string;
    } = {
      authEnabled: true,
      providers: {
        google: {
          enabled: true,
          redirectUrl: process.env.NEXT_PUBLIC_REDIRECT_URL || 'Not configured',
          clientId: process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured',
        },
      },
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      currentUrl: request.nextUrl.origin,
    };

    // For detailed mode, try to fetch additional information
    if (mode === 'detailed') {
      try {
        // Check if service role key is configured (not exposing the actual key)
        basicInfo.serviceRoleConfigured = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        // Check current auth session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          return NextResponse.json({
            ...basicInfo,
            error: 'Failed to fetch auth session',
            errorDetails: sessionError.message
          });
        }
        
        return NextResponse.json({
          ...basicInfo,
          authConfig: {
            isAuthenticated: !!session,
            authProviders: ['google'],
            callbackUrl: process.env.NEXT_PUBLIC_REDIRECT_URL,
          }
        });
      } catch (error: any) {
        return NextResponse.json({
          ...basicInfo,
          error: 'Error in detailed mode',
          errorMessage: error.message
        });
      }
    }
    
    return NextResponse.json(basicInfo);
  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to check auth status',
      errorMessage: error.message
    }, { status: 500 });
  }
}
