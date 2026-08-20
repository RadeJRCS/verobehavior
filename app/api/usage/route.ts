import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOwnedKeys } from '@/lib/auth/getOwnedKeys'
import { NON_ANALYSIS_INSIGHT_TYPES } from '@/lib/analyze/prompt'

export const runtime = 'nodejs'

// Dashboard-only, called from the browser with the user's own session
// cookies — so this uses the cookie-aware authenticated client, which
// already satisfies the "Users read own client rows" RLS policy on
// clients. No service role key needed here (unlike /api/analyze, which has
// no user session to authenticate with at all).
export async function GET(req: NextRequest) {
  try {
    const owned = await getOwnedKeys()
    if (!owned.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const clientKey = searchParams.get('key')

    if (clientKey && !owned.keys.includes(clientKey)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const keys = clientKey ? [clientKey] : owned.keys
    if (keys.length === 0) {
      return NextResponse.json({ usage: [] })
    }

    const supabase = await createClient()

    const { data: clientRows, error: clientErr } = await supabase
      .from('clients')
      .select('client_key, tier, monthly_session_limit')
      .in('client_key', keys)

    if (clientErr) throw clientErr

    const now = new Date()
    const firstOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()

    const usage = await Promise.all(
      (clientRows || []).map(async (row) => {
        // Same rule as the enforcement check in /api/analyze: only rows
        // that actually consumed an AI call count as "analyzed."
        const { count, error: countErr } = await supabase
          .from('sessions')
          .select('*', { count: 'exact', head: true })
          .eq('client_key', row.client_key)
          .gte('created_at', firstOfMonth)
          .not('insight_type', 'in', `(${NON_ANALYSIS_INSIGHT_TYPES.join(',')})`)

        if (countErr) {
          console.error('Usage count error for', row.client_key, ':', countErr.message)
        }

        return {
          client_key: row.client_key as string,
          tier: row.tier as string,
          monthly_session_limit: row.monthly_session_limit as number | null,
          sessions_this_month: count ?? 0,
        }
      })
    )

    return NextResponse.json({ usage })
  } catch (err: unknown) {
    console.error('Usage error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
