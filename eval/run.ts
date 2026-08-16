// Eval runner — calls the Anthropic API directly with the SAME prompt
// source as production (lib/analyze/prompt.ts), against the golden set.
// Does NOT touch /api/analyze, does NOT touch Supabase. Writes raw results
// to eval/results/run-<timestamp>.json for offline scoring (eval/score.ts).
// Mirrors the MIN_EVENTS_FOR_ANALYSIS threshold from the API route: sessions
// below it are marked skipped_below_threshold and never reach the AI.
//
// Usage (from project root):
//   npx tsx eval/run.ts [options]
//
// Options:
//   --sessions, -s   comma-separated session ids to run (default: all)
//   --repeat, -r     number of repetitions per session (default: 1)
//   --temperature,-t sampling temperature to pass (default: unset, i.e. the
//                    API's own default, currently 1.0 for Claude models)
//   --model, -m      override the model string from lib/analyze/prompt.ts
//   --out            output directory (default: eval/results)
//
// Examples:
//   npx tsx eval/run.ts                                   # full golden set, 1x, default temp
//   npx tsx eval/run.ts --sessions id1,id2,id3 --repeat 5  # consistency check on 3 sessions, 5x each
//   npx tsx eval/run.ts --temperature 0.3                  # full golden set at temp 0.3

import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import Anthropic from '@anthropic-ai/sdk'
import {
  SYSTEM_PROMPT,
  buildUserPrompt,
  MODEL,
  MAX_TOKENS,
  MIN_EVENTS_FOR_ANALYSIS,
  COLLECTING_DATA_INSIGHT_TYPE,
  COLLECTING_DATA_TEXT,
  type AnalyzeSessionInput,
} from '../lib/analyze/prompt'

// Plain Node/tsx scripts don't get Next.js's automatic .env.local loading,
// so this script loads it explicitly. .env.local is gitignored — see
// eval/README or ask for setup instructions if it doesn't exist yet.
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

type GoldenSession = {
  id: string
  source: 'real' | 'constructed'
  client_key: string
  scenario_target?: string
  scenario_note?: string
  input: AnalyzeSessionInput
  reference?: Record<string, unknown>
}

