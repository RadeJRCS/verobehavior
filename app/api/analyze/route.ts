import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

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

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    let rawText = ''
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: `You are a behavioral psychology expert and CRO specialist. Analyze user sessions and respond ONLY with valid JSON. No markdown, no explanation, just raw JSON.`,
        messages: [{
          role: 'user',
          content: `Analyze this session:
Client: ${clientKey}
Site: ${siteUrl || 'unknown'}
Page: ${pageContext}
Duration: ${sessionDuration}s, Scroll: ${scrollDepth}%, Referral: ${referral || 'direct'}
Events: ${JSON.stringify(events.slice(-20))}

Respond with this JSON only:
{
  "state": "browsing|engaged|hesitating|comparing|high_intent|converted",
  "intent_score": 0-99,
  "conversion_probability": 0-100,
  "tags": ["tag1","tag2","tag3"],
  "insight_type": "FRICTION|CONVERSION_EVENT|DECISION_FATIGUE|HIGH_INTENT|SOCIAL_PROOF_SEEKING|BOUNCE_RISK|COMPARISON_BEHAVIOR",
  "insight_text": "2-3 sentences about psychological behavior observed",
  "insight_principle": "Psychological principle name and brief explanation",
  "recommendation": "Specific actionable recommendation (can include things not testable by simple text replacement, like layout changes)",
  "estimated_lift": "+X-Y% metric",
  "ab_test_config": {
    "testable": true or false,
    "type": "text_replace" | "insert_element" | "style_change" | null,
    "element_find_text": "exact text of an existing button/link/element from the events that the test targets (must match text seen in events, or null if testable is false)",
    "control_text": "for text_replace: current/original text of the element. For insert_element/style_change: null",
    "variant_text": "for text_replace: the new text to test. For insert_element: the text content to inject (badge/banner text only, plain text no HTML). For style_change: null",
    "position": "for insert_element only: 'before' or 'after' the anchor element. Otherwise null",
    "style_changes": "for style_change only: an object with CSS properties to change, ONLY from this whitelist: backgroundColor, color, fontSize, fontWeight, padding, borderRadius, border. Use valid CSS values as strings, e.g. {\"backgroundColor\": \"#1A3A2A\", \"fontSize\": \"18px\"}. Otherwise null",
    "hypothesis": "one sentence: what psychological principle this change leverages and expected effect"
  }
}

IMPORTANT for ab_test_config - pick the type that BEST implements the core idea of the recommendation:
- "text_replace": the recommendation is fundamentally a copy/wording change on an existing button or link. element_find_text must exactly match text from one of the click events. Set control_text and variant_text, leave position/style_changes null.
- "insert_element": the recommendation is to ADD something near an existing element (a trust badge, social proof line, urgency text, "no credit card required", testimonial snippet, etc.) - something short and purely textual. element_find_text identifies the anchor element (must match event text). variant_text is the short text to inject (plain text only, max ~80 chars, no HTML/markup). position is "before" or "after". Leave control_text/style_changes null.
- "style_change": the recommendation is to make an existing element more/less prominent (bigger, different color, more padding) without changing its text or adding elements. element_find_text identifies the element. style_changes contains only whitelisted CSS properties. Leave control_text/variant_text/position null.
- Set "testable": false and type/element_find_text/etc to null ONLY if the recommendation requires multi-step flows, forms, conditional logic, or structural page reorganization that cannot be expressed as one of the three types above. When testable is false, also leave "type" as null.
- element_find_text MUST exactly match text from one of the click events provided whenever testable is true.`
        }],
      })
      rawText = response.content[0].type === 'text' ? response.content[0].text : ''
    } catch (aiErr: unknown) {
      const msg = aiErr instanceof Error ? aiErr.message : String(aiErr)
      console.error('Anthropic error:', msg)
      return NextResponse.json({ error: msg }, { status: 500, headers: CORS })
    }

    const analysis = parseAnalysis(rawText)
    if (!analysis) {
      console.error('Failed to parse AI response:', rawText.slice(0, 200))
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500, headers: CORS })
    }

    try {
      const supabase = getSupabase()
      await supabase.from('sessions').insert([{
        client_key: clientKey,
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
      }])
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
