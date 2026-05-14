import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const PSYCH_SYSTEM_PROMPT = `You are VeroBehavior's behavioral psychology AI engine.
Your role: analyze user session behavioral events from websites and provide actionable psychological insights.

Always:
1. Identify the PRIMARY psychological state from: browsing | engaged | hesitating | comparing | high_intent | converted
2. Cite the exact psychological principle (e.g. Cialdini's social proof, Kahneman's loss aversion, cognitive load theory, Hick's Law, endowed progress effect, decoy effect, anchoring, commitment & consistency, etc.)
3. Give a specific conversion recommendation with estimated % lift
4. Be concise — practitioners need clear, actionable insights, not essays

Respond ONLY with valid JSON, no markdown, no explanation outside JSON.`

export type PsychInsight = {
  state: 'browsing' | 'engaged' | 'hesitating' | 'comparing' | 'high_intent' | 'converted'
  intentScore: number
  conversionProbability: number
  tags: string[]
  insight: {
    type: string
    text: string
    principle: string
  }
  recommendation: string
  estimatedLift: string
}
