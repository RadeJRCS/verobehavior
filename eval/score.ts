// Scoring script — reads a raw run file from eval/results/ and the golden
// set, and computes Test 4 (schema adherence), Test 1 (groundedness), and
// Test 3 (principle/type coverage). Pure local computation: no API calls,
// no network, no DB access. Test 1 is a programmatic (regex/lookup) check
// against the real event data, not an AI judgment call.
//
// Usage:
//   npx tsx eval/score.ts eval/results/run-<timestamp>.json

import fs from 'fs'
import path from 'path'
import { VALID_INSIGHT_TYPES, MIN_EVENTS_FOR_ANALYSIS, COLLECTING_DATA_INSIGHT_TYPE } from '../lib/analyze/prompt'

type AnalyzeEvent = { ts: number; type: string; data?: Record<string, unknown> }
type GoldenSession = {
  id: string
  source: 'real' | 'constructed'
  client_key: string
  scenario_target?: string
  input: { events: AnalyzeEvent[]; sessionDuration: number; scrollDepth: number }
}
type RunResult = {
  session_id: string
  client_key: string
  source: string
  scenario_target: string | null
  repeat_index: number
  parsed: {
    state?: string
    insight_type?: string
    insight_text?: string
    insight_principle?: string
    recommendation?: string
  } | null
  parse_ok: boolean
  error: string | null
  skipped_below_threshold?: boolean
}

const runPath = process.argv[2]
if (!runPath) {
  console.error('Usage: npx tsx eval/score.ts eval/results/run-<timestamp>.json')
  process.exit(1)
}

const run: { ran_at: string; results: RunResult[] } = JSON.parse(fs.readFileSync(runPath, 'utf8'))
const goldenSet: { sessions: GoldenSession[] } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'golden-set.json'), 'utf8')
)
const sessionById = new Map(goldenSet.sessions.map((s) => [s.id, s]))

// Threshold-skipped sessions never reached the AI — they don't belong in
// Test 1/3/4, which all measure AI OUTPUT quality. They get their own
// section below instead.
const skippedResults = run.results.filter((r) => r.skipped_below_threshold)
const aiResults = run.results.filter((r) => !r.skipped_below_threshold)
const results = aiResults.filter((r) => r.parse_ok && r.parsed)
console.log(`Loaded ${run.results.length} results (${skippedResults.length} threshold-skipped, ${results.length}/${aiResults.length} AI calls parsed OK) from ${runPath}\n`)

// =============================================================================
// THRESHOLD CHECK — MIN_EVENTS_FOR_ANALYSIS
// =============================================================================
console.log('='.repeat(78))
console.log(`THRESHOLD CHECK — MIN_EVENTS_FOR_ANALYSIS = ${MIN_EVENTS_FOR_ANALYSIS}`)
console.log('='.repeat(78) + '\n')

if (skippedResults.length === 0) {
  console.log('No sessions in this run were below the threshold (nothing to check here).\n')
} else {
  console.log(`${skippedResults.length} session(s) skipped — no AI call made, zero tokens spent:\n`)
  let allCorrect = true
  for (const r of skippedResults) {
    const golden = sessionById.get(r.session_id)
    const nEvents = golden ? golden.input.events.length : -1
    const gotSentinel = r.parsed?.insight_type === COLLECTING_DATA_INSIGHT_TYPE
    const noUsage = (r as unknown as { usage: unknown }).usage == null
    const ok = gotSentinel && noUsage && nEvents < MIN_EVENTS_FOR_ANALYSIS
    if (!ok) allCorrect = false
    console.log(`  ${ok ? '✓' : '✗'} ${r.session_id} — ${nEvents} events, insight_type="${r.parsed?.insight_type}", usage=${noUsage ? 'null (no API call)' : 'PRESENT (unexpected!)'}`)
  }
  console.log(`\n${allCorrect ? 'Threshold working correctly on all skipped sessions.' : 'MISMATCH — see ✗ above.'}`)
}
console.log()

// =============================================================================
// TEST 4 — schema adherence
// =============================================================================
// Enum imported from lib/analyze/prompt.ts — the same canonical list the
// API route normalizes against, so eval and production can never drift.
const VALID_STATES = ['browsing', 'engaged', 'hesitating', 'comparing', 'high_intent', 'converted']

