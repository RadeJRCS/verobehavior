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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      clientKey, sessionId, pageContext, events,
      sessionDuration, scrollDepth, referral, activeTests
    } = body

    if (!clientKey || !events || events.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers: CORS })
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const systemPrompt = `You are a behavioral psychology expert and conversion rate optimization (CRO) specialist. You analyze user session data from websites and provide insights based on cognitive psychology, behavioral economics, and UX research.

Your analysis must:
1. Identify the psychological state of the user (hesitating, comparing, high_intent, browsing, converted, engaged)
2. Detect behavioral patterns that indicate specific psychological phenomena
3. Provide actionable recommendations grounded in behavioral science
4. Cite specific psychological principles (Hick's Law, Zeigarnik Effect, Social Proof, Loss Aversion, Commitment Bias, Information Scent Theory, Cognitive Load Theory, etc.)
5. Estimate conversion lift ranges based on the recommended interventions

Always respond in valid JSON format only. No markdown, no code blocks, just raw JSON.`

    const userPrompt = `Analyze this user session:

Client: ${clientKey}
Page: ${pageContext}
Session duration: ${sessionDuration}s
Scroll depth: ${scrollDepth}%
Referral: ${referral || 'direct'}
Active A/B tests: ${JSON.stringify(activeTests || [])}

Events (chronological):
${JSON.stringify(events, null, 2)}

Respond with this exact JSON structure:
{
  "state": "one of: browsing, engaged, hesitating, comparing, high_intent, converted",
  "intent_score": number from 0-99,
  "conversion_probability": number from 0-100,
  "tags": ["array", "of", "behavioral", "tags", "max 4"],
  "insight_type": "one of: FRICTION, CONVERSION_EVENT, DECISION_FATIGUE, HIGH_INTENT, SOCIAL_PROOF_SEEKING, BOUNCE_RISK, COMPARISON_BEHAVIOR",
  "insight_text": "2-4 sentences describing the psychological behavior observed. Be specific about what the user did and what it means psychologically.",
  "insight_principle": "Name of the psychological principle(s) with brief explanation",
  "recommendation": "Specific, actionable recommendation for the website owner. Include exact copy suggestions where relevant.",
  "estimated_lift": "+X-Y% metric description"
}`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const rawText = response.content[0].type === 'text' ? response.content[0].text : ''
    let analysis

    try {
      const clean = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      analysis = JSON.parse(clean)
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500, headers: CORS })
    }

    // Save to Supabase
    const supabase = getSupabase()
    const { error: dbError } = await supabase.from('sessions').insert([{
      client_key: clientKey,
      page_context: pageContext || '',
      session_duration: sessionDuration || 0,
      scroll_depth: scrollDepth || 0,
      state: analysis.state || 'browsing',
      intent_score: analysis.intent_score || 0,
      conversion_probability: analysis.conversion_probability || 0,
      tags: analysis.tags || [],
      insight_type: analysis.insight_type || '',
      insight_text: analysis.insight_text || '',
      insight_principle: analysis.insight_principle || '',
      recommendation: analysis.recommendation || '',
      estimated_lift: analysis.estimated_lift || '',
      events: events || [],
    }])

    if (dbError) console.error('Supabase insert error:', dbError.message)

    return NextResponse.json({ success: true, analysis }, { headers: CORS })
  } catch (err: unknown) {
    console.error('Analyze error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500, headers: CORS }
    )
  }
}
