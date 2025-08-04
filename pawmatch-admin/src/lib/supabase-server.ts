import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export async function createServerComponentClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export async function createRouteHandlerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )
}

// Create admin client with service role key to bypass RLS (SERVER SIDE ONLY)
// Using anon key with authenticated context for admin operations
export const supabaseServerAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  }
);

// Safe server-side query function with better error handling
export async function safeServerQuery<T = any>(
  fn: () => any,
  errorMsg: string = 'Error performing server operation'
): Promise<{ data: T | null; error: string | null }> {
  try {
    const { data, error } = await fn();
    
    if (error) {
      console.error('Supabase server error:', error);
      
      // Extract the most useful error message
      if (error?.message) {
        if (error.message.includes('row level security')) {
          return { data: null, error: 'Permission denied: You do not have access to perform this action.' };
        }
        return { data: null, error: error.message };
      }
      
      if (error?.error_description) {
        return { data: null, error: error.error_description };
      }
      
      if (error?.details) {
        return { data: null, error: error.details };
      }
      
      return { data: null, error: 'An unexpected error occurred.' };
    }
    
    return { data, error: null };
  } catch (e: any) {
    console.error(errorMsg, e);
    return { data: null, error: e?.message || 'An unexpected error occurred' };
  }
}

// Admin-specific server functions
export const serverAdminUtils = {
  // Get list of pre-access admins
  async getPreAccessAdmins() {
    return safeServerQuery(
      () => supabaseServerAdmin
        .from('pre_access_admins')
        .select('id, email, created_at')
        .order('created_at', { ascending: false }),
      'Error fetching admin list'
    );
  },

  // Add new pre-access admin
  async addPreAccessAdmin(email: string, userId: string) {
    return safeServerQuery(
      () => supabaseServerAdmin
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
    return safeServerQuery(
      () => supabaseServerAdmin
        .from('pre_access_admins')
        .delete()
        .eq('id', id),
      'Error removing admin access'
    );
  },
  
  // Check if email is in pre-access admin list
  async isPreAccessAdmin(email: string) {
    const { data, error } = await safeServerQuery(
      () => supabaseServerAdmin
        .from('pre_access_admins')
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle(),
      'Error checking admin access'
    );
    
    return { isAdmin: !!data, error };
  }
};
