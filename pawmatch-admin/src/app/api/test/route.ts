import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient, supabaseServerAdmin, serverAdminUtils } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  try {
    console.log('Testing admin API connection...');
    
    // Test environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log('Supabase URL:', supabaseUrl);
    console.log('Service Key exists:', !!serviceKey);
    
    // Test server admin client
    const { data: testData, error: testError } = await supabaseServerAdmin
      .from('pre_access_admins')
      .select('*')
      .limit(1);
    
    console.log('Database test result:', { testData, testError });
    
    // Test user authentication
    const supabase = await createRouteHandlerClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('Session test:', { 
      hasSession: !!session, 
      userEmail: session?.user?.email,
      sessionError 
    });
    
    return NextResponse.json({
      status: 'success',
      environment: {
        hasSupabaseUrl: !!supabaseUrl,
        hasServiceKey: !!serviceKey,
      },
      database: {
        connected: !testError,
        error: testError?.message,
        dataCount: testData?.length || 0
      },
      authentication: {
        hasSession: !!session,
        userEmail: session?.user?.email,
        sessionError: sessionError?.message
      }
    });
    
  } catch (error: any) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error.message },
      { status: 500 }
    );
  }
}
