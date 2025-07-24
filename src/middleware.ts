import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
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
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Verificar si el usuario está autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Proteger rutas del dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      // Redirigir a la página principal si no está autenticado
      const redirectUrl = new URL('/', request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Redirigir usuarios autenticados desde página principal al dashboard
  if (request.nextUrl.pathname === '/' && user) {
    const redirectUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes - manejadas por separado)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|dashboard).*)',
  ],
} 