'use client'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { useState, useEffect, useCallback } from 'react'

type Session = {
  id: string; created_at: string; client_key: string
  site_url: string; page_context: string; state: string
  intent_score: number; conversion_probability: number; tags: string[]
  insight_type: string; insight_text: string; insight_principle: string
  recommendation: string; estimated_lift: string
  session_duration: number; scroll_depth: number
  events: Array<{ type: string; ts: number; data: { text?: string; tag?: string; vbType?: string | null } }>
}
type Stats = { total: number; avgConv: number; avgIntent: number; converted: number; convRate: string }
type BacklogItem = {
  id: string; created_at: string; client_key: string; session_id: string | null
  insight_type: string; insight_text: string; recommendation: string
  estimated_lift: string; state: string; status: string; priority: string
}
type Test = {
  id: string; created_at: string; client_key: string; name: string
  hypothesis: string; element_find_text: string; control_text: string
  variant_text: string; target_segment: string; status: string; winner: string
  judge_analysis: string; min_sessions: number; started_at: string
  session_source_id: string | null
}
type TestStats = { A: { sessions: number; conversions: number; rate: string }; B: { sessions: number; conversions: number; rate: string } }
type ClientProfile = { name: string; type: string; url: string; industry: string; ctaTargets: string[]; description: string; snippetSince: string }

const stateColor: Record<string, string> = { converted: '#1A3A2A', high_intent: '#1A3A2A', hesitating: '#854F0B', comparing: '#4A4947', engaged: '#1A4A6E', browsing: '#8F8D89' }
const stateBg: Record<string, string> = { converted: '#E8F2EC', high_intent: '#E8F2EC', hesitating: '#FBF3E4', comparing: '#F3F2EC', engaged: '#E8F0F8', browsing: '#F3F2EC' }
const tagBg: Record<string, string> = { converted: '#E8F2EC', 'high-intent': '#E8F2EC', high_intent: '#E8F2EC', hesitating: '#FBF3E4', 'price-friction': '#FBF3E4', comparing: '#F3F2EC', browsing: '#E8F0F8', 'social-proof-seeking': '#EEEDFE', engaged: '#E8F0F8' }
const tagColor: Record<string, string> = { converted: '#1A3A2A', 'high-intent': '#1A3A2A', high_intent: '#1A3A2A', hesitating: '#854F0B', 'price-friction': '#854F0B', comparing: '#4A4947', browsing: '#1A4A6E', 'social-proof-seeking': '#534AB7', engaged: '#1A4A6E' }
const statusStyle: Record<string, string> = { pending: 'bg-surface-2 text-ink-3', in_progress: 'bg-blue-50 text-blue-700', done: 'bg-green-light text-green', archived: 'bg-surface-2 text-ink-3' }
const priorityStyle: Record<string, string> = { high: 'bg-red-50 text-red-700', medium: 'bg-amber-50 text-amber-700', low: 'bg-surface-2 text-ink-3' }
const typeColor: Record<string, string> = { 'E-commerce': 'bg-amber-50 text-amber-700 border-amber-200', 'SaaS': 'bg-brand-light text-brand border-brand/20', 'B2B': 'bg-blue-50 text-blue-700 border-blue-200', 'Documentation': 'bg-purple-50 text-purple-700 border-purple-200', 'Website': 'bg-surface-2 text-ink-3 border-surface-3' }