function scoreEnumField(values: string[], validSet: readonly string[], caseSensitive: boolean) {
  const counts: Record<string, number> = {}
  values.forEach((v) => { counts[v] = (counts[v] || 0) + 1 })

  let exact = 0
  let formatOff = 0 // right "concept", wrong formatting (spaces vs underscore, case)
  let outOfEnum = 0
  const offenders: { value: string; count: number; kind: 'format' | 'out_of_enum' }[] = []

  for (const [value, count] of Object.entries(counts)) {
    const isExact = caseSensitive ? validSet.includes(value) : validSet.map((v) => v.toLowerCase()).includes(value.toLowerCase())
    if (isExact && validSet.includes(value)) {
      exact += count
      continue
    }
    // format-off check: normalize spaces->underscore, uppercase, and see if it now matches
    const normalized = value.trim().toUpperCase().replace(/\s+/g, '_')
    const normalizedValid = validSet.map((v) => v.toUpperCase())
    if (normalizedValid.includes(normalized)) {
      formatOff += count
      offenders.push({ value, count, kind: 'format' })
    } else {
      outOfEnum += count
      offenders.push({ value, count, kind: 'out_of_enum' })
    }
  }

  return { counts, exact, formatOff, outOfEnum, offenders, total: values.length }
}

console.log('='.repeat(78))
console.log('TEST 4 — SCHEMA ADHERENCE')
console.log('='.repeat(78))

const insightTypes = results.map((r) => r.parsed!.insight_type || '(missing)')
const it = scoreEnumField(insightTypes, VALID_INSIGHT_TYPES, true)
console.log(`\ninsight_type — enum: ${VALID_INSIGHT_TYPES.join(' | ')}\n`)
console.log('All values seen:')
Object.entries(it.counts).sort((a, b) => b[1] - a[1]).forEach(([v, c]) => {
  const valid = (VALID_INSIGHT_TYPES as readonly string[]).includes(v)
  console.log(`  ${valid ? '✓' : '✗'} "${v}" — ${c}`)
})
console.log(`\nExact match: ${it.exact}/${it.total} (${((it.exact / it.total) * 100).toFixed(1)}%)`)
console.log(`Format error (right concept, wrong format): ${it.formatOff}/${it.total} (${((it.formatOff / it.total) * 100).toFixed(1)}%)`)
console.log(`Out of enum entirely: ${it.outOfEnum}/${it.total} (${((it.outOfEnum / it.total) * 100).toFixed(1)}%)`)
if (it.offenders.length) {
  console.log('\nOffenders:')
  it.offenders.forEach((o) => console.log(`  [${o.kind}] "${o.value}" x${o.count}`))
}

const states = results.map((r) => r.parsed!.state || '(missing)')
const st = scoreEnumField(states, VALID_STATES, true)
console.log(`\n\nstate — enum: ${VALID_STATES.join(' | ')}\n`)
console.log('All values seen:')
Object.entries(st.counts).sort((a, b) => b[1] - a[1]).forEach(([v, c]) => {
  const valid = VALID_STATES.includes(v)
  console.log(`  ${valid ? '✓' : '✗'} "${v}" — ${c}`)
})
console.log(`\nExact match: ${st.exact}/${st.total} (${((st.exact / st.total) * 100).toFixed(1)}%)`)
if (st.offenders.length) {
  console.log('\nOffenders:')
  st.offenders.forEach((o) => console.log(`  [${o.kind}] "${o.value}" x${o.count}`))
}

// =============================================================================
// TEST 1 — groundedness (programmatic, not AI)
// =============================================================================
console.log('\n\n' + '='.repeat(78))
console.log('TEST 1 — GROUNDEDNESS')
console.log('='.repeat(78) + '\n')

