import { createClient } from '@/lib/supabase/server'
import NavClient from './NavClient'

// Server wrapper: reads the session once on the server (no client-side
// flash between "logged out" and "logged in") and hands the minimal user
// info down to the interactive client nav. All existing client behavior
// (scroll effect, Product/Solutions dropdowns, mobile menu) lives in
// NavClient, untouched.
export default async function Nav() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <NavClient user={user?.email ? { email: user.email } : null} />
}
