'use client'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { useState, useEffect } from 'react'

type Session = {
  id: string; created_at: string; client_key: string
  page_context: string; state: string; intent_score: number
  conversion_probability: number; tags: string[]
  insight_type: string; insight_text: string; insight_principle: string
  recommendation: string; estimated_lift: string
  session_duration: number; scroll_depth: number
}

type Stats = {
  total: number; avgConv: number; avgIntent: number
  converted: number; convRate: string
}

// Client profiles - Phase 2: comes from Supabase clients table
const CLIENT_PROFILES: Record<string, {
  name: string; type: string; url: string; industry: string
  ctaTargets: string[]; description: string; snippetSince: string
}> = {
  'terra-store': {
    name: 'Terra Store', type: 'E-commerce', url: 'terra-store-xi.vercel.app',
    industry: 'Consumer goods', snippetSince: '07 Jun 2026',
    description: 'Premium everyday essentials store. Main funnel: browse products, add to cart, checkout.',
    ctaTargets: ['Add to cart', 'Proceed to checkout', 'Place order'],
  },
  'nexflow': {
    name: 'Nexflow', type: 'SaaS', url: 'nexflow-demo.vercel.app',
    industry: 'Project management', snippetSince: '09 Jun 2026',
    description: 'AI-powered project management tool. Main funnel: landing, pricing, trial signup, workspace setup.',
    ctaTargets: ['Start free trial', 'Create account', 'Get started', 'Open my workspace'],
  },
  'demo': {
    name: 'Demo', type: 'Demo', url: 'verobehavior.vercel.app/demo',
    industry: 'Internal testing', snippetSince: '07 Jun 2026',
    description: 'Internal demo environment for testing the VeroBehavior analysis engine.',
    ctaTargets: ['Analyze behavior', 'Run demo'],
  },
}

const typeColor: Record<string, string> = {
  'E-commerce': 'bg-amber-50 text-amber-700 border-amber-200',
  'SaaS': 'bg-brand-light text-brand border-brand/20',
  'B2B': 'bg-blue-50 text-blue-700 border-blue-200',
  'Demo': 'bg-surface-2 text-ink-3 border-surface-3',
}

