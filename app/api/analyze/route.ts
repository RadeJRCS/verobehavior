import { NextRequest, NextResponse } from 'next/server'
import { anthropic, PSYCH_SYSTEM_PROMPT } from '@/lib/anthropic'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { events, pageContext, sessionDuration, scrollDepth } = await req.json()

    if (!events || events.length === 0) {
      return NextResponse.json({ error: 'No events provided' }, { status: 400 })
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: PSYCH_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Analyze this user session from an e-commerce product page:

Page context: ${pageContext || 'E-commerce product page'}
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
    "principle": "Principle name and brief explanation"
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

    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
