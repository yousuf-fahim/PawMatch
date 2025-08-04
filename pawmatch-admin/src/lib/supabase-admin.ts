import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Regular client for authenticated user operations
export const supabase = createClient(supabaseUrl, supabaseKey);

// Admin client with service role key to bypass RLS
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

// Custom error handling function
export const handleSupabaseError = (error: any): string => {
  console.error('Supabase error:', error);
  
  // Extract the most useful error message
  if (error?.message) {
    if (error.message.includes('row level security')) {
      return 'Permission denied: You do not have access to perform this action.';
    }
    return error.message;
  }
  
  if (error?.error_description) {
    return error.error_description;
  }
  
  if (error?.details) {
    return error.details;
  }
  
  return 'An unexpected error occurred.';
};

// Safe query function with better error handling
export async function safeQuery<T = any>(
  fn: () => any, // Using any here to accept all Supabase query types
  errorMsg: string = 'Error performing operation'
): Promise<{ data: T | null; error: string | null }> {
  try {
    const { data, error } = await fn();
    
    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
    
    return { data, error: null };
  } catch (e) {
    console.error(errorMsg, e);
    return { data: null, error: handleSupabaseError(e) };
  }
}

// Admin-specific functions
export const adminUtils = {
  // Get list of pre-access admins
  async getPreAccessAdmins() {
    return safeQuery(
      () => supabaseAdmin
        .from('pre_access_admins')
        .select('id, email, created_at')
        .order('created_at', { ascending: false }),
      'Error fetching admin list'
    );
  },

  // Add new pre-access admin
  async addPreAccessAdmin(email: string, userId: string) {
    return safeQuery(
      () => supabaseAdmin
        .from('pre_access_admins')
        .insert({ 
          email, 
          created_at: new Date().toISOString(),
          created_by: userId
        }),
      'Error adding admin access'
    );
  },

  // Remove pre-access admin
  async removePreAccessAdmin(id: string) {
    return safeQuery(
      () => supabaseAdmin
        .from('pre_access_admins')
        .delete()
        .eq('id', id),
      'Error removing admin access'
    );
  },

  // Send admin invitation email
  async sendAdminInvitation(email: string) {
    return safeQuery(
      () => supabase.functions.invoke('send-admin-invitation', { body: { email } }),
      'Error sending invitation email'
    );
  }
};

export default supabase;
