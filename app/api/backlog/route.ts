import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const clientKey = searchParams.get('key')
    let query = supabase.from('backlog').select('*').order('created_at', { ascending: false })
    if (clientKey) query = query.eq('client_key', clientKey)
    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ items: data || [] })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { data, error } = await supabase.from('backlog').insert([{
      client_key: body.clientKey,
      session_id: body.sessionId || null,
      insight_type: body.insightType || null,
      insight_text: body.insightText || null,
      recommendation: body.recommendation || null,
      estimated_lift: body.estimatedLift || null,
      state: body.state || null,
      status: 'pending',
      priority: body.estimatedLift?.includes('+3') || body.estimatedLift?.includes('+4') ? 'high' : 'medium',
    }]).select()
    if (error) throw error
    return NextResponse.json({ item: data?.[0] })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, status } = body
    if (!id || !status) return NextResponse.json({ error: 'Missing id or status' }, { status: 400 })
    const { data, error } = await supabase.from('backlog').update({ status }).eq('id', id).select()
    if (error) throw error
    return NextResponse.json({ item: data?.[0] })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const { error } = await supabase.from('backlog').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
