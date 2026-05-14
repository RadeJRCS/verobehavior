import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const clientKey = searchParams.get('key')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (clientKey) {
      query = query.eq('client_key', clientKey)
    }

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
