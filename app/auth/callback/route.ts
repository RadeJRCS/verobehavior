import { type EmailOtpType } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createClient } from '@/lib/supabase/server'

// Every email-link flow lands here. Two link shapes are handled:
//   - token_hash + type — signup confirmation, password recovery, email
//     change, invite. This is what Supabase's email templates produce once
//     pointed at this route (see Faza 7 note on updating the templates).
//     Verified with verifyOtp(), per Supabase's own SSR example.
//   - code — PKCE. Kept as a fallback for any flow still using
//     {{ .ConfirmationURL }} (which redirects here via Supabase's own
//     hosted /verify with a code) so we don't regress a link shape we
//     haven't explicitly audited.
// Diagnosed 2026-08-20: the "Confirm signup" template was still on
// {{ .ConfirmationURL }}, which round-trips through Supabase's hosted
// /verify endpoint — and that redirect back to this route carried no code
// at all, so exchangeCodeForSession() was never reached, the RPC below
// never ran, and the user landed on /login with no client_key. This route
// now handles the token_hash shape directly — the "Confirm signup" and
// "Reset Password" email templates in the Supabase dashboard must link
// here with token_hash+type (not {{ .ConfirmationURL }}); see supabase/NOTES.md.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  const supabase = await createClient()
  let userId: string | null = null
  let verifyError: string | null = null

  if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (error) verifyError = error.message
    else userId = data.user?.id ?? null
  } else if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) verifyError = error.message
    else userId = data.user?.id ?? null
  } else {
    verifyError = 'No token_hash+type or code present in callback URL'
  }

  if (verifyError || !userId) {
    console.error('auth callback failed:', verifyError ?? 'no user id after verification')
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  // First time this user has ever had a session: give them their first
  // client_key. Safe to call on every callback hit (password reset,
  // repeat confirms) — the DB function is a WHERE NOT EXISTS no-op once
  // the owner already has any client row. Never blocks the redirect; a
  // failure here just means an empty dashboard, logged for follow-up.
  const clientKey = 'vb_' + randomUUID().replace(/-/g, '').slice(0, 12)
  const { error: clientErr } = await supabase.rpc('create_client_if_missing', {
    p_owner_id: userId,
    p_client_key: clientKey,
  })
  if (clientErr) {
    console.error('create_client_if_missing failed:', clientErr.message)
  }

  const destination = next ?? (type === 'recovery' ? '/reset-password' : '/dashboard')
  return NextResponse.redirect(`${origin}${destination}`)
}
