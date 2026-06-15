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

type SessionRow = {
  id: string; client_key: string; state: string; tags: string[]
  insight_type: string; insight_text: string; recommendation: string
  estimated_lift: string; page_context: string
  ab_test_config: {
    testable: boolean
    actions: Array<{ type: string; element_find_text: string; control_text: string | null; variant_text: string | null; position: string | null; style_changes: Record<string, string> | null }>
    hypothesis: string | null
  } | null
  events: Array<{ type: string; data: { text?: string } }>
}

// Group sessions into patterns by client_key + state + insight_type
function groupSessions(sessions: SessionRow[]) {
  const groups = new Map<string, SessionRow[]>()
  for (const s of sessions) {
    if (!s.state || !s.insight_type) continue
    const key = `${s.client_key}__${s.state}__${s.insight_type}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(s)
  }
  return groups
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(req.url)
    const clientKey = searchParams.get('key')
    const minSize = parseInt(searchParams.get('minSize') || '3')

    let query = supabase.from('sessions').select('id, client_key, state, tags, insight_type, insight_text, recommendation, estimated_lift, page_context, ab_test_config, events').order('created_at', { ascending: false }).limit(200)
    if (clientKey) query = query.eq('client_key', clientKey)

    const { data, error } = await query
    if (error) throw error

    const sessions = (data || []) as SessionRow[]
    const totalByClient = sessions.reduce((acc: Record<string, number>, s) => {
      acc[s.client_key] = (acc[s.client_key] || 0) + 1
      return acc
    }, {})

    const groups = groupSessions(sessions)
    const patterns = []

    for (const [key, group] of groups.entries()) {
      if (group.length < minSize) continue
      const [client_key, state, insight_type] = key.split('__')
      const total = totalByClient[client_key] || group.length
      const percentage = Math.round((group.length / total) * 100)

      // Common tags across the group
      const tagCounts: Record<string, number> = {}
      group.forEach(s => (s.tags || []).forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1 }))
      const commonTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([t]) => t)

      // Most common page
      const pageCounts: Record<string, number> = {}
      group.forEach(s => { const p = (s.page_context || '').split(' | ')[1] || ''; if (p) pageCounts[p] = (pageCounts[p] || 0) + 1 })
      const topPage = Object.entries(pageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || ''

      // Pick the most common testable ab_test_config (by its actions signature)
      const testableConfigs = group.map(s => s.ab_test_config).filter(c => c && c.testable && c.actions && c.actions.length > 0)
      const configCounts: Record<string, number> = {}
      testableConfigs.forEach(c => { const k = JSON.stringify(c!.actions); configCounts[k] = (configCounts[k] || 0) + 1 })
      const topConfigKey = Object.entries(configCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
      const topConfig = topConfigKey ? testableConfigs.find(c => JSON.stringify(c!.actions) === topConfigKey) : null

      patterns.push({
        id: key,
        client_key, state, insight_type,
        session_count: group.length,
        total_sessions: total,
        percentage,
        common_tags: commonTags,
        top_page: topPage,
        sample_insights: group.slice(0, 3).map(s => s.insight_text),
        sample_recommendations: [...new Set(group.map(s => s.recommendation))].slice(0, 3),
        ab_test_config: topConfig || null,
        estimated_lift: group.find(s => s.estimated_lift)?.estimated_lift || '',
      })
    }

    patterns.sort((a, b) => b.session_count - a.session_count)

    return NextResponse.json({ patterns }, { headers: CORS })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500, headers: CORS })
  }
}

// POST: generate a consolidated AI summary for a specific pattern
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { clientKey, state, insightType, sampleInsights, sampleRecommendations, sessionCount, percentage, topPage } = body

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: 'You are a behavioral psychology and CRO expert. Respond ONLY with valid JSON, no markdown.',
      messages: [{
        role: 'user',
        content: `Analyze this recurring behavioral pattern detected across multiple user sessions on the same website.

Client: ${clientKey}
Pattern: ${sessionCount} sessions (${percentage}% of all tracked sessions) classified as "${state}" / "${insightType}"
Page: ${topPage}

Sample individual insights from these sessions:
${(sampleInsights || []).map((t: string, i: number) => `${i + 1}. ${t}`).join('\n')}

Sample recommendations generated:
${(sampleRecommendations || []).map((t: string, i: number) => `${i + 1}. ${t}`).join('\n')}

Write ONE consolidated summary for this pattern across all affected sessions. Respond with JSON:
{
  "pattern_summary": "2-3 sentences describing the recurring behavioral pattern across this segment of users, written for a business owner",
  "principle": "The core psychological principle driving this pattern",
  "consolidated_recommendation": "ONE specific, actionable recommendation that addresses the pattern at scale",
  "priority": "high|medium|low based on session percentage and business impact"
}`
      }],
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text : ''
    let parsed
    try { parsed = JSON.parse(raw) } catch {
      try { parsed = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()) } catch {
        const m = raw.match(/\{[\s\S]*\}/); parsed = m ? JSON.parse(m[0]) : null
      }
    }

    if (!parsed) return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500, headers: CORS })

    return NextResponse.json({ pattern: parsed }, { headers: CORS })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500, headers: CORS })
  }
}