function deriveClientProfile(clientKey: string, sessions: Session[]): ClientProfile | null {
  if (sessions.length === 0) return null
  const sorted = [...sessions].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  const first = sorted[0]

  // Get site URL - prefer site_url field, fall back to nothing
  const siteUrl = sessions.find(s => s.site_url)?.site_url || ''

  // Extract site name from first page title (e.g. "Nexflow - Project..." -> "Nexflow")
  const rawTitle = sessions[0]?.page_context || ''
  const siteName = rawTitle.split(' - ')[0].split(' | ')[0].split(' — ')[0].trim()
  const name = siteName && siteName.length < 40 ? siteName : clientKey.split(/[-_]/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  // Infer type from page context and tags
  const allCtx = sessions.map(s => s.page_context || '').join(' ').toLowerCase()
  const allTags = sessions.flatMap(s => s.tags || []).join(' ').toLowerCase()
  const type =
    allCtx.match(/cart|checkout|product|shop|store|buy|purchase/) || allTags.match(/cart|checkout|product/) ? 'E-commerce' :
    allCtx.match(/pricing|trial|signup|dashboard|subscription/) || allTags.match(/signup|activation|pricing/) ? 'SaaS' :
    allCtx.match(/docs|guide|documentation|tutorial|manual|user.guide/) ? 'Documentation' :
    allCtx.match(/contact|service|enterprise|b2b/) ? 'B2B' : 'Website'

  // Short description
  const description = `${type} · ${sessions.length} session${sessions.length !== 1 ? 's' : ''} tracked`

  // CTAs from conversion events
  const convClicks = sessions.flatMap(s =>
    (s.events || []).filter(e => e.type === 'conversion').map(e => e.data?.text || '')
  ).filter(Boolean)
  let ctaTargets = [...new Set(convClicks)].slice(0, 4)
  // Fallback: most-clicked elements
  if (ctaTargets.length === 0) {
    const allClicks = sessions.flatMap(s =>
      (s.events || []).filter(e => e.type === 'click').map(e => e.data?.text || '')
    ).filter((t: string) => t && t.length > 2 && t.length < 60)
    const counts = allClicks.reduce((acc: Record<string, number>, t: string) => ({ ...acc, [t]: (acc[t] || 0) + 1 }), {})
    ctaTargets = Object.entries(counts).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 4).map(([t]) => t)
  }

  const snippetSince = new Date(first.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  return { name, type, url: siteUrl, industry: '', description, ctaTargets, snippetSince }
}

type LaunchModalState = { session: Session } | null

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'sessions' | 'insights' | 'backlog' | 'tests' | 'geo'>('sessions')
  const [filterKey, setFilterKey] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [allKeys, setAllKeys] = useState<string[]>([])
  const [backlog, setBacklog] = useState<BacklogItem[]>([])
  const [tests, setTests] = useState<Test[]>([])
  const [testStats, setTestStats] = useState<Record<string, TestStats>>({})
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [backedUpSessions, setBackedUpSessions] = useState<Map<string, string>>(new Map())
  const [testedSessions, setTestedSessions] = useState<Map<string, string>>(new Map())
  const [launchModal, setLaunchModal] = useState<LaunchModalState>(null)
  const [launchForm, setLaunchForm] = useState({ elementFindText: '', controlText: '', variantText: '', hypothesis: '' })
  const [launching, setLaunching] = useState(false)

  const fetchData = useCallback(async (key?: string) => {
    setLoading(true)
    try {
      const allRes = await fetch('/api/sessions')
      const allData = await allRes.json()
      const keys = [...new Set((allData.sessions || []).map((s: Session) => s.client_key).filter((k: string) => k && k.length > 0))] as string[]
      setAllKeys(keys)
      if (!key) { setSessions(allData.sessions || []); setStats(allData.stats || null) }
      else {
        const res = await fetch(`/api/sessions?key=${key}`)
        const data = await res.json()
        setSessions(data.sessions || []); setStats(data.stats || null)
      }
      try {
        const [blRes, tsRes] = await Promise.all([fetch('/api/backlog'), fetch('/api/tests')])
        const blData = await blRes.json()
        const tsData = await tsRes.json()
        const blMap = new Map<string, string>()
        ;(blData.items as BacklogItem[] || []).forEach((i: BacklogItem) => { if (i.session_id) blMap.set(i.session_id, i.status) })
        const tsMap = new Map<string, string>()
        ;(tsData.tests as Test[] || []).forEach((t: Test) => { if (t.session_source_id) tsMap.set(t.session_source_id, t.status) })
        setBackedUpSessions(blMap)
        setTestedSessions(tsMap)
      } catch {}
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  const fetchBacklog = useCallback(async () => {
    try {
      const res = await fetch(filterKey ? `/api/backlog?key=${filterKey}` : '/api/backlog')
      const data = await res.json()
      setBacklog(data.items || [])
    } catch (e) { console.error(e) }
  }, [filterKey])

  const fetchTests = useCallback(async () => {
    try {
      const res = await fetch(filterKey ? `/api/tests?key=${filterKey}` : '/api/tests')
      const data = await res.json()
      const testList: Test[] = data.tests || []
      setTests(testList)
      const statsMap: Record<string, TestStats> = {}
      await Promise.all(testList.map(async (t: Test) => {
        try { const r = await fetch(`/api/test-results?testId=${t.id}`); const d = await r.json(); if (d.stats) statsMap[t.id] = d.stats } catch {}
      }))
      setTestStats(statsMap)
    } catch (e) { console.error(e) }
  }, [filterKey])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { if (activeTab === 'backlog') fetchBacklog() }, [activeTab, fetchBacklog])
  useEffect(() => { if (activeTab === 'tests') fetchTests() }, [activeTab, fetchTests])

  const handleFilter = (key: string) => { setFilterKey(key); setDropdownOpen(false); fetchData(key || undefined) }

  const handleSaveToBacklog = async (session: Session) => {
    if (savedIds.has(session.id)) return
    try {
      await fetch('/api/backlog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientKey: session.client_key, sessionId: session.id, insightType: session.insight_type, insightText: session.insight_text, recommendation: session.recommendation, estimatedLift: session.estimated_lift, state: session.state }) })
      setSavedIds((prev: Set<string>) => new Set([...prev, session.id]))
      setBackedUpSessions((prev: Map<string, string>) => new Map([...prev, [session.id, 'pending']]))
      fetchBacklog()
    } catch (e) { console.error(e) }
  }

  const handleBacklogStatus = async (id: string, status: string) => {
    try {
      await fetch('/api/backlog', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
      setBacklog((prev: BacklogItem[]) => prev.map((i: BacklogItem) => i.id === id ? { ...i, status } : i))
    } catch (e) { console.error(e) }
  }

  const handleDeleteBacklog = async (id: string) => {
    try {
      await fetch(`/api/backlog?id=${id}`, { method: 'DELETE' })
      setBacklog((prev: BacklogItem[]) => prev.filter((i: BacklogItem) => i.id !== id))
    } catch (e) { console.error(e) }
  }

  const handleOpenLaunchModal = (session: Session) => {
    setLaunchForm({ elementFindText: '', controlText: '', variantText: '', hypothesis: session.recommendation?.slice(0, 200) || '' })
    setLaunchModal({ session })
  }

  const handleLaunchTest = async () => {
    if (!launchModal || !launchForm.elementFindText || !launchForm.variantText) return
    setLaunching(true)
    try {
      await fetch('/api/tests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientKey: launchModal.session.client_key, elementFindText: launchForm.elementFindText, controlText: launchForm.controlText || launchForm.elementFindText, variantText: launchForm.variantText, hypothesis: launchForm.hypothesis, sessionSourceId: launchModal.session.id, minSessions: 50 }) })
      setTestedSessions((prev: Map<string, string>) => new Map([...prev, [launchModal.session.id, 'active']]))
      setLaunchModal(null); setActiveTab('tests'); fetchTests()
    } catch (e) { console.error(e) }
    finally { setLaunching(false) }
  }

  const handleStopTest = async (testId: string) => {
    try { await fetch('/api/tests', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: testId, status: 'paused' }) }); fetchTests() } catch (e) { console.error(e) }
  }

  const handleEvaluateTest = async (testId: string) => {
    try { await fetch('/api/tests', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: testId, triggerJudge: true }) }); fetchTests() } catch (e) { console.error(e) }
  }

  const getSessionBadges = (sessionId: string) => {
    const badges = []
    if (backedUpSessions.has(sessionId)) {
      const st = backedUpSessions.get(sessionId)
      if (st === 'done') badges.push({ cls: 'bg-green-light text-green border-green/20', label: '✓ done' })
      else if (st === 'in_progress') badges.push({ cls: 'bg-blue-50 text-blue-700 border-blue-200', label: '▶ in progress' })
      else badges.push({ cls: 'bg-amber-50 text-amber-700 border-amber-200', label: '📋 backlog' })
    }
    if (testedSessions.has(sessionId)) {
      const st = testedSessions.get(sessionId)
      if (st === 'completed') badges.push({ cls: 'bg-green-light text-green border-green/20', label: '✓ test done' })
      else if (st === 'paused') badges.push({ cls: 'bg-surface-2 text-ink-3 border-surface-3', label: '⏸ paused' })
      else badges.push({ cls: 'bg-blue-50 text-blue-700 border-blue-200', label: '⚖ testing' })
    }
    return badges
  }

  // Dynamic profile - no hardcoding
  const clientProfile: ClientProfile | null = filterKey ? deriveClientProfile(filterKey, sessions) : null

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Nav />
      <div className="pt-16">
        <div className="bg-green py-6 px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-[11px] font-mono text-[#A8D4B8] mb-1 tracking-widest uppercase">Live Dashboard</div>
              <h1 className="font-serif text-2xl text-white font-normal">VeroBehavior Analytics</h1>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-[13px] text-white/90 min-w-[180px] justify-between hover:bg-white/15 transition-colors">
                  <span>{filterKey || 'All clients'}</span>
                  <span className={`text-[10px] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>&#9662;</span>
                </button>
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                      <button onClick={() => handleFilter('')} className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors ${filterKey === '' ? 'bg-green text-white font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>All clients</button>
                      {allKeys.map((key: string) => (
                        <button key={key} onClick={() => handleFilter(key)} className={`w-full text-left px-4 py-2.5 text-[13px] border-t border-gray-100 transition-colors flex items-center justify-between ${filterKey === key ? 'bg-green text-white font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                          <span>{key}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <button onClick={() => fetchData(filterKey || undefined)} className="bg-gold text-white px-4 py-2 rounded-lg text-[12px] font-mono hover:opacity-90">&#8635; Refresh</button>
              <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-[12px] font-mono text-[#A8D4B8]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5EBA7D] animate-pulse" />
                {loading ? 'Loading...' : `${sessions.length} sessions`}
              </div>
            </div>
          </div>
        </div>

        {clientProfile && (
          <div className="bg-white border-b border-surface-3">
            <div className="max-w-6xl mx-auto px-6 py-4">
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-light flex items-center justify-center text-green font-serif text-[18px] font-bold flex-shrink-0">{clientProfile.name[0]}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-[15px] font-semibold text-ink">{clientProfile.name}</span>
                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${typeColor[clientProfile.type] || 'bg-surface-2 text-ink-3 border-surface-3'}`}>{clientProfile.type}</span>
                    </div>
                    <div className="text-[12px] text-ink-2 font-light mb-1">{clientProfile.description}</div>
                    {clientProfile.url && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-ink-3">&#127760;</span>
                        <span className="text-[11px] font-mono text-ink-3">{clientProfile.url}</span>
                      </div>
                    )}
                  </div>
                </div>
                {clientProfile.ctaTargets.length > 0 && (
                  <div className="flex-1 min-w-[200px]">
                    <div className="text-[10px] font-mono text-ink-3 uppercase tracking-widest mb-2">Top interactions</div>
                    <div className="flex flex-wrap gap-1.5">
                      {clientProfile.ctaTargets.map((cta: string) => <span key={cta} className="text-[11px] bg-green-light text-green border border-green/20 px-2.5 py-1 rounded-full font-medium">{cta}</span>)}
                    </div>
                  </div>
                )}
                <div className="flex-shrink-0 text-right">
                  <div className="text-[10px] font-mono text-ink-3 uppercase tracking-widest mb-2">Snippet</div>
                  <div className="flex items-center gap-1.5 justify-end mb-1"><span className="w-2 h-2 rounded-full bg-[#5EBA7D]" /><span className="text-[12px] font-medium text-green">Active</span></div>
                  <div className="text-[11px] text-ink-3">Since {clientProfile.snippetSince}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { n: stats ? stats.convRate + '%' : '-', l: 'Conversion Rate', sub: 'Sessions that converted', c: '#1A3A2A' },
              { n: stats ? stats.avgConv + '%' : '-', l: 'Avg Conv. Prob.', sub: 'Across all sessions', c: '#C8963C' },
              { n: stats ? stats.total.toString() : '-', l: 'Total Sessions', sub: 'All tracked sessions', c: '#534AB7' },
              { n: stats ? stats.avgIntent.toString() : '-', l: 'Avg Intent Score', sub: '0-99 scale', c: '#1A4A6E' },
            ].map((k) => (
              <div key={k.l} className="bg-white border border-surface-3 rounded-xl p-5">
                <div className="font-serif text-3xl font-normal leading-none mb-1" style={{ color: k.c }}>{k.n}</div>
                <div className="text-[13px] font-medium text-ink mb-0.5">{k.l}</div>
                <div className="text-[11px] text-ink-3">{k.sub}</div>
              </div>
            ))}
          </div>

          <div className="bg-[#0E0E14] rounded-xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-mono text-white/40 mb-1 uppercase tracking-widest">Add to any website to start tracking</div>
              <code className="text-[12px] font-mono text-[#A8D4B8]">{'<script src="https://verobehavior.vercel.app/api/snippet?key=YOUR_CLIENT_KEY" async></script>'}</code>
            </div>
            <div className="text-[11px] font-mono text-white/30 whitespace-nowrap">Replace YOUR_CLIENT_KEY with client name</div>
          </div>

          <div className="flex gap-1 bg-surface-2 border border-surface-3 rounded-lg p-1 mb-6 w-fit flex-wrap">
            {(['sessions', 'insights', 'backlog', 'tests', 'geo'] as const).map((t) => (
              <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-1.5 rounded-md text-[13px] capitalize transition-all flex items-center gap-1.5 ${activeTab === t ? 'bg-green text-white font-medium' : 'text-ink-2 hover:text-ink'}`}>
                {t === 'geo' ? 'GEO Monitor' : t.charAt(0).toUpperCase() + t.slice(1)}
                {t === 'backlog' && backlog.filter((i: BacklogItem) => i.status === 'pending').length > 0 && <span className="text-[10px] bg-gold text-white px-1.5 py-0.5 rounded-full">{backlog.filter((i: BacklogItem) => i.status === 'pending').length}</span>}
                {t === 'tests' && tests.filter((i: Test) => i.status === 'active').length > 0 && <span className="text-[10px] bg-green-light text-green px-1.5 py-0.5 rounded-full">{tests.filter((i: Test) => i.status === 'active').length}</span>}
              </button>
            ))}
          </div>

          {activeTab === 'sessions' && (
            loading ? (
              <div className="bg-white border border-surface-3 rounded-xl p-12 text-center text-ink-3 font-mono text-[13px]">Loading sessions...</div>
            ) : sessions.length === 0 ? (
              <div className="bg-white border border-surface-3 rounded-xl p-12 text-center">
                <div className="text-4xl mb-4">&#128237;</div>
                <div className="font-serif text-xl text-ink mb-2">No sessions yet</div>
                <div className="text-[13px] text-ink-3">Add the snippet to a website to start tracking</div>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((s: Session) => {
                  const isOpen = expandedId === s.id
                  const isSaved = savedIds.has(s.id)
                  const badges = getSessionBadges(s.id)
                  return (
                    <div key={s.id} className={`bg-white border rounded-xl overflow-hidden transition-all ${isOpen ? 'border-green shadow-md' : 'border-surface-3 hover:border-green/30'}`}>
                      <div className="px-5 py-4 flex items-center gap-4 flex-wrap cursor-pointer" onClick={() => setExpandedId(isOpen ? null : s.id)}>
                        <div className="w-[90px] flex-shrink-0"><div className="text-[11px] font-mono text-ink-3">{new Date(s.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div></div>
                        <div className="w-[100px] flex-shrink-0"><span className="text-[11px] font-mono bg-green-light text-green px-2 py-0.5 rounded-full">{s.client_key || 'unknown'}</span></div>
                        <div className="w-[90px] flex-shrink-0"><span className="text-[11px] font-mono font-medium capitalize px-2 py-0.5 rounded-full" style={{ color: stateColor[s.state] || '#4A4947', background: stateBg[s.state] || '#F3F2EC' }}>{s.state}</span></div>
                        <div className="w-[80px] flex-shrink-0 flex items-center gap-2">
                          <div className="h-1.5 bg-surface rounded-full w-10 overflow-hidden"><div className="h-full bg-green rounded-full" style={{ width: `${s.intent_score}%` }} /></div>
                          <span className="text-[10px] font-mono text-ink-3">{s.intent_score}</span>
                        </div>
                        <div className="w-[50px] flex-shrink-0 text-[11px] font-mono" style={{ color: s.conversion_probability > 60 ? '#1A3A2A' : '#4A4947' }}>{s.conversion_probability}%</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap gap-1">
                            {(s.tags || []).slice(0, 3).map((tag: string) => <span key={tag} className="text-[9px] font-mono px-1.5 py-0.5 rounded-full" style={{ background: tagBg[tag] || '#F3F2EC', color: tagColor[tag] || '#4A4947' }}>{tag}</span>)}
                            {badges.map((b, bi) => <span key={bi} className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border ${b.cls}`}>{b.label}</span>)}
                          </div>
                        </div>
                        <div className="flex-shrink-0"><span className={`text-[12px] text-ink-3 inline-block transition-transform ${isOpen ? 'rotate-180' : ''}`}>&#9662;</span></div>
                      </div>
                      {isOpen && (
                        <div className="px-5 pb-5 border-t border-surface-2">
                          <div className="grid md:grid-cols-2 gap-4 mt-4">
                            <div className="rounded-lg p-4" style={{ borderLeft: `3px solid ${stateColor[s.state] || '#4A4947'}`, background: stateBg[s.state] || '#F3F2EC' }}>
                              <div className="text-[9px] font-mono uppercase tracking-widest mb-2" style={{ color: stateColor[s.state] || '#4A4947' }}>{s.insight_type || 'Behavioral Insight'}</div>
                              <p className="text-[13px] text-ink leading-relaxed mb-3">{s.insight_text || 'No insight generated.'}</p>
                              {s.insight_principle && <div className="text-[10px] font-mono" style={{ color: stateColor[s.state] || '#4A4947' }}>Principle: {s.insight_principle}</div>}
                            </div>
                            <div className="bg-green rounded-lg p-4">
                              <div className="text-[9px] font-mono text-[#A8D4B8] uppercase tracking-widest mb-2">AI Recommendation</div>
                              <p className="text-[13px] text-white leading-relaxed mb-3">{s.recommendation || 'No recommendation available.'}</p>
                              {s.estimated_lift && <div className="text-[11px] font-mono text-[#A8D4B8] mb-3">Estimated lift: {s.estimated_lift}</div>}
                              <div className="flex gap-2">
                                <button onClick={(e) => { e.stopPropagation(); handleOpenLaunchModal(s) }} className="flex-1 bg-white/15 border border-white/25 text-white py-2 rounded-lg text-[11px] font-mono hover:bg-white/25 transition-colors">Launch A/B Test</button>
                                <button onClick={(e) => { e.stopPropagation(); handleSaveToBacklog(s) }} className={`flex-1 border py-2 rounded-lg text-[11px] font-mono transition-colors ${isSaved ? 'bg-[#A8D4B8]/20 border-white/15 text-[#A8D4B8]' : 'bg-white/5 border-white/15 text-white/60 hover:bg-white/10'}`}>{isSaved ? '✓ Saved' : 'Save to Backlog'}</button>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-6 mt-4 pt-3 border-t border-surface-2 flex-wrap">
                            {[
                              { l: 'Page', v: s.page_context?.split(' | ')[0] || 'Unknown' },
                              { l: 'Site', v: s.site_url || 'Unknown' },
                              { l: 'Duration', v: s.session_duration ? s.session_duration + 's' : 'N/A' },
                              { l: 'Scroll', v: s.scroll_depth ? s.scroll_depth + '%' : 'N/A' },
                              { l: 'Session ID', v: s.id.slice(0, 8) + '...' },
                            ].map((m) => (
                              <div key={m.l}><div className="text-[9px] font-mono text-ink-3 uppercase tracking-widest">{m.l}</div><div className="text-[12px] text-ink mt-0.5">{m.v}</div></div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          )}

          {activeTab === 'insights' && (
            sessions.length === 0 ? <div className="bg-white border border-surface-3 rounded-xl p-12 text-center text-ink-3 text-[13px]">No insights yet.</div> : (
              <div className="grid md:grid-cols-2 gap-4">
                {sessions.filter((s: Session) => s.insight_text).slice(0, 8).map((s: Session) => (
                  <div key={s.id} className="bg-white border border-surface-3 rounded-xl p-5" style={{ borderLeftWidth: 3, borderLeftColor: stateColor[s.state] || '#4A4947' }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: stateColor[s.state] || '#4A4947' }}>{s.insight_type}</span>
                      <span className="text-[10px] font-mono bg-surface text-ink-3 px-2 py-0.5 rounded-full">{s.client_key}</span>
                    </div>
                    <p className="text-[13px] text-ink leading-relaxed mb-3">{s.insight_text}</p>
                    {s.recommendation && (
                      <div className="bg-surface rounded-lg p-3">
                        <div className="text-[9px] font-mono text-ink-3 mb-1 uppercase tracking-widest">Recommendation</div>
                        <div className="text-[12px] text-ink leading-relaxed">{s.recommendation}</div>
                        {s.estimated_lift && <div className="text-[10px] font-mono text-green mt-1">{s.estimated_lift}</div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'backlog' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="text-[13px] text-ink-2">{backlog.length} item{backlog.length !== 1 ? 's' : ''} in backlog</div>
                <button onClick={fetchBacklog} className="text-[12px] font-mono text-ink-3 hover:text-ink">&#8635; Refresh</button>
              </div>
              {backlog.length === 0 ? (
                <div className="bg-white border border-surface-3 rounded-xl p-12 text-center">
                  <div className="text-4xl mb-4">&#128203;</div>
                  <div className="font-serif text-xl text-ink mb-2">Backlog is empty</div>
                  <div className="text-[13px] text-ink-3">Open a session and click &ldquo;Save to Backlog&rdquo; to add recommendations here.</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {backlog.map((item: BacklogItem) => (
                    <div key={item.id} className="bg-white border border-surface-3 rounded-xl p-5">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-widest ${priorityStyle[item.priority] || 'bg-surface-2 text-ink-3'}`}>{item.priority}</span>
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-widest ${statusStyle[item.status] || ''}`}>{item.status}</span>
                            <span className="text-[10px] font-mono bg-green-light text-green px-2 py-0.5 rounded-full">{item.client_key}</span>
                            <span className="text-[10px] text-ink-3">{new Date(item.created_at).toLocaleDateString('en-GB')}</span>
                          </div>
                          <p className="text-[13px] text-ink leading-relaxed mb-2">{item.insight_text}</p>
                          {item.recommendation && (
                            <div className="bg-green-light rounded-lg p-3 mb-2">
                              <div className="text-[9px] font-mono text-green uppercase tracking-widest mb-1">Recommendation</div>
                              <div className="text-[12px] text-ink">{item.recommendation}</div>
                              {item.estimated_lift && <div className="text-[10px] font-mono text-green mt-1">{item.estimated_lift}</div>}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          {item.status === 'pending' && <button onClick={() => handleBacklogStatus(item.id, 'in_progress')} className="text-[11px] font-mono bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">Start</button>}
                          {item.status === 'in_progress' && <button onClick={() => handleBacklogStatus(item.id, 'done')} className="text-[11px] font-mono bg-green-light text-green px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity">Mark done</button>}
                          <button onClick={() => handleDeleteBacklog(item.id)} className="text-[11px] font-mono text-ink-3 hover:text-red-500 transition-colors">Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tests' && (
            <div>
              <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                <div className="text-[13px] text-ink-2">{tests.length} test{tests.length !== 1 ? 's' : ''} total</div>
                <button onClick={fetchTests} className="text-[12px] font-mono text-ink-3 hover:text-ink">&#8635; Refresh</button>
              </div>
              {tests.length === 0 ? (
                <div className="bg-white border border-surface-3 rounded-xl p-12 text-center">
                  <div className="text-4xl mb-4">&#9878;</div>
                  <div className="font-serif text-xl text-ink mb-2">No A/B tests yet</div>
                  <div className="text-[13px] text-ink-3">Open a session in the Sessions tab and click &ldquo;Launch A/B Test&rdquo;.</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {tests.map((test: Test) => {
                    const ts = testStats[test.id]
                    const aRate = ts?.A?.rate || '0'
                    const bRate = ts?.B?.rate || '0'
                    return (
                      <div key={test.id} className={`bg-white border rounded-xl p-5 ${test.status === 'active' ? 'border-blue-200' : test.status === 'completed' ? 'border-green' : 'border-surface-3'}`}>
                        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-widest ${test.status === 'active' ? 'bg-blue-50 text-blue-700' : test.status === 'completed' ? 'bg-green-light text-green' : 'bg-surface-2 text-ink-3'}`}>{test.status}</span>
                              <span className="text-[10px] font-mono bg-green-light text-green px-2 py-0.5 rounded-full">{test.client_key}</span>
                              <span className="text-[10px] text-ink-3">{new Date(test.created_at).toLocaleDateString('en-GB')}</span>
                            </div>
                            <div className="text-[15px] font-medium text-ink mb-0.5">{test.name}</div>
                            {test.hypothesis && <div className="text-[12px] text-ink-2 font-light">{test.hypothesis}</div>}
                          </div>
                          <div className="flex gap-2">
                            {test.status === 'active' && ts && (ts.A.sessions + ts.B.sessions) >= 10 && <button onClick={() => handleEvaluateTest(test.id)} className="text-[11px] font-mono bg-green text-white px-3 py-1.5 rounded-lg hover:opacity-90">Judge LLM</button>}
                            {test.status === 'active' && <button onClick={() => handleStopTest(test.id)} className="text-[11px] font-mono bg-surface-2 text-ink-2 px-3 py-1.5 rounded-lg hover:bg-surface-3">Pause</button>}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {(['A', 'B'] as const).map((v) => {
                            const vStats = ts?.[v]
                            const isWinner = test.winner === v
                            return (
                              <div key={v} className={`rounded-lg p-4 border ${isWinner ? 'border-green bg-green-light' : 'border-surface-3 bg-surface-2'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${isWinner ? 'bg-green text-white' : 'bg-white text-ink-2 border border-surface-3'}`}>Variant {v}{v === 'A' ? ' (Control)' : ''}</span>
                                  {isWinner && <span className="text-[10px] text-green font-semibold">Winner</span>}
                                </div>
                                <div className="text-[13px] font-medium text-ink mb-2">{v === 'A' ? test.control_text : test.variant_text}</div>
                                {vStats ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 h-2 bg-white rounded-full overflow-hidden border border-surface-3"><div className="h-full bg-green rounded-full transition-all" style={{ width: `${vStats.rate}%` }} /></div>
                                      <span className="text-[13px] font-semibold text-ink w-10 text-right">{vStats.rate}%</span>
                                    </div>
                                    <div className="text-[11px] text-ink-3">{vStats.sessions} sessions, {vStats.conversions} conversions</div>
                                  </div>
                                ) : <div className="text-[11px] text-ink-3">No data yet</div>}
                              </div>
                            )
                          })}
                        </div>
                        {test.judge_analysis && (
                          <div className="bg-green rounded-lg p-4">
                            <div className="text-[9px] font-mono text-[#A8D4B8] uppercase tracking-widest mb-2">Judge LLM Analysis</div>
                            <p className="text-[13px] text-white leading-relaxed">{test.judge_analysis}</p>
                          </div>
                        )}
                        {test.status === 'active' && ts && (
                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden"><div className="h-full bg-blue-400 rounded-full transition-all" style={{ width: `${Math.min((ts.A.sessions + ts.B.sessions) / (test.min_sessions * 2) * 100, 100)}%` }} /></div>
                            <span className="text-[11px] text-ink-3 font-mono flex-shrink-0">{ts.A.sessions + ts.B.sessions}/{test.min_sessions * 2} sessions</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'geo' && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-surface-3 rounded-xl p-5">
                <div className="text-[11px] font-mono tracking-widest text-ink-3 uppercase mb-4">Brand Visibility in AI Responses</div>
                {[{ platform: 'ChatGPT', score: 94, color: '#1A3A2A' }, { platform: 'Perplexity', score: 81, color: '#534AB7' }, { platform: 'Google SGE', score: 67, color: '#854F0B' }, { platform: 'Gemini', score: 58, color: '#1A4A6E' }].map((p) => (
                  <div key={p.platform} className="flex items-center gap-3 mb-3">
                    <span className="text-[12px] w-24 text-ink-2 font-mono flex-shrink-0">{p.platform}</span>
                    <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${p.score}%`, background: p.color }} /></div>
                    <span className="text-[13px] font-semibold w-8 text-right" style={{ color: p.color }}>{p.score}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white border border-surface-3 rounded-xl p-5">
                <div className="text-[11px] font-mono tracking-widest text-ink-3 uppercase mb-4">GEO Recommendations</div>
                {[{ sev: 'HIGH', issue: 'Missing JSON-LD Product schema on pricing page', fix: 'Add Product + FAQPage schema', impact: '+28% SGE' }, { sev: 'MED', issue: 'Machine readability score: 62/100', fix: 'Add structured metadata', impact: '+15% Perplexity' }, { sev: 'LOW', issue: 'No entity disambiguation in About page', fix: 'Add Organization schema', impact: '+8% ChatGPT' }].map((r) => (
                  <div key={r.issue} className="border-b border-surface-2 pb-3 mb-3 last:border-b-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${r.sev === 'HIGH' ? 'bg-red-50 text-red-700' : r.sev === 'MED' ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'}`}>{r.sev}</span>
                      <span className="text-[12px] text-ink">{r.issue}</span>
                    </div>
                    <div className="text-[11px] text-ink-2 font-light">{r.fix} <span className="text-green font-medium">{r.impact}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {launchModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="font-serif text-xl text-ink">Launch A/B Test</div>
              <button onClick={() => setLaunchModal(null)} className="text-ink-3 hover:text-ink text-xl">&#x2715;</button>
            </div>
            <div className="bg-surface-2 rounded-lg p-3 mb-5 text-[12px] text-ink-2 leading-relaxed">
              <div className="text-[9px] font-mono text-ink-3 uppercase tracking-widest mb-1">Based on session insight</div>
              {launchModal.session.recommendation?.slice(0, 180)}...
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[12px] text-ink-2 block mb-1">Element to find (current button text)</label>
                <input value={launchForm.elementFindText} onChange={(e) => setLaunchForm((f) => ({ ...f, elementFindText: e.target.value }))} placeholder='e.g. "Buy Now" or "Start free trial"' className="w-full border border-surface-3 rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-green transition-colors" />
                <div className="text-[11px] text-ink-3 mt-1">Snippet will find this text and change it for Variant B visitors</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] text-ink-2 block mb-1">Control (Variant A)</label>
                  <input value={launchForm.controlText} onChange={(e) => setLaunchForm((f) => ({ ...f, controlText: e.target.value }))} placeholder="Original text" className="w-full border border-surface-3 rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-green transition-colors" />
                </div>
                <div>
                  <label className="text-[12px] text-ink-2 block mb-1">Variant B</label>
                  <input value={launchForm.variantText} onChange={(e) => setLaunchForm((f) => ({ ...f, variantText: e.target.value }))} placeholder='e.g. "Only 3 left - Buy Now"' className="w-full border border-surface-3 rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-green transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-[12px] text-ink-2 block mb-1">Hypothesis</label>
                <textarea value={launchForm.hypothesis} onChange={(e) => setLaunchForm((f) => ({ ...f, hypothesis: e.target.value }))} rows={2} className="w-full border border-surface-3 rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-green transition-colors resize-none" />
              </div>
            </div>
            <div className="bg-surface-2 rounded-lg p-3 mt-4 text-[11px] text-ink-3">Traffic split: 50% Control, 50% Variant B. Auto-evaluates after 100 sessions. Judge LLM explains why the winner won.</div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setLaunchModal(null)} className="flex-1 border border-surface-3 text-ink-2 py-2.5 rounded-lg text-[13px] hover:border-ink-3">Cancel</button>
              <button onClick={handleLaunchTest} disabled={!launchForm.elementFindText || !launchForm.variantText || launching} className="flex-1 bg-green text-white py-2.5 rounded-lg text-[13px] font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">{launching ? 'Launching...' : 'Launch test'}</button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  )
}