// Keywords that, if mentioned, should correspond to at least one real event
// of a matching type in that session. Loose but defensible: each keyword
// maps to the raw event .type strings that would justify the claim.
// NOTE: scroll milestones are deliberately NOT in this map. scrollDepth is
// given to the model directly as ground-truth input data (not inferred from
// an event), so mentioning it is not a groundedness claim about events — it
// gets its own numeric check further down instead.
const KEYWORD_EVENT_MAP: [RegExp, string[], string][] = [
  [/\bexit[- ]intent\b/i, ['exit_intent'], 'exit intent'],
  [/\brage[- ]click/i, ['rage_click'], 'rage click'],
  [/\bwishlist(ed|ing)?\b/i, ['wishlist'], 'wishlist'],
  [/\badd(ed|ing)? to cart\b|\badd-?to-?cart\b/i, ['add_to_cart', 'click'], 'add to cart'],
  [/\bform (field|focus)|\bfocused (a|the) (field|form)/i, ['form_focus'], 'form focus'],
  [/\bvariant|\bbundle (option|toggl)|\bcolor (change|toggl|switch)/i, ['variant_change'], 'variant change'],
  [/\bthumbnail|\bthumb click/i, ['thumb_click'], 'thumbnail click'],
]

// A keyword match preceded by a negation word ("no rage clicks...", "absence
// of any add-to-cart...") is the model correctly stating something did NOT
// happen — that's not a groundedness violation, so it must not be flagged.
const NEGATION_BEFORE_RE = /\b(no|not|none|zero|never|without|absent|absence of|lack of|lack|didn't|doesn't|nor)\b/i
// "X rather than Y" negates Y even though Y comes AFTER the negation cue —
// looked for separately in a window AFTER the match.
const RATHER_THAN_RE = /\brather than\b/i
function hasPositiveClaim(text: string, re: RegExp): boolean {
  const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')
  let m: RegExpExecArray | null
  while ((m = g.exec(text))) {
    const before = text.slice(Math.max(0, m.index - 40), m.index)
    const justBefore = text.slice(Math.max(0, m.index - 35), m.index)
    if (NEGATION_BEFORE_RE.test(before)) continue
    if (RATHER_THAN_RE.test(justBefore)) continue // "...rather than <match>"
    return true
  }
  return false
}

// Numeric claims like "3 times", "three times", "12 seconds" etc.
const WORD_NUMS: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 }
function extractCountClaims(text: string): { n: number; unit: string; match: string }[] {
  const claims: { n: number; unit: string; match: string }[] = []
  const digitRe = /\b(\d+)\s*(times?|clicks?|hovers?|seconds?|minutes?)\b/gi
  let m: RegExpExecArray | null
  while ((m = digitRe.exec(text))) claims.push({ n: parseInt(m[1], 10), unit: m[2].toLowerCase(), match: m[0] })
  const wordRe = new RegExp(`\\b(${Object.keys(WORD_NUMS).join('|')})\\s*(times?|clicks?|hovers?)\\b`, 'gi')
  while ((m = wordRe.exec(text))) claims.push({ n: WORD_NUMS[m[1].toLowerCase()], unit: m[2].toLowerCase(), match: m[0] })
  return claims
}

function maxRepeatedEventCount(events: AnalyzeEvent[]): number {
  const byTypeAndText: Record<string, number> = {}
  events.forEach((e) => {
    const text = (e.data && (e.data as { text?: string }).text) || ''
    const key = `${e.type}::${text}`
    byTypeAndText[key] = (byTypeAndText[key] || 0) + 1
  })
  const byTypeOnly: Record<string, number> = {}
  events.forEach((e) => { byTypeOnly[e.type] = (byTypeOnly[e.type] || 0) + 1 })
  return Math.max(0, ...Object.values(byTypeAndText), ...Object.values(byTypeOnly))
}

type Verdict = { session_id: string; n_events: number; verdict: 'GROUNDED' | 'SUSPECT'; reasons: string[] }
const verdicts: Verdict[] = []

