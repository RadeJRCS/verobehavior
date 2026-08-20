import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createClient } from '@/lib/supabase/server'

// Every email-link flow (signup confirmation, password reset) lands here
// with a `code` param. Exchange it for a session (sets the auth cookies),
// then send the user on.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // First time this user has ever had a session: give them their first
      // client_key. Safe to call on every callback hit (password reset,
      // repeat signups) — the DB function is a WHERE NOT EXISTS no-op once
      // the owner already has any client row. Never blocks the redirect;
      // a failure here just means an empty dashboard, logged for follow-up.
      if (data.user) {
        const clientKey = 'vb_' + randomUUID().replace(/-/g, '').slice(0, 12)
        const { error: clientErr } = await supabase.rpc('create_client_if_missing', {
          p_owner_id: data.user.id,
          p_client_key: clientKey,
        })
        if (clientErr) {
          console.error('create_client_if_missing failed:', clientErr.message)
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
