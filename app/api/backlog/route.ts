import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function getSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY')
  return createClient(url, key)
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(req.url)
    const clientKey = searchParams.get('key')
    let query = supabase.from('backlog').select('*').order('created_at', { ascending: false })
    if (clientKey) query = query.eq('client_key', clientKey)
    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ items: data || [] })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await req.json()
    const lift = body.estimatedLift || ''
    const priority = lift.includes('+3') || lift.includes('+4') ? 'high' : 'medium'
    const { data, error } = await supabase.from('backlog').insert([{
      client_key: body.clientKey || 'unknown',
      session_id: body.sessionId || null,
      insight_type: body.insightType || null,
      insight_text: body.insightText || null,
      recommendation: body.recommendation || null,
      estimated_lift: lift || null,
      state: body.state || null,
      status: 'pending',
      priority,
    }]).select()
    if (error) throw error
    return NextResponse.json({ item: data?.[0] || null })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await req.json()
    const { id, status } = body
    if (!id || !status) return NextResponse.json({ error: 'Missing id or status' }, { status: 400 })
    const { data, error } = await supabase.from('backlog').update({ status }).eq('id', id).select()
    if (error) throw error
    return NextResponse.json({ item: data?.[0] || null })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const { error } = await supabase.from('backlog').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
