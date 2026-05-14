import { NextRequest, NextResponse } from 'next/server'
import { anthropic, PSYCH_SYSTEM_PROMPT } from '@/lib/anthropic'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { events, pageContext, sessionDuration, scrollDepth, apiKey } = await req.json()
    const clientKey = apiKey || req.headers.get('x-vb-key') || 'demo'

    if (!events || events.length === 0) {
      return NextResponse.json({ error: 'No events provided' }, { status: 400 })
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
      system: PSYCH_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Analyze this user session from an e-commerce product page:

Page context: ${pageContext || 'Unknown page'}
Session duration: ${sessionDuration || 0} seconds
Scroll depth: ${scrollDepth || 0}%
Behavioral events (chronological): ${JSON.stringify(events, null, 2)}

Return JSON in this exact structure:
{
  "state": "browsing|engaged|hesitating|comparing|high_intent|converted",
  "intentScore": 0-100,
  "conversionProbability": 0-100,
  "tags": ["tag1", "tag2", "tag3"],
  "insight": {
    "type": "ENGAGEMENT|HESITATION|SOCIAL PROOF|DECISION FATIGUE|CONVERSION EVENT|FRICTION",
    "text": "2-3 sentences explaining the psychological behavior observed",
    "principle": "principle name and brief explanation"
  },
  "recommendation": "Specific A/B test or UX change to improve conversion",
  "estimatedLift": "e.g. +15-22% add-to-cart rate"
}`,
        },
      ],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim()
    const data = JSON.parse(cleaned)

    // Save to Supabase
    await supabase.from('sessions').insert({
      client_key: clientKey,
      page_context: pageContext || 'Unknown',
      session_duration: sessionDuration || 0,
      scroll_depth: scrollDepth || 0,
      state: data.state,
      intent_score: data.intentScore,
      conversion_probability: data.conversionProbability,
      tags: data.tags || [],
      insight_type: data.insight?.type,
      insight_text: data.insight?.text,
      insight_principle: data.insight?.principle,
      recommendation: data.recommendation,
      estimated_lift: data.estimatedLift,
      events: events,
    })

    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-vb-key',
      },
    })
  } catch (err: unknown) {
    console.error('Analyze error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-vb-key',
    },
  })
}