type CliArgs = {
  temperature: number | undefined
  repeat: number
  sessionIds: string[] | null
  model: string
  outDir: string
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { temperature: undefined, repeat: 1, sessionIds: null, model: MODEL, outDir: 'eval/results' }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--temperature' || a === '-t') args.temperature = parseFloat(argv[++i])
    else if (a === '--repeat' || a === '-r') args.repeat = parseInt(argv[++i], 10)
    else if (a === '--sessions' || a === '-s') args.sessionIds = argv[++i].split(',').map((s) => s.trim())
    else if (a === '--model' || a === '-m') args.model = argv[++i]
    else if (a === '--out') args.outDir = argv[++i]
    else if (a === '--help' || a === '-h') {
      console.log('See the usage comment at the top of eval/run.ts')
      process.exit(0)
    }
  }
  return args
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('Missing ANTHROPIC_API_KEY in environment. Set it before running this script.')
    process.exit(1)
  }

  const goldenSetPath = path.join(__dirname, 'golden-set.json')
  const goldenSet: { sessions: GoldenSession[] } = JSON.parse(fs.readFileSync(goldenSetPath, 'utf8'))

  let sessions = goldenSet.sessions
  if (args.sessionIds) {
    const wanted = args.sessionIds
    sessions = sessions.filter((s) => wanted.includes(s.id))
    const missing = wanted.filter((id) => !sessions.find((s) => s.id === id))
    if (missing.length) console.warn('Warning: session ids not found in golden set, skipping:', missing.join(', '))
  }
  if (sessions.length === 0) {
    console.error('No matching sessions to run. Check --sessions ids.')
    process.exit(1)
  }

  const totalCalls = sessions.length * args.repeat
  console.log(`Model: ${args.model}`)
  console.log(`Temperature: ${args.temperature ?? '(API default)'}`)
  console.log(`Sessions: ${sessions.length} x repeat ${args.repeat} = ${totalCalls} API calls\n`)

  const anthropic = new Anthropic({ apiKey })
  const results: Record<string, unknown>[] = []
  let callIndex = 0

  for (const session of sessions) {
    for (let rep = 0; rep < args.repeat; rep++) {
      callIndex++
      const startedAt = Date.now()

      // Mirrors the server-side threshold in app/api/analyze/route.ts —
      // sessions this thin never reach the AI in production, so eval
      // shouldn't call it either. Keeps eval and production in lockstep,
      // and lets score.ts verify the threshold actually saves the call.
      if (session.input.events.length < MIN_EVENTS_FOR_ANALYSIS) {
        results.push({
          session_id: session.id,
          client_key: session.client_key,
          source: session.source,
          scenario_target: session.scenario_target ?? null,
          repeat_index: rep,
          temperature: args.temperature ?? null,
          model: args.model,
          elapsed_ms: Date.now() - startedAt,
          usage: null,
          raw_text: null,
          parsed: {
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
          },
          parse_ok: true,
          error: null,
          skipped_below_threshold: true,
        })
        console.log(
          `[${callIndex}/${totalCalls}] ${session.id} (rep ${rep + 1}/${args.repeat}) SKIPPED — ${session.input.events.length} events < ${MIN_EVENTS_FOR_ANALYSIS}, no AI call made`
        )
        continue
      }

      try {
        const response = await anthropic.messages.create({
          model: args.model,
          max_tokens: MAX_TOKENS,
          ...(args.temperature !== undefined ? { temperature: args.temperature } : {}),
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: buildUserPrompt(session.input) }],
        })
        const elapsedMs = Date.now() - startedAt
        const block = response.content[0]
        const rawText = block && block.type === 'text' ? block.text : ''

        let parsed: unknown = null
        try {
          parsed = JSON.parse(rawText)
        } catch {
          try {
            parsed = JSON.parse(rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
          } catch {
            const m = rawText.match(/\{[\s\S]*\}/)
            if (m) {
              try {
                parsed = JSON.parse(m[0])
              } catch {}
            }
          }
        }

        results.push({
          session_id: session.id,
          client_key: session.client_key,
          source: session.source,
          scenario_target: session.scenario_target ?? null,
          repeat_index: rep,
          temperature: args.temperature ?? null,
          model: args.model,
          elapsed_ms: elapsedMs,
          usage: response.usage,
          raw_text: rawText,
          parsed,
          parse_ok: parsed !== null,
          error: null,
        })
        console.log(
          `[${callIndex}/${totalCalls}] ${session.id} (rep ${rep + 1}/${args.repeat}) ok — ${elapsedMs}ms, in=${response.usage?.input_tokens} out=${response.usage?.output_tokens}`
        )
      } catch (err) {
        const elapsedMs = Date.now() - startedAt
        const message = err instanceof Error ? err.message : String(err)
        results.push({
          session_id: session.id,
          client_key: session.client_key,
          source: session.source,
          scenario_target: session.scenario_target ?? null,
          repeat_index: rep,
          temperature: args.temperature ?? null,
          model: args.model,
          elapsed_ms: elapsedMs,
          usage: null,
          raw_text: null,
          parsed: null,
          parse_ok: false,
          error: message,
        })
        console.error(`[${callIndex}/${totalCalls}] ${session.id} (rep ${rep + 1}/${args.repeat}) ERROR — ${message}`)
      }
    }
  }

  fs.mkdirSync(args.outDir, { recursive: true })
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const outPath = path.join(args.outDir, `run-${timestamp}.json`)
  fs.writeFileSync(outPath, JSON.stringify({ ran_at: new Date().toISOString(), args, results }, null, 2))

  const totalIn = results.reduce((s, r) => s + (((r.usage as { input_tokens?: number } | null)?.input_tokens) || 0), 0)
  const totalOut = results.reduce((s, r) => s + (((r.usage as { output_tokens?: number } | null)?.output_tokens) || 0), 0)
  const errors = results.filter((r) => r.error).length
  const skipped = results.filter((r) => r.skipped_below_threshold).length
  const actualApiCalls = results.length - skipped

  console.log(`\nDone. ${results.length} sessions processed — ${actualApiCalls} actual API call(s), ${skipped} skipped below MIN_EVENTS_FOR_ANALYSIS, ${errors} error(s).`)
  console.log(`Total tokens: ${totalIn} in / ${totalOut} out (skipped sessions cost nothing).`)
  console.log(`Results saved to: ${outPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
