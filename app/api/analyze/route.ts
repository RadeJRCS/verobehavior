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

Event types you may see, and what they typically indicate:
- "click" / "conversion": a click on a button or link. data.text is the label, data.relatedText (if present) is the text of associated content (e.g. an FAQ answer).
- "rage_click": 3+ rapid clicks on the same element within a second. Strong friction or bounce risk signal, the visitor expected something to happen and it did not.
- "scroll_milestone": the visitor reached data.percent of the page (25/50/75/100). Look at the timestamps (ts, in ms) between milestones, large gaps mean slow/careful reading or hesitation, small gaps mean fast scanning. If 100 never appears, the visitor did not reach the bottom of the page.
- "hover": the cursor stayed over data.tag (often an image, price, or rating/review element) for data.durationMs without clicking. Long hovers on images often mean the visitor cannot get information another way (cannot physically inspect the product) and is compensating visually. Long hovers on prices or ratings often mean price or trust evaluation.
- "section_view": a heading, pricing, plan, testimonial, review, or FAQ section was in view for data.durationMs before scrolling past it. A very short durationMs on a pricing or testimonial section means the visitor scrolled past it without really reading it.
- "exit_intent": the cursor moved toward the top of the browser window (toward closing the tab or navigating away). A meaningful bounce risk signal, especially if it happens before any conversion-like click.
- "form_focus": the visitor focused a form field, named in data.field.

Use the sequence and timing of these events together, not any single event in isolation, to decide the state and insight below.

Events: ${JSON.stringify(events.slice(-25))}

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
    "actions": [
      {
        "type": "text_replace" | "insert_element" | "style_change",
        "element_find_text": "exact text of an existing button/link/element from the events that this change targets (must match text seen in events)",
        "control_text": "for text_replace: current/original text of the element. For insert_element/style_change: null",
        "variant_text": "for text_replace: the new text to test. For insert_element: the text content to inject (badge/banner text only, plain text no HTML, max ~80 chars). For style_change: null",
        "position": "for insert_element only: 'before' or 'after' the anchor element. Otherwise null",
        "style_changes": "for style_change only: an object with CSS properties to change, ONLY from this whitelist: backgroundColor, color, fontSize, fontWeight, padding, borderRadius, border. Use valid CSS values as strings, e.g. {\"backgroundColor\": \"#1A3A2A\", \"fontSize\": \"18px\"}. Otherwise null"
      }
    ],
    "hypothesis": "one or two sentences: what psychological principle this change (or combination of changes) leverages and expected effect"
  }
}

IMPORTANT for ab_test_config - the actions must follow from the psychological reasoning above, not be chosen for variety or padded for completeness. For THIS specific session, decide what the single most effective testable intervention is given the insight_principle and recommendation. Usually this is ONE action. Only include MULTIPLE actions (up to 3) if the recommendation genuinely describes a combination that should be tested together (e.g. "reword the CTA AND make it more prominent" -> one text_replace action + one style_change action on the same element). Do not default to "insert_element" out of caution - if the strongest intervention is a wording change or a visual prominence change, use text_replace or style_change accordingly.

For each action, ask in this order:
1. Does it primarily say to CHANGE THE WORDING/MESSAGE of an existing button or link (different verb, framing, urgency phrase replacing the current label)? -> "text_replace".
   Example: recommendation "change 'Sign up' to 'Start free - no card needed'" -> one action: text_replace, element_find_text="Sign up", control_text="Sign up", variant_text="Start free - no card needed".
2. Else, does it primarily say to make an existing element MORE/LESS VISUALLY PROMINENT (bigger, bolder, higher-contrast color, more padding, more rounded) WITHOUT changing its wording or adding new content? -> "style_change".
   Example: recommendation "make the primary CTA stand out more with a stronger color and larger size" -> one action: style_change on that CTA, style_changes={"backgroundColor":"#1A3A2A","fontSize":"18px","padding":"14px 28px"}.
3. Else, does it primarily say to ADD a new short piece of text near an element (trust badge, reassurance, urgency note, guarantee) while leaving the element itself unchanged? -> "insert_element".
   Example: recommendation "reassure visitors that no card is required" -> one action: insert_element, element_find_text="Create account", variant_text="No credit card required", position="after".
4. If the recommendation genuinely combines two of the above on the same or related elements (e.g. reword AND restyle a button, or restyle a button AND add a badge near it), include both as separate actions in the array, each targeting an element_find_text that matches an event.
5. If the recommendation needs new forms/steps/conditional logic/layout reorganization that cannot be captured by 1-3 actions of the types above -> "testable": false, "actions": [].

Field rules per action type:
- "text_replace": set control_text (current label) and variant_text (new label). Leave position/style_changes null.
  If element_find_text reads as a question or ends with an expand/arrow icon character (it looks like an FAQ or accordion item), there are two valid approaches:
  (a) Reword the SAME underlying question or claim with different framing (tone, emphasis, reassurance), keeping it answerable by the existing content beneath it. This is a single action and is the default choice.
  (b) Only if the click event for that element includes a non-empty "relatedText" field (the text of the answer/content associated with it), and the recommendation genuinely calls for asking something different (not just a different tone), you may add a SECOND text_replace action: element_find_text = the relatedText value exactly, control_text = the same relatedText value, variant_text = a rewritten version of that text that stays coherent with the new question from the first action and is roughly the same length. Use (b) only when (a) would not make sense, most tests should still be a single action.
  Do not include any trailing arrow/chevron icon character in variant_text for the question element, it is preserved automatically.
- "style_change": set style_changes (1-3 properties from the whitelist: backgroundColor, color, fontSize, fontWeight, padding, borderRadius, border). Leave control_text/variant_text/position null.
- "insert_element": set variant_text (plain text, max ~80 chars, no HTML) and position ("before" or "after"). Leave control_text/style_changes null.
  ETHICS CONSTRAINT, no exceptions: variant_text must never invent a specific number, count, name, timeframe, or claim that is not present anywhere in the page content or events provided (no fabricated "Join 12,847 teams", "4.9/5 from 2,300 reviews", "14 people viewing this now", fake countdowns, or invented testimonials). If the recommendation calls for social proof, urgency, or a statistic and no real figure is available from the page/events, either: (a) write variant_text as a true, general statement that requires no number (e.g. "No credit card required", "Cancel anytime", "Trusted by teams worldwide"), or (b) write variant_text using a clearly marked placeholder for the client to fill in with their real data (e.g. "Join [X] teams already using this"), or (c) if neither fits, set this action's type to something else or omit it and rely on testable: false with the recommendation describing what real data the client should surface.
- element_find_text MUST exactly match text from one of the click events provided whenever testable is true, for every action. For action (b) above, element_find_text matches the event's relatedText field instead of its text field.`
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
