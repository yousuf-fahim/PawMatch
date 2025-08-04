import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient, serverAdminUtils } from '@/lib/supabase-server';

// Handler for getting all services
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
    
    // Check if user is an admin
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
    
    // Get specific service ID if provided
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    let data, error;
    
    // If ID is provided, get that specific service
    if (id) {
      const response = await supabase
        .from('pet_services')
        .select('*')
        .eq('id', id)
        .single();
      
      data = response.data;
      error = response.error;
    } else {
      // Otherwise, get all services ordered by creation date
      const response = await supabase
        .from('pet_services')
        .select('*')
        .order('created_at', { ascending: false });
      
      data = response.data;
      error = response.error;
    }
    
    if (error) {
      console.error('Error fetching services:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ services: data });
  } catch (error: any) {
    console.error('Error in services API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handler for creating/updating a service
export async function POST(req: NextRequest) {
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
    
    // Check if user is an admin
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
    
    // Parse request body
    const body = await req.json();
    const { id, ...serviceData } = body;
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'category', 'image_url', 'contact_info'];
    for (const field of requiredFields) {
      if (!serviceData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    let result;
    
    // Check if we're updating or creating
    if (id) {
      // Update existing service
      const { data, error } = await supabase
        .from('pet_services')
        .update({
          ...serviceData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating service:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
      
      result = data;
    } else {
      // Create new service
      const { data, error } = await supabase
        .from('pet_services')
        .insert({
          ...serviceData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: session.user.id
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating service:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
      
      result = data;
    }
    
    return NextResponse.json({
      success: true,
      service: result,
      message: id ? 'Service updated successfully' : 'Service created successfully'
    }, { status: id ? 200 : 201 });
  } catch (error: any) {
    console.error('Error in services API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handler for deleting a service
export async function DELETE(req: NextRequest) {
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
    
    // Check if user is an admin
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
    
    // Get service ID from query params
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }
    
    // Delete the service
    const { error } = await supabase
      .from('pet_services')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting service:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error: any) {
    console.error('Error in services API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
