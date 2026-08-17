import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Runs on every page (see matcher) so the Supabase session gets refreshed
// no matter where on the site a signed-in partner is browsing, not just on
// /dashboard. /api/ routes are explicitly excluded from the matcher — the
// snippet's routes (analyze, snippet, tests, test-results) must never be
// gated by this and have no session to refresh anyway; their own
// protection (where it exists) lives inside the route handlers themselves
// (lib/auth/getOwnedKeys.ts), not here.
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

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
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refreshes the session (writes new cookies via setAll above if the
  // access token was near/past expiry). Runs on every matched page now,
  // so this happens regardless of which page a partner is browsing.
  const { data: { user } } = await supabase.auth.getUser()

  // Only /dashboard actually requires a session. The matcher below now
  // covers the whole public site too (for the refresh above), so the
  // redirect must stay scoped here — otherwise every anonymous visitor to
  // the homepage, pricing, blog, etc. would get bounced to /login.
  // There is no "public routes" allowlist to maintain: /signup,
  // /forgot-password, /reset-password (and /login itself) are public by
  // construction, simply by not starting with /dashboard. Nothing to add
  // here when a new public page is created.
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard')
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Match every request path except: /api/*, Next.js static/image
    // optimization internals, favicon.ico, and common static asset
    // extensions. This is the standard @supabase/ssr "everything except
    // assets and api" pattern.
    '/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
