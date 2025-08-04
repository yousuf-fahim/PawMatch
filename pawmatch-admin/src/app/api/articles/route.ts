import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient, serverAdminUtils } from '@/lib/supabase-server';

// Handler for getting all articles
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
    
    // Get specific article ID if provided
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    let data, error;
    
    // If ID is provided, get that specific article
    if (id) {
      const response = await supabase
        .from('learning_articles')
        .select('*')
        .eq('id', id)
        .single();
      
      data = response.data;
      error = response.error;
    } else {
      // Otherwise, get all articles ordered by creation date
      const response = await supabase
        .from('learning_articles')
        .select('*')
        .order('created_at', { ascending: false });
      
      data = response.data;
      error = response.error;
    }
    
    if (error) {
      console.error('Error fetching articles:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ articles: data });
  } catch (error: any) {
    console.error('Error in articles API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handler for creating/updating an article
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
    const { id, ...articleData } = body;
    
    // Validate required fields
    const requiredFields = ['title', 'excerpt', 'content', 'category', 'author'];
    for (const field of requiredFields) {
      if (!articleData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    let result;
    
    // Check if we're updating or creating
    if (id) {
      // Update existing article
      const { data, error } = await supabase
        .from('learning_articles')
        .update({
          ...articleData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating article:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
      
      result = data;
    } else {
      // Create new article
      const { data, error } = await supabase
        .from('learning_articles')
        .insert({
          ...articleData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: session.user.id
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating article:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
      
      result = data;
    }
    
    return NextResponse.json({
      success: true,
      article: result,
      message: id ? 'Article updated successfully' : 'Article created successfully'
    }, { status: id ? 200 : 201 });
  } catch (error: any) {
    console.error('Error in articles API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handler for deleting an article
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
    
    // Get article ID from query params
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }
    
    // Delete the article
    const { error } = await supabase
      .from('learning_articles')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting article:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error: any) {
    console.error('Error in articles API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