for (const r of results) {
  const golden = sessionById.get(r.session_id)
  if (!golden) continue
  const events = golden.input.events
  const nEvents = events.length
  // Only insight_text is checked — it's the "what happened" field.
  // recommendation is prescriptive ("what to do next"), so phrases like "add
  // a color change on click" describe a proposed UI fix, not a claim about
  // what the visitor did — checking it against real events produces false
  // positives (confirmed: "color change" in a button-feedback recommendation
  // was being flagged as an ungrounded "variant change" claim).
  const combinedText = r.parsed!.insight_text || ''
  const reasons: string[] = []

  // "rage click" is sometimes a correct behavioral LABEL the model applies
  // to raw click data (e.g. 3x clicks on the same element within a few
  // seconds) even when the raw log only has generic "click" events, not a
  // dedicated rage_click type. Treat that real pattern as satisfying the
  // claim too, so a correct inference isn't flagged as ungrounded.
  function hasRageClickPattern(): boolean {
    const clicks = events.filter((e) => e.type === 'click')
    const byText = new Map<string, number[]>()
    clicks.forEach((e) => {
      const text = (e.data && (e.data as { text?: string }).text) || ''
      if (!byText.has(text)) byText.set(text, [])
      byText.get(text)!.push(e.ts)
    })
    for (const timestamps of byText.values()) {
      if (timestamps.length < 3) continue
      timestamps.sort((a, b) => a - b)
      for (let i = 0; i + 2 < timestamps.length; i++) {
        if (timestamps[i + 2] - timestamps[i] <= 5000) return true
      }
    }
    return false
  }

  // keyword -> event-type presence check (skip claims that are actually
  // negations, e.g. "no rage clicks or exit intent appeared")
  for (const [re, eventTypes, label] of KEYWORD_EVENT_MAP) {
    if (hasPositiveClaim(combinedText, re)) {
      const hasEvent = events.some((e) => eventTypes.includes(e.type))
      const hasPattern = label === 'rage click' && hasRageClickPattern()
      if (!hasEvent && !hasPattern) reasons.push(`mentions "${label}" but no ${eventTypes.join('/')} event exists in this session`)
    }
  }

  // scrollDepth is provided directly as ground-truth input (not an event) —
  // check any numeric % claim against the real value, and check "zero/no
  // scroll" phrasing against a real scrollDepth that contradicts it.
  const scrollPctRe = /(\d+)%\s*scroll(?:ed|ing)?(?:\s*depth)?|scroll(?:ed|ing)?\s*depth\s*(?:of\s*)?(\d+)%/gi
  let sm: RegExpExecArray | null
  while ((sm = scrollPctRe.exec(combinedText))) {
    const claimed = parseInt(sm[1] || sm[2], 10)
    if (Math.abs(claimed - golden.input.scrollDepth) > 10) {
      reasons.push(`claims ${claimed}% scroll depth but actual scrollDepth is ${golden.input.scrollDepth}%`)
    }
  }
  if (/\bzero scroll\b|\bno scroll(ing)?\b|\bdidn'?t scroll\b|\bwithout scrolling\b/i.test(combinedText) && golden.input.scrollDepth > 10) {
    reasons.push(`claims no/zero scrolling but actual scrollDepth is ${golden.input.scrollDepth}%`)
  }

  // numeric "N times/clicks/hovers" claims
  const countClaims = extractCountClaims(combinedText).filter((c) => /times?|clicks?|hovers?/.test(c.unit))
  const maxRepeat = maxRepeatedEventCount(events)
  for (const c of countClaims) {
    if (c.n > Math.max(maxRepeat, nEvents)) {
      reasons.push(`claims "${c.match}" but session has only ${nEvents} events total (max repeated same type/text: ${maxRepeat})`)
    }
  }

  // duration claims vs session_duration (generous tolerance: 2x or +30s, whichever larger)
  const durationClaims = extractCountClaims(combinedText).filter((c) => /seconds?|minutes?/.test(c.unit))
  for (const c of durationClaims) {
    const claimedSeconds = /minute/.test(c.unit) ? c.n * 60 : c.n
    const tolerance = Math.max(golden.input.sessionDuration * 1, 30)
    if (Math.abs(claimedSeconds - golden.input.sessionDuration) > tolerance) {
      reasons.push(`claims "${c.match}" (~${claimedSeconds}s) but actual session_duration is ${golden.input.sessionDuration}s`)
    }
  }

  verdicts.push({
    session_id: r.session_id,
    n_events: nEvents,
    verdict: reasons.length ? 'SUSPECT' : 'GROUNDED',
    reasons,
  })
}

