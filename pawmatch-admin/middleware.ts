import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes that require admin access
  const protectedRoutes = ['/dashboard', '/pets', '/users', '/content', '/analytics']
  const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  // Admin email check
  const isAdmin = user?.email === process.env.ADMIN_EMAIL || user?.email === 'fahim.cse.bubt@gmail.com'

  // Redirect logic
  if (isProtectedRoute) {
    if (!user) {
      // Not authenticated - redirect to login
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (!isAdmin) {
      // Not admin - redirect to login with error
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url))
    }
  }

  // If user is authenticated and admin, redirect from login to dashboard
  if (request.nextUrl.pathname === '/login' && user && isAdmin) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
