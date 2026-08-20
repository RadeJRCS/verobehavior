import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import {
  SYSTEM_PROMPT,
  buildUserPrompt,
  MODEL,
  MAX_TOKENS,
  MIN_EVENTS_FOR_ANALYSIS,
  COLLECTING_DATA_INSIGHT_TYPE,
  COLLECTING_DATA_TEXT,
  LIMIT_REACHED_INSIGHT_TYPE,
  LIMIT_REACHED_TEXT,
  NON_ANALYSIS_INSIGHT_TYPES,
  normalizeInsightType,
} from '@/lib/analyze/prompt'

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

// This route is hit by the anonymous public snippet — no user session, no
// cookies, so it can't use the cookie-aware authenticated client that
// dashboard routes use to satisfy the "owner reads own client row" RLS
// policy. Reading another account's tier/limit here needs the service role
// key (server-only, never exposed to a browser) to bypass RLS for this one
// legitimate backend purpose. Requires a new SUPABASE_SERVICE_ROLE_KEY env
// var — see Faza 7.
function getServiceSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  return createClient(url, key)
}

// Faza 5 usage cap. Fails OPEN on any lookup problem (missing/unreadable
// clients row, count query error, missing env var) — an unknown limit never
// blocks a real AI call for an existing client; it just doesn't enforce the
// cap until the underlying issue is fixed. Logged loudly either way so a
// silent misconfiguration doesn't look like "nobody ever hits their limit."
async function isUsageLimitReached(clientKey: string): Promise<boolean> {
  try {
    const serviceSupabase = getServiceSupabase()
    const { data: clientRow, error: clientErr } = await serviceSupabase
      .from('clients')
      .select('monthly_session_limit')
      .eq('client_key', clientKey)
      .maybeSingle()

    if (clientErr) {
      console.error('isUsageLimitReached: clients lookup failed:', clientErr.message)
      return false
    }
    if (!clientRow || clientRow.monthly_session_limit == null) {
      // No row (unrecognized client_key) or explicitly unlimited tier.
      return false
    }

    const supabase = getSupabase()
    const now = new Date()
    const firstOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
    // Only rows that actually consumed an AI call count against the limit —
    // COLLECTING_DATA (skipped, too few events) and LIMIT_REACHED (skipped,
    // capped) never reached Anthropic, so they must not count themselves
    // toward the very cap that stopped them.
    const { count, error: countErr } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('client_key', clientKey)
      .gte('created_at', firstOfMonth)
      .not('insight_type', 'in', `(${NON_ANALYSIS_INSIGHT_TYPES.join(',')})`)

    if (countErr) {
      console.error('isUsageLimitReached: session count failed:', countErr.message)
      return false
    }

    return (count ?? 0) >= clientRow.monthly_session_limit
  } catch (err: unknown) {
    console.error('isUsageLimitReached: unexpected error:', err instanceof Error ? err.message : String(err))
    return false
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

function parseAnalysis(raw: string) {
  try { return JSON.parse(raw) } catch {}
  try { return JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()) } catch {}
  try { const m = raw.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]) } catch {}
  return null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { clientKey, sessionId, siteUrl, pageContext, events, sessionDuration, scrollDepth, referral, activeTests } = body

    if (!clientKey || !events || events.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers: CORS })
    }

    // Sessions this thin don't carry enough signal for a reliable AI read —
    // skip the Anthropic call entirely rather than let the model guess from
    // almost nothing. No cost paid for sessions we'd essentially discard.
    let analysis: any
    if (events.length < MIN_EVENTS_FOR_ANALYSIS) {
      analysis = {
        state: 'browsing',
        intent_score: 0,
        conversion_probability: 0,
        tags: [],
        insight_type: COLLECTING_DATA_INSIGHT_TYPE,
        insight_text: COLLECTING_DATA_TEXT,
        insight_principle: '',
        recommendation: '',
        estimated_lift: '',
        ab_test_config: null,
      }
    } else if (await isUsageLimitReached(clientKey)) {
      analysis = {
        state: 'browsing',
        intent_score: 0,
        conversion_probability: 0,
        tags: [],
        insight_type: LIMIT_REACHED_INSIGHT_TYPE,
        insight_text: LIMIT_REACHED_TEXT,
        insight_principle: '',
        recommendation: '',
        estimated_lift: '',
        ab_test_config: null,
      }
    } else {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      let rawText = ''
      try {
        const response = await anthropic.messages.create({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system: SYSTEM_PROMPT,
          messages: [{
            role: 'user',
            content: buildUserPrompt({ clientKey, siteUrl, pageContext, events, sessionDuration, scrollDepth, referral }),
          }],
        })
        rawText = response.content[0].type === 'text' ? response.content[0].text : ''
      } catch (aiErr: unknown) {
        const msg = aiErr instanceof Error ? aiErr.message : String(aiErr)
        console.error('Anthropic error:', msg)
        return NextResponse.json({ error: msg }, { status: 500, headers: CORS })
      }

      const parsed = parseAnalysis(rawText)
      if (!parsed) {
        console.error('Failed to parse AI response:', rawText.slice(0, 200))
        return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500, headers: CORS })
      }
      // Normalize before anything downstream sees it — DB, response, everything.
      parsed.insight_type = normalizeInsightType(parsed.insight_type)
      analysis = parsed
    }

    try {
      const supabase = getSupabase()
      const sessionRow = {
        client_key: clientKey,
        session_id: sessionId || null,
        site_url: siteUrl || '',
        page_context: pageContext || '',
        session_duration: sessionDuration || 0,
        scroll_depth: scrollDepth || 0,
        state: analysis.state || 'browsing',
        intent_score: Number(analysis.intent_score) || 0,
        conversion_probability: Number(analysis.conversion_probability) || 0,
        tags: Array.isArray(analysis.tags) ? analysis.tags : [],
        insight_type: analysis.insight_type || '',
        insight_text: analysis.insight_text || '',
        insight_principle: analysis.insight_principle || '',
        recommendation: analysis.recommendation || '',
        estimated_lift: analysis.estimated_lift || '',
        events: events || [],
        ab_test_config: analysis.ab_test_config || null,
        updated_at: new Date().toISOString(),
      }

      // The snippet sends multiple analyze calls per browser visit (early
      // preview, on conversion, on page leave), all sharing the same
      // session_id. Update the existing row in place so one visit stays
      // one session, with the latest (most complete) analysis winning.
      let existingId: string | null = null
      if (sessionId) {
        const { data: existing } = await supabase
          .from('sessions')
          .select('id')
          .eq('client_key', clientKey)
          .eq('session_id', sessionId)
          .limit(1)
          .maybeSingle()
        existingId = existing?.id || null
      }

      if (existingId) {
        await supabase.from('sessions').update(sessionRow).eq('id', existingId)
      } else {
        await supabase.from('sessions').insert([sessionRow])
      }
    } catch (dbErr: unknown) {
      console.error('Supabase error:', dbErr instanceof Error ? dbErr.message : String(dbErr))
    }

    return NextResponse.json({ success: true, analysis }, { headers: CORS })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Analyze error:', msg)
    return NextResponse.json({ error: msg }, { status: 500, headers: CORS })
  }
}
