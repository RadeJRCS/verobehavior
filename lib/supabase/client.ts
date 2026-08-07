import { createBrowserClient } from '@supabase/ssr'

// Browser-side Supabase client, used by client components (e.g. the login
// page) to call supabase.auth.* directly. Session cookies are managed by
// @supabase/ssr automatically.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
