import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient, supabaseServerAdmin, serverAdminUtils } from '@/lib/supabase-server';

// Handler for getting all pets
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
    
    // Get specific pet ID if provided
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    let data, error;
    
    // Use the authenticated supabase client instead of admin client
    // This ensures RLS policies are properly applied with user context
    if (id) {
      const response = await supabase
        .from('pets')
        .select('*')
        .eq('id', id)
        .single();
      
      data = response.data;
      error = response.error;
    } else {
      // Otherwise, get all pets ordered by creation date
      const response = await supabase
        .from('pets')
        .select('*')
        .order('created_at', { ascending: false });
      
      data = response.data;
      error = response.error;
    }
    
    if (error) {
      console.error('Error fetching pets:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ pets: data });
  } catch (error: any) {
    console.error('Error in pets API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handler for creating/updating a pet
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
    const { id, ...petData } = body;
    
    // Validate required fields
    const requiredFields = ['name', 'species', 'breed', 'age', 'gender'];
    for (const field of requiredFields) {
      if (!petData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    let result;
    
    // Check if we're updating or creating
    if (id) {
      // Update existing pet
      const { data, error } = await supabase
        .from('pets')
        .update({
          ...petData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating pet:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
      
      result = data;
    } else {
      // Create new pet
      const { data, error } = await supabase
        .from('pets')
        .insert({
          ...petData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: session.user.id
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating pet:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
      
      result = data;
    }
    
    return NextResponse.json({
      success: true,
      pet: result,
      message: id ? 'Pet updated successfully' : 'Pet created successfully'
    }, { status: id ? 200 : 201 });
  } catch (error: any) {
    console.error('Error in pets API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handler for deleting a pet
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
    
    // Get pet ID from query params
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Pet ID is required' },
        { status: 400 }
      );
    }
    
    // Delete the pet
    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting pet:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Pet deleted successfully'
    });
  } catch (error: any) {
    console.error('Error in pets API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
