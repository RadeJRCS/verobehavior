import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
}

function getSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY')
  return createClient(url, key)
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await req.json()
    const { testId, clientKey, variant, converted, pageUrl, intentScore } = body
    if (!testId || !variant) return NextResponse.json({ error: 'Missing testId or variant' }, { status: 400, headers: CORS })
    const { data, error } = await supabase.from('test_results').insert([{
      test_id: testId, client_key: clientKey, variant,
      converted: converted || false, page_url: pageUrl || null, intent_score: intentScore || null,
    }]).select()
    if (error) throw error
    const { count: total } = await supabase.from('test_results').select('*', { count: 'exact', head: true }).eq('test_id', testId)
    const { data: testData } = await supabase.from('tests').select('min_sessions, status').eq('id', testId).single()
    if (testData && testData.status === 'active' && total && total >= (testData.min_sessions * 2)) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/tests`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: testId, triggerJudge: true }),
        })
      } catch {}
    }
    return NextResponse.json({ result: data?.[0] || null }, { headers: CORS })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500, headers: CORS })
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(req.url)
    const testId = searchParams.get('testId')
    if (!testId) return NextResponse.json({ error: 'Missing testId' }, { status: 400, headers: CORS })
    const { data: results, error } = await supabase.from('test_results').select('*').eq('test_id', testId)
    if (error) throw error
    const aR = (results || []).filter((r) => r.variant === 'A')
    const bR = (results || []).filter((r) => r.variant === 'B')
    const aConv = aR.filter((r) => r.converted).length
    const bConv = bR.filter((r) => r.converted).length
    return NextResponse.json({
      stats: {
        A: { sessions: aR.length, conversions: aConv, rate: aR.length > 0 ? ((aConv / aR.length) * 100).toFixed(1) : '0' },
        B: { sessions: bR.length, conversions: bConv, rate: bR.length > 0 ? ((bConv / bR.length) * 100).toFixed(1) : '0' },
        total: (results || []).length,
      }
    }, { headers: CORS })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500, headers: CORS })
  }
}
