import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
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

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(req.url)
    const clientKey = searchParams.get('key')
    const status = searchParams.get('status')
    let query = supabase.from('tests').select('*').order('created_at', { ascending: false })
    if (clientKey) query = query.eq('client_key', clientKey)
    if (status) query = query.eq('status', status)
    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ tests: data || [] }, { headers: CORS })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500, headers: CORS })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await req.json()
    const { data, error } = await supabase.from('tests').insert([{
      client_key: body.clientKey,
      name: body.name || `Test: ${body.controlText} vs ${body.variantText}`,
      hypothesis: body.hypothesis || null,
      element_find_text: body.elementFindText,
      control_text: body.controlText,
      variant_text: body.variantText,
      target_segment: body.targetSegment || 'all',
      status: 'active',
      min_sessions: body.minSessions || 50,
      session_source_id: body.sessionSourceId || null,
      started_at: new Date().toISOString(),
    }]).select()
    if (error) throw error
    return NextResponse.json({ test: data?.[0] || null }, { headers: CORS })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500, headers: CORS })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await req.json()
    const { id, status, triggerJudge, forceEvaluate } = body
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400, headers: CORS })

    const updates: Record<string, unknown> = {}
    if (status) {
      updates.status = status
      if (status === 'completed') updates.completed_at = new Date().toISOString()
    }

    if (triggerJudge) {
      const { data: test } = await supabase.from('tests').select('*').eq('id', id).single()
      const { data: results } = await supabase.from('test_results').select('*').eq('test_id', id)
      if (test && results && (forceEvaluate || results.length > 0)) {
        const aR = results.filter((r) => r.variant === 'A')
        const bR = results.filter((r) => r.variant === 'B')
        const aConv = aR.filter((r) => r.converted).length
        const bConv = bR.filter((r) => r.converted).length
        const aRate = aR.length > 0 ? ((aConv / aR.length) * 100).toFixed(1) : '0'
        const bRate = bR.length > 0 ? ((bConv / bR.length) * 100).toFixed(1) : '0'
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-6', max_tokens: 300,
          messages: [{ role: 'user', content: `You are a behavioral psychology expert evaluating an A/B test.\nTest: "${test.name}"\nControl (A): "${test.control_text}" - ${aR.length} sessions, ${aConv} conversions (${aRate}%)\nVariant (B): "${test.variant_text}" - ${bR.length} sessions, ${bConv} conversions (${bRate}%)\nExplain which variant won and WHY from behavioral psychology. Cite principles. Max 3 sentences.` }],
        })
        updates.winner = parseFloat(bRate) > parseFloat(aRate) ? 'B' : 'A'
        updates.judge_analysis = response.content[0].type === 'text' ? response.content[0].text : null
        updates.status = 'completed'
        updates.completed_at = new Date().toISOString()
      }
    }

    const { data, error } = await supabase.from('tests').update(updates).eq('id', id).select()
    if (error) throw error
    return NextResponse.json({ test: data?.[0] || null }, { headers: CORS })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500, headers: CORS })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400, headers: CORS })
    await supabase.from('test_results').delete().eq('test_id', id)
    const { error } = await supabase.from('tests').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true }, { headers: CORS })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500, headers: CORS })
  }
}