const grounded = verdicts.filter((v) => v.verdict === 'GROUNDED').length
const suspect = verdicts.filter((v) => v.verdict === 'SUSPECT')
console.log(`GROUNDED: ${grounded}/${verdicts.length} (${((grounded / verdicts.length) * 100).toFixed(1)}%)`)
console.log(`SUSPECT:  ${suspect.length}/${verdicts.length} (${((suspect.length / verdicts.length) * 100).toFixed(1)}%)\n`)

if (suspect.length) {
  console.log('SUSPECT sessions (sorted by event count, fewest first):')
  suspect
    .sort((a, b) => a.n_events - b.n_events)
    .forEach((v) => {
      console.log(`\n  ${v.session_id} — ${v.n_events} events`)
      v.reasons.forEach((r) => console.log(`    - ${r}`))
    })
  const avgEventsSuspect = suspect.reduce((s, v) => s + v.n_events, 0) / suspect.length
  const avgEventsGrounded =
    verdicts.filter((v) => v.verdict === 'GROUNDED').reduce((s, v) => s + v.n_events, 0) / grounded
  console.log(`\nAvg events — SUSPECT: ${avgEventsSuspect.toFixed(1)} | GROUNDED: ${avgEventsGrounded.toFixed(1)}`)
}

// =============================================================================
// TEST 3 — principle / type coverage
// =============================================================================
console.log('\n\n' + '='.repeat(78))
console.log('TEST 3 — PRINCIPLE & TYPE COVERAGE')
console.log('='.repeat(78) + '\n')

