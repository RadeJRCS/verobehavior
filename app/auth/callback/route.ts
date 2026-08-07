import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Magic link lands here with a `code` param. Exchange it for a session
// (sets the auth cookies), then send the user on to the dashboard.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
