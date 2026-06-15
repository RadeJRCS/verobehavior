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

IMPORTANT for ab_test_config - the type must follow from the psychological reasoning above, not be chosen for variety. For THIS specific session, decide what the single most effective testable intervention is given the insight_principle and recommendation, then identify which mechanism that intervention fundamentally requires. Do not default to "insert_element" out of caution - if the strongest intervention is a wording change or a visual prominence change, use text_replace or style_change accordingly.

Decision rule - ask in this order:
1. Does the recommendation primarily say to CHANGE THE WORDING/MESSAGE of an existing button or link (different verb, framing, urgency phrase replacing the current label)? -> "text_replace".
   Example: recommendation "change 'Sign up' to 'Start free - no card needed'" -> text_replace, element_find_text="Sign up", variant_text="Start free - no card needed".
2. Else, does it primarily say to make an existing element MORE/LESS VISUALLY PROMINENT (bigger, bolder, higher-contrast color, more padding, more rounded) WITHOUT changing its wording or adding new content? -> "style_change".
   Example: recommendation "make the primary CTA stand out more with a stronger color and larger size" -> style_change on that CTA, style_changes={"backgroundColor":"#1A3A2A","fontSize":"18px","padding":"14px 28px"}.
3. Else, does it primarily say to ADD a new short piece of text near an element (trust badge, social proof count, urgency note, guarantee) while leaving the element itself unchanged? -> "insert_element".
   Example: recommendation "add social proof near the signup button" -> insert_element, element_find_text="Create account", variant_text="Join 12,847 teams this week", position="after".
4. If the recommendation needs multiple of the above combined, or needs new forms/steps/conditional logic/layout reorganization that can't be captured by ONE of the three types -> "testable": false, "type": null.

Field rules per type:
- "text_replace": set control_text (current label) and variant_text (new label). Leave position/style_changes null.
- "style_change": set style_changes (1-3 properties from the whitelist: backgroundColor, color, fontSize, fontWeight, padding, borderRadius, border). Leave control_text/variant_text/position null.
- "insert_element": set variant_text (plain text, max ~80 chars, no HTML) and position ("before" or "after"). Leave control_text/style_changes null.
- element_find_text MUST exactly match text from one of the click events provided whenever testable is true, for all types.`
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
