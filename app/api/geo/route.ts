import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@/lib/anthropic'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { url, content, keywords } = await req.json()

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
      system: `You are VeroBehavior's GEO (Generative Engine Optimization) analyst.
Analyze website content for AI search visibility and machine readability.
Evaluate how well the content would appear in ChatGPT, Perplexity, and Google SGE responses.
Respond ONLY with valid JSON.`,
      messages: [
        {
          role: 'user',
          content: `Analyze this webpage for GEO/AEO optimization:

URL: ${url || 'Not provided'}
Target keywords: ${keywords?.join(', ') || 'Not specified'}
Page content excerpt: ${content?.slice(0, 2000) || 'Not provided'}

Return JSON:
{
  "machineReadabilityScore": 0-100,
  "chatgptVisibility": 0-100,
  "perplexityRanking": 0-100,
  "sgePresence": 0-100,
  "issues": [
    { "severity": "high|medium|low", "issue": "description", "fix": "how to fix" }
  ],
  "recommendations": [
    { "type": "JSON-LD|meta|content|structure", "action": "specific action", "impact": "expected impact" }
  ],
  "overallGrade": "A|B|C|D|F"
}`,
        },
      ],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const data = JSON.parse(raw.replace(/```json\n?|\n?```/g, '').trim())
    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
