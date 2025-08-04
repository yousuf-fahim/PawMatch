import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient, serverAdminUtils } from '@/lib/supabase-server';

// Handler for getting pre-access admins
export async function GET(req: NextRequest) {
  try {
    // Verify the user is authenticated and is an admin
    const supabase = await createRouteHandlerClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is a pre-access admin or has admin role
    const email = session.user.email;
    if (!email) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      );
    }
    
    const { isAdmin } = await serverAdminUtils.isPreAccessAdmin(email);
    
    if (!isAdmin && email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have admin access' },
        { status: 403 }
      );
    }
    
    // Get all pre-access admins
    const { data, error } = await serverAdminUtils.getPreAccessAdmins();
    
    if (error) {
      return NextResponse.json(
        { error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ admins: data });
  } catch (error: any) {
    console.error('Error in admin API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handler for adding a new pre-access admin
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Verify the user is authenticated and is an admin
    const supabase = await createRouteHandlerClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is a pre-access admin or has admin role
    const userEmail = session.user.email;
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      );
    }
    
    const { isAdmin } = await serverAdminUtils.isPreAccessAdmin(userEmail);
    
    if (!isAdmin && userEmail !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have admin access' },
        { status: 403 }
      );
    }
    
    // Add the new pre-access admin
    const { data, error } = await serverAdminUtils.addPreAccessAdmin(
      email.toLowerCase(),
      session.user.id
    );
    
    if (error) {
      return NextResponse.json(
        { error },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: `Admin access granted to ${email}` },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in admin API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handler for deleting a pre-access admin
export async function DELETE(req: NextRequest) {
  try {
    // Parse request query parameters
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Admin ID is required' },
        { status: 400 }
      );
    }
    
    // Verify the user is authenticated and is an admin
    const supabase = await createRouteHandlerClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is a pre-access admin or has admin role
    const email = session.user.email;
    if (!email) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      );
    }
    
    const { isAdmin } = await serverAdminUtils.isPreAccessAdmin(email);
    
    if (!isAdmin && email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have admin access' },
        { status: 403 }
      );
    }
    
    // Remove the pre-access admin
    const { error } = await serverAdminUtils.removePreAccessAdmin(id);
    
    if (error) {
      return NextResponse.json(
        { error },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Admin access removed successfully' }
    );
  } catch (error: any) {
    console.error('Error in admin API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