const NORMALIZE_RULES: [RegExp, string][] = [
  [/social proof/i, 'Social Proof (Cialdini)'],
  [/commitment\s*(&|and)\s*consistency/i, 'Commitment & Consistency (Cialdini)'],
  [/hick'?s law|choice overload|paradox of choice|analysis paralysis|choice paradox/i, "Hick's Law / Choice Overload"],
  [/reactance theory|goal frustration/i, 'Reactance Theory'],
  [/information (foraging|scent)/i, 'Information Foraging / Scent Theory (Pirolli & Card)'],
  [/zeigarnik/i, 'Zeigarnik Effect'],
  [/loss aversion/i, 'Loss Aversion (Kahneman & Tversky)'],
  [/endowed progress/i, 'Endowed Progress Effect'],
  [/cognitive fluency/i, 'Cognitive Fluency Theory'],
  [/cognitive ease|dual process|system 1\s*\/?\s*system 2/i, 'Kahneman: Cognitive Ease / Dual Process'],
  [/cognitive load/i, 'Cognitive Load Theory'],
  [/elaboration likelihood/i, 'Elaboration Likelihood Model (Petty & Cacioppo)'],
  [/fogg/i, 'Fogg Behavior Model'],
  [/peak-end/i, 'Peak-End Rule'],
  [/dissonance/i, 'Cognitive / Post-Decision Dissonance'],
  [/price anchoring|anchoring bias/i, 'Anchoring (Price/Reference Point)'],
  [/operant conditioning|feedback loop/i, 'Operant Conditioning / Feedback Loop'],
]

function normalizePrinciple(raw: string): string {
  const primary = raw.split(/\s*(?:\+|combined with|:)\s*/i)[0]
  for (const [re, name] of NORMALIZE_RULES) {
    if (re.test(primary)) return name
  }
  return primary.trim()
}

console.log('Normalization mapping applied (first-listed theory wins for compound answers):')
NORMALIZE_RULES.forEach(([re, name]) => console.log(`  ${re} -> "${name}"`))
console.log('  (anything not matching a rule above is kept as its own bucket, using the text before the first "+"/"combined with"/":")\n')

const principleCounts: Record<string, number> = {}
const insightTypeCounts: Record<string, number> = {}
results.forEach((r) => {
  const norm = normalizePrinciple(r.parsed!.insight_principle || '(missing)')
  principleCounts[norm] = (principleCounts[norm] || 0) + 1
  const it2 = r.parsed!.insight_type || '(missing)'
  insightTypeCounts[it2] = (insightTypeCounts[it2] || 0) + 1
})

console.log(`Distinct normalized principles: ${Object.keys(principleCounts).length} (out of ${results.length} sessions)\n`)
Object.entries(principleCounts).sort((a, b) => b[1] - a[1]).forEach(([p, c]) => console.log(`  ${c}x  ${p}`))

console.log(`\n\nDistinct insight_type (raw, not normalized): ${Object.keys(insightTypeCounts).length}\n`)
Object.entries(insightTypeCounts).sort((a, b) => b[1] - a[1]).forEach(([t, c]) => console.log(`  ${c}x  ${t}`))

console.log('\n\nConstructed COMPARISON_BEHAVIOR sessions — did the model recognize them?\n')
results
  .filter((r) => r.scenario_target === 'COMPARISON_BEHAVIOR')
  .forEach((r) => {
    console.log(`  ${r.session_id}`)
    console.log(`    state: ${r.parsed!.state}`)
    console.log(`    insight_type: ${r.parsed!.insight_type}  ${r.parsed!.insight_type === 'COMPARISON_BEHAVIOR' ? '✓ MATCHES target' : '✗ does NOT match target (COMPARISON_BEHAVIOR)'}`)
    console.log(`    insight_principle: ${r.parsed!.insight_principle}`)
    console.log(`    insight_text: ${r.parsed!.insight_text}\n`)
  })

// =============================================================================
// TEST 2 — consistency (only meaningful when sessions were repeated)
// =============================================================================
function normalizeEnumFormat(v: string): string {
  return (v || '(missing)').trim().toUpperCase().replace(/\s+/g, '_')
}

const bySession = new Map<string, RunResult[]>()
results.forEach((r) => {
  if (!bySession.has(r.session_id)) bySession.set(r.session_id, [])
  bySession.get(r.session_id)!.push(r)
})
const repeated = [...bySession.entries()].filter(([, rs]) => rs.length > 1)

if (repeated.length) {
  console.log('\n\n' + '='.repeat(78))
  console.log('TEST 2 — CONSISTENCY (same session, repeated calls)')
  console.log('='.repeat(78) + '\n')

  for (const [sid, rs] of repeated.sort((a, b) => a[1].length - b[1].length)) {
    const golden = sessionById.get(sid)
    const nEvents = golden ? golden.input.events.length : -1
    rs.sort((a, b) => a.repeat_index - b.repeat_index)

    const states = rs.map((r) => r.parsed!.state || '(missing)')
    const typesNorm = rs.map((r) => normalizeEnumFormat(r.parsed!.insight_type || ''))
    const principlesNorm = rs.map((r) => normalizePrinciple(r.parsed!.insight_principle || '(missing)'))

    const distinctStates = new Set(states)
    const distinctTypes = new Set(typesNorm)
    const distinctPrinciples = new Set(principlesNorm)

    console.log(`${sid}  (${nEvents} events, ${rs.length} repeats)`)
    console.log(`  state:              ${distinctStates.size === 1 ? '✓ STABLE' : `✗ VARIES (${distinctStates.size} distinct)`}  — ${states.join(' | ')}`)
    console.log(`  insight_type:       ${distinctTypes.size === 1 ? '✓ STABLE' : `✗ VARIES (${distinctTypes.size} distinct)`}  — ${typesNorm.join(' | ')}`)
    console.log(`  insight_principle:  ${distinctPrinciples.size === 1 ? '✓ STABLE' : `✗ VARIES (${distinctPrinciples.size} distinct)`}  — ${[...distinctPrinciples].join(' | ')}`)
    console.log()
  }

  console.log('Summary — stability across all repeated sessions:')
  const stateStableCount = repeated.filter(([, rs]) => new Set(rs.map((r) => r.parsed!.state)).size === 1).length
  const typeStableCount = repeated.filter(([, rs]) => new Set(rs.map((r) => normalizeEnumFormat(r.parsed!.insight_type || ''))).size === 1).length
  const principleStableCount = repeated.filter(([, rs]) => new Set(rs.map((r) => normalizePrinciple(r.parsed!.insight_principle || ''))).size === 1).length
  console.log(`  state stable in:              ${stateStableCount}/${repeated.length} sessions`)
  console.log(`  insight_type stable in:       ${typeStableCount}/${repeated.length} sessions`)
  console.log(`  insight_principle stable in:  ${principleStableCount}/${repeated.length} sessions`)
}

console.log('\n\n' + '='.repeat(78))
console.log('END OF REPORT')
console.log('='.repeat(78))
