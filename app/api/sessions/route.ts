import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getOwnedKeys } from '@/lib/auth/getOwnedKeys'

export const runtime = 'nodejs'

function emptyStats() {
  return { total: 0, avgConv: 0, avgIntent: 0, converted: 0, convRate: '0' }
}

export async function GET(req: NextRequest) {
  try {
    const owned = await getOwnedKeys()
    if (!owned.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const clientKey = searchParams.get('key')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (clientKey && !owned.keys.includes(clientKey)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (owned.keys.length === 0) {
      return NextResponse.json({ sessions: [], stats: emptyStats() })
    }

    let query = supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    query = clientKey ? query.eq('client_key', clientKey) : query.in('client_key', owned.keys)

    const { data, error } = await query

    if (error) throw error

    // Aggregate stats
    const total = data?.length || 0
    const avgConv = total > 0
      ? Math.round(data!.reduce((sum, s) => sum + (s.conversion_probability || 0), 0) / total)
      : 0
    const avgIntent = total > 0
      ? Math.round(data!.reduce((sum, s) => sum + (s.intent_score || 0), 0) / total)
      : 0
    const converted = data?.filter(s => s.state === 'converted').length || 0
    const convRate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0'

    return NextResponse.json({
      sessions: data || [],
      stats: { total, avgConv, avgIntent, converted, convRate },
    })
  } catch (err: unknown) {
    console.error('Sessions error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