const stateColor: Record<string, string> = {
  converted: '#1A3A2A', high_intent: '#1A3A2A',
  hesitating: '#854F0B', comparing: '#4A4947',
  engaged: '#1A4A6E', browsing: '#8F8D89',
}
const stateBg: Record<string, string> = {
  converted: '#E8F2EC', high_intent: '#E8F2EC',
  hesitating: '#FBF3E4', comparing: '#F3F2EC',
  engaged: '#E8F0F8', browsing: '#F3F2EC',
}
const tagBg: Record<string, string> = {
  converted: '#E8F2EC', 'high-intent': '#E8F2EC', high_intent: '#E8F2EC',
  hesitating: '#FBF3E4', 'price-friction': '#FBF3E4',
  comparing: '#F3F2EC', browsing: '#E8F0F8',
  'social-proof-seeking': '#EEEDFE', engaged: '#E8F0F8',
}
const tagColor: Record<string, string> = {
  converted: '#1A3A2A', 'high-intent': '#1A3A2A', high_intent: '#1A3A2A',
  hesitating: '#854F0B', 'price-friction': '#854F0B',
  comparing: '#4A4947', browsing: '#1A4A6E',
  'social-proof-seeking': '#534AB7', engaged: '#1A4A6E',
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'sessions' | 'insights' | 'geo'>('sessions')
  const [filterKey, setFilterKey] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [allKeys, setAllKeys] = useState<string[]>([])

  const fetchData = async (key?: string) => {
    setLoading(true)
    try {
      const allRes = await fetch('/api/sessions')
      const allData = await allRes.json()
      const keys = [...new Set(
        (allData.sessions || []).map((s: Session) => s.client_key).filter((k: string) => k && k.length > 0)
      )] as string[]
      setAllKeys(keys)
      if (!key) {
        setSessions(allData.sessions || [])
        setStats(allData.stats || null)
      } else {
        const res = await fetch(`/api/sessions?key=${key}`)
        const data = await res.json()
        setSessions(data.sessions || [])
        setStats(data.stats || null)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const handleFilter = (key: string) => {
    setFilterKey(key)
    setDropdownOpen(false)
    fetchData(key || undefined)
  }

  const clientProfile = filterKey ? CLIENT_PROFILES[filterKey] : null

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Nav />
      <div className="pt-16">

        {/* Header */}
        <div className="bg-green py-6 px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-[11px] font-mono text-[#A8D4B8] mb-1 tracking-widest uppercase">Live Dashboard</div>
              <h1 className="font-serif text-2xl text-white font-normal">VeroBehavior Analytics</h1>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <button onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-[13px] text-white/90 min-w-[180px] justify-between hover:bg-white/15 transition-colors">
                  <span>{filterKey || 'All clients'}</span>
                  <span className={`text-[10px] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>&#9662;</span>
                </button>
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                      <button onClick={() => handleFilter('')}
                        className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors ${filterKey === '' ? 'bg-green text-white font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                        All clients
                      </button>
                      {allKeys.map(key => (
                        <button key={key} onClick={() => handleFilter(key)}
                          className={`w-full text-left px-4 py-2.5 text-[13px] border-t border-gray-100 transition-colors flex items-center justify-between ${filterKey === key ? 'bg-green text-white font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                          <span>{key}</span>
                          <span className={`text-[10px] ${filterKey === key ? 'text-white/70' : 'text-gray-400'}`}>
                            {sessions.filter(s => s.client_key === key).length || '?'} sessions
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <button onClick={() => fetchData(filterKey || undefined)}
                className="bg-gold text-white px-4 py-2 rounded-lg text-[12px] font-mono hover:opacity-90">&#8635; Refresh</button>
              <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-[12px] font-mono text-[#A8D4B8]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5EBA7D] animate-pulse" />
                {loading ? 'Loading...' : `${sessions.length} sessions`}
              </div>
            </div>
          </div>
        </div>

        {/* CLIENT CONTEXT BAR - shows only when a specific client is selected */}
        {clientProfile && (
          <div className="bg-white border-b border-surface-3">
            <div className="max-w-6xl mx-auto px-6 py-4">
              <div className="flex items-start justify-between gap-6 flex-wrap">
                {/* Left: client identity */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-light flex items-center justify-center text-green font-serif text-[18px] font-bold flex-shrink-0">
                    {clientProfile.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-[15px] font-semibold text-ink">{clientProfile.name}</span>
                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${typeColor[clientProfile.type] || 'bg-surface-2 text-ink-3 border-surface-3'}`}>
                        {clientProfile.type}
                      </span>
                      <span className="text-[11px] text-ink-3">{clientProfile.industry}</span>
                    </div>
                    <div className="text-[12px] text-ink-2 font-light mb-1">{clientProfile.description}</div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-ink-3">&#127760;</span>
                      <span className="text-[11px] font-mono text-ink-3">{clientProfile.url}</span>
                    </div>
                  </div>
                </div>

                {/* Middle: CTA targets */}
                <div className="flex-1 min-w-[200px]">
                  <div className="text-[10px] font-mono text-ink-3 uppercase tracking-widest mb-2">Tracked conversions</div>
                  <div className="flex flex-wrap gap-1.5">
                    {clientProfile.ctaTargets.map(cta => (
                      <span key={cta} className="text-[11px] bg-green-light text-green border border-green/20 px-2.5 py-1 rounded-full font-medium">
                        {cta}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: snippet status */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-[10px] font-mono text-ink-3 uppercase tracking-widest mb-2">Snippet</div>
                  <div className="flex items-center gap-1.5 justify-end mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#5EBA7D]" />
                    <span className="text-[12px] font-medium text-green">Active</span>
                  </div>
                  <div className="text-[11px] text-ink-3">Since {clientProfile.snippetSince}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-6 py-8">

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { n: stats ? stats.convRate + '%' : '-', l: 'Conversion Rate', sub: 'Sessions that converted', c: '#1A3A2A' },
              { n: stats ? stats.avgConv + '%' : '-', l: 'Avg Conv. Prob.', sub: 'Across all sessions', c: '#C8963C' },
              { n: stats ? stats.total.toString() : '-', l: 'Total Sessions', sub: 'All tracked sessions', c: '#534AB7' },
              { n: stats ? stats.avgIntent.toString() : '-', l: 'Avg Intent Score', sub: '0-99 scale', c: '#1A4A6E' },
            ].map(k => (
              <div key={k.l} className="bg-white border border-surface-3 rounded-xl p-5">
                <div className="font-serif text-3xl font-normal leading-none mb-1" style={{ color: k.c }}>{k.n}</div>
                <div className="text-[13px] font-medium text-ink mb-0.5">{k.l}</div>
                <div className="text-[11px] text-ink-3">{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Snippet */}
          <div className="bg-[#0E0E14] rounded-xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-mono text-white/40 mb-1 uppercase tracking-widest">Add to any website to start tracking</div>
              <code className="text-[12px] font-mono text-[#A8D4B8]">{'<script src="https://verobehavior.vercel.app/api/snippet?key=YOUR_CLIENT_KEY" async></script>'}</code>
            </div>
            <div className="text-[11px] font-mono text-white/30 whitespace-nowrap">Replace YOUR_CLIENT_KEY with client name</div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-surface-2 border border-surface-3 rounded-lg p-1 mb-6 w-fit">
            {(['sessions', 'insights', 'geo'] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-4 py-1.5 rounded-md text-[13px] capitalize transition-all ${activeTab === t ? 'bg-green text-white font-medium' : 'text-ink-2 hover:text-ink'}`}>
                {t === 'geo' ? 'GEO Monitor' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Sessions tab */}
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
                {sessions.map(s => {
                  const isOpen = expandedId === s.id
                  return (
                    <div key={s.id} className={`bg-white border rounded-xl overflow-hidden transition-all cursor-pointer ${isOpen ? 'border-green shadow-md' : 'border-surface-3 hover:border-green/30'}`}>
                      <div className="px-5 py-4 flex items-center gap-4 flex-wrap" onClick={() => setExpandedId(isOpen ? null : s.id)}>
                        <div className="w-[90px] flex-shrink-0">
                          <div className="text-[11px] font-mono text-ink-3">
                            {new Date(s.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div className="w-[100px] flex-shrink-0">
                          <span className="text-[11px] font-mono bg-green-light text-green px-2 py-0.5 rounded-full">{s.client_key || 'unknown'}</span>
                        </div>
                        <div className="w-[90px] flex-shrink-0">
                          <span className="text-[11px] font-mono font-medium capitalize px-2 py-0.5 rounded-full"
                            style={{ color: stateColor[s.state] || '#4A4947', background: stateBg[s.state] || '#F3F2EC' }}>
                            {s.state}
                          </span>
                        </div>
                        <div className="w-[80px] flex-shrink-0 flex items-center gap-2">
                          <div className="h-1.5 bg-surface rounded-full w-10 overflow-hidden">
                            <div className="h-full bg-green rounded-full" style={{ width: `${s.intent_score}%` }} />
                          </div>
                          <span className="text-[10px] font-mono text-ink-3">{s.intent_score}</span>
                        </div>
                        <div className="w-[50px] flex-shrink-0 text-[11px] font-mono" style={{ color: s.conversion_probability > 60 ? '#1A3A2A' : '#4A4947' }}>
                          {s.conversion_probability}%
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap gap-1">
                            {(s.tags || []).slice(0, 3).map(tag => (
                              <span key={tag} className="text-[9px] font-mono px-1.5 py-0.5 rounded-full"
                                style={{ background: tagBg[tag] || '#F3F2EC', color: tagColor[tag] || '#4A4947' }}>{tag}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`text-[12px] text-ink-3 transition-transform inline-block ${isOpen ? 'rotate-180' : ''}`}>&#9662;</span>
                        </div>
                      </div>
                      {isOpen && (
                        <div className="px-5 pb-5 border-t border-surface-2">
                          <div className="grid md:grid-cols-2 gap-4 mt-4">
                            <div className="rounded-lg p-4" style={{ borderLeft: `3px solid ${stateColor[s.state] || '#4A4947'}`, background: stateBg[s.state] || '#F3F2EC' }}>
                              <div className="text-[9px] font-mono uppercase tracking-widest mb-2" style={{ color: stateColor[s.state] || '#4A4947' }}>
                                {s.insight_type || 'Behavioral Insight'}
                              </div>
                              <p className="text-[13px] text-ink leading-relaxed mb-3">{s.insight_text || 'No insight generated.'}</p>
                              {s.insight_principle && (
                                <div className="text-[10px] font-mono" style={{ color: stateColor[s.state] || '#4A4947' }}>
                                  Principle: {s.insight_principle}
                                </div>
                              )}
                            </div>
                            <div className="bg-green rounded-lg p-4">
                              <div className="text-[9px] font-mono text-[#A8D4B8] uppercase tracking-widest mb-2">AI Recommendation</div>
                              <p className="text-[13px] text-white leading-relaxed mb-3">{s.recommendation || 'No recommendation available.'}</p>
                              {s.estimated_lift && <div className="text-[11px] font-mono text-[#A8D4B8] mb-3">Estimated lift: {s.estimated_lift}</div>}
                              <div className="flex gap-2">
                                <button className="flex-1 bg-white/15 border border-white/25 text-white py-2 rounded-lg text-[11px] font-mono hover:bg-white/25 transition-colors">
                                  Launch A/B Test
                                </button>
                                <button className="flex-1 bg-white/5 border border-white/15 text-white/60 py-2 rounded-lg text-[11px] font-mono hover:bg-white/10 transition-colors">
                                  Save to Backlog
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-6 mt-4 pt-3 border-t border-surface-2 flex-wrap">
                            {[
                              { l: 'Page', v: s.page_context || 'Unknown' },
                              { l: 'Duration', v: s.session_duration ? s.session_duration + 's' : 'N/A' },
                              { l: 'Scroll depth', v: s.scroll_depth ? s.scroll_depth + '%' : 'N/A' },
                              { l: 'Session ID', v: s.id.slice(0, 8) + '...' },
                            ].map(m => (
                              <div key={m.l}>
                                <div className="text-[9px] font-mono text-ink-3 uppercase tracking-widest">{m.l}</div>
                                <div className="text-[12px] text-ink mt-0.5">{m.v}</div>
                              </div>
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

          {/* Insights tab */}
          {activeTab === 'insights' && (
            sessions.length === 0 ? (
              <div className="bg-white border border-surface-3 rounded-xl p-12 text-center text-ink-3 text-[13px]">No insights yet.</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {sessions.filter(s => s.insight_text).slice(0, 8).map(s => (
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

          {/* GEO tab */}
          {activeTab === 'geo' && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-surface-3 rounded-xl p-5">
                <div className="text-[11px] font-mono tracking-widest text-ink-3 uppercase mb-4">Brand Visibility in AI Responses</div>
                {[
                  { platform: 'ChatGPT', score: 94, color: '#1A3A2A' },
                  { platform: 'Perplexity', score: 81, color: '#534AB7' },
                  { platform: 'Google SGE', score: 67, color: '#854F0B' },
                  { platform: 'Gemini', score: 58, color: '#1A4A6E' },
                ].map(p => (
                  <div key={p.platform} className="flex items-center gap-3 mb-3">
                    <span className="text-[12px] w-24 text-ink-2 font-mono flex-shrink-0">{p.platform}</span>
                    <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${p.score}%`, background: p.color }} />
                    </div>
                    <span className="text-[13px] font-semibold w-8 text-right" style={{ color: p.color }}>{p.score}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white border border-surface-3 rounded-xl p-5">
                <div className="text-[11px] font-mono tracking-widest text-ink-3 uppercase mb-4">GEO Recommendations</div>
                {[
                  { sev: 'HIGH', issue: 'Missing JSON-LD Product schema on pricing page', fix: 'Add Product + FAQPage schema', impact: '+28% SGE' },
                  { sev: 'MED', issue: 'Machine readability score: 62/100', fix: 'Add structured metadata', impact: '+15% Perplexity' },
                  { sev: 'LOW', issue: 'No entity disambiguation in About page', fix: 'Add Organization schema', impact: '+8% ChatGPT' },
                ].map(r => (
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
      <Footer />
    </div>
  )
}
