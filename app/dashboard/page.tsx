'use client'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { useState, useEffect } from 'react'

type Session = {
  id: string; created_at: string; client_key: string
  page_context: string; state: string; intent_score: number
  conversion_probability: number; tags: string[]
  insight_type: string; insight_text: string
  recommendation: string; estimated_lift: string
  session_duration: number; scroll_depth: number
}

type Stats = {
  total: number; avgConv: number; avgIntent: number
  converted: number; convRate: string
}

const tagColor: Record<string, string> = {
  'converted': '#1A3A2A', 'high-intent': '#1A3A2A',
  'hesitating': '#854F0B', 'price-friction': '#854F0B',
  'comparing': '#4A4947', 'browsing': '#1A4A6E',
  'social-proof-seeking': '#534AB7',
}
const tagBg: Record<string, string> = {
  'converted': '#E8F2EC', 'high-intent': '#E8F2EC',
  'hesitating': '#FBF3E4', 'price-friction': '#FBF3E4',
  'comparing': '#F3F2EC', 'browsing': '#E8F0F8',
  'social-proof-seeking': '#EEEDFE',
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'insights' | 'sessions' | 'geo'>('sessions')
  const [filterKey, setFilterKey] = useState('')

  const fetchData = async (key?: string) => {
    setLoading(true)
    try {
      const url = key ? `/api/sessions?key=${key}` : '/api/sessions'
      const res = await fetch(url)
      const data = await res.json()
      setSessions(data.sessions || [])
      setStats(data.stats || null)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const clientKeys = [...new Set(sessions.map(s => s.client_key).filter(Boolean))]

  const stateColor: Record<string, string> = {
    converted: '#1A3A2A', high_intent: '#1A3A2A',
    hesitating: '#854F0B', comparing: '#4A4947',
    engaged: '#1A4A6E', browsing: '#8F8D89',
  }

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
              {/* Filter by client key */}
              <select
                value={filterKey}
                onChange={e => { setFilterKey(e.target.value); fetchData(e.target.value || undefined) }}
                className="bg-white/10 border border-white/20 rounded-md px-3 py-1.5 text-[12px] font-mono text-white/80 outline-none">
                <option value="">All clients</option>
                {clientKeys.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              <button onClick={() => fetchData(filterKey || undefined)}
                className="bg-gold text-white px-4 py-1.5 rounded-md text-[12px] font-mono hover:opacity-90">
                ↻ Refresh
              </button>
              <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-4 py-1.5 text-[12px] font-mono text-[#A8D4B8]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5EBA7D] animate-pulse-dot" />
                {loading ? 'Loading...' : `${sessions.length} sessions`}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">

          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { n: stats ? stats.convRate + '%' : '—', l: 'Conversion Rate', sub: 'Sessions → converted', c: '#1A3A2A' },
              { n: stats ? stats.avgConv + '%' : '—', l: 'Avg Conv. Prob.', sub: 'Across all sessions', c: '#C8963C' },
              { n: stats ? stats.total.toString() : '—', l: 'Total Sessions', sub: 'All tracked sessions', c: '#534AB7' },
              { n: stats ? stats.avgIntent.toString() : '—', l: 'Avg Intent Score', sub: '0–99 scale', c: '#1A4A6E' },
            ].map(k => (
              <div key={k.l} className="bg-white border border-surface-3 rounded-xl p-5">
                <div className="font-serif text-3xl font-normal leading-none mb-1 transition-all" style={{ color: k.c }}>{k.n}</div>
                <div className="text-[13px] font-medium text-ink mb-0.5">{k.l}</div>
                <div className="text-[11px] text-ink-3">{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Snippet info */}
          <div className="bg-[#0E0E14] rounded-xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-mono text-white/40 mb-1 uppercase tracking-widest">Add to any website to start tracking</div>
              <code className="text-[11px] font-mono text-[#A8D4B8]">
                {'<script src="https://verobehavior.vercel.app/api/snippet?key=YOUR_CLIENT_KEY" async></script>'}
              </code>
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
              <div className="bg-white border border-surface-3 rounded-xl p-12 text-center text-ink-3 font-mono text-[13px]">
                Loading sessions...
              </div>
            ) : sessions.length === 0 ? (
              <div className="bg-white border border-surface-3 rounded-xl p-12 text-center">
                <div className="text-4xl mb-4">📭</div>
                <div className="font-serif text-xl text-ink mb-2">No sessions yet</div>
                <div className="text-[13px] text-ink-3 mb-4">Add the snippet to a website to start tracking</div>
                <code className="text-[11px] font-mono bg-surface px-4 py-2 rounded-lg text-green">
                  {'<script src="https://verobehavior.vercel.app/api/snippet?key=test" async></script>'}
                </code>
              </div>
            ) : (
              <div className="bg-white border border-surface-3 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-surface-2 border-b border-surface-3">
                      {['Time', 'Client', 'Page', 'State', 'Intent', 'Conv.', 'Tags', 'Insight'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] font-mono tracking-widest text-ink-3 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s, i) => (
                      <tr key={s.id} className={`border-b border-surface-2 hover:bg-surface cursor-pointer transition-colors ${i % 2 === 0 ? '' : 'bg-surface/30'}`}>
                        <td className="px-4 py-3 text-[11px] font-mono text-ink-3 whitespace-nowrap">
                          {new Date(s.created_at).toLocaleTimeString()}
                        </td>
                        <td className="px-4 py-3 text-[11px] font-mono text-green">{s.client_key || 'demo'}</td>
                        <td className="px-4 py-3 text-[11px] text-ink-2 max-w-[120px] truncate">{s.page_context}</td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-mono font-semibold capitalize" style={{ color: stateColor[s.state] || '#4A4947' }}>
                            {s.state}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-1.5 bg-surface rounded-full w-16 overflow-hidden">
                            <div className="h-full bg-green rounded-full" style={{ width: `${s.intent_score}%` }} />
                          </div>
                          <span className="text-[9px] font-mono text-ink-3">{s.intent_score}</span>
                        </td>
                        <td className="px-4 py-3 text-[11px] font-mono" style={{ color: s.conversion_probability > 60 ? '#1A3A2A' : '#4A4947' }}>
                          {s.conversion_probability}%
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {(s.tags || []).slice(0, 2).map(tag => (
                              <span key={tag} className="text-[8px] font-mono px-1.5 py-0.5 rounded-full"
                                style={{ background: tagBg[tag] || '#F3F2EC', color: tagColor[tag] || '#4A4947' }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-ink-2 max-w-[200px]">
                          <div className="truncate">{s.insight_text}</div>
                          {s.estimated_lift && (
                            <div className="text-[10px] font-mono text-green mt-0.5">{s.estimated_lift}</div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Insights tab */}
          {activeTab === 'insights' && (
            <div className="grid md:grid-cols-2 gap-4">
              {sessions.slice(0, 6).map(s => (
                <div key={s.id} className="bg-white border border-surface-3 rounded-xl p-5 border-l-2" style={{ borderLeftColor: stateColor[s.state] || '#4A4947' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: stateColor[s.state] || '#4A4947' }}>
                      {s.insight_type}
                    </span>
                    <span className="text-[10px] font-mono text-ink-3">{s.client_key}</span>
                  </div>
                  <p className="text-[13px] text-ink leading-relaxed mb-3">{s.insight_text}</p>
                  {s.recommendation && (
                    <div className="bg-surface rounded-lg p-3">
                      <div className="text-[9px] font-mono text-ink-3 mb-1">RECOMMENDATION</div>
                      <div className="text-[12px] text-ink">{s.recommendation}</div>
                      {s.estimated_lift && (
                        <div className="text-[10px] font-mono text-green mt-1">{s.estimated_lift}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {sessions.length === 0 && (
                <div className="col-span-2 bg-white border border-surface-3 rounded-xl p-12 text-center text-ink-3 font-mono text-[13px]">
                  No insights yet — interact with the demo or add snippet to a real site.
                </div>
              )}
            </div>
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
                <div className="mt-4 text-[11px] text-ink-3 font-mono">GEO analysis via /api/geo route</div>
              </div>
              <div className="bg-white border border-surface-3 rounded-xl p-5">
                <div className="text-[11px] font-mono tracking-widest text-ink-3 uppercase mb-4">GEO Recommendations</div>
                {[
                  { sev: 'HIGH', issue: 'Missing JSON-LD Product schema on pricing page', fix: 'Add Product + FAQPage schema', impact: '+28% SGE' },
                  { sev: 'MED',  issue: 'Machine readability score: 62/100', fix: 'Add structured metadata to catalog', impact: '+15% Perplexity' },
                  { sev: 'LOW',  issue: 'No entity disambiguation in About page', fix: 'Add Organization schema', impact: '+8% ChatGPT' },
                ].map(r => (
                  <div key={r.issue} className="border-b border-surface-2 pb-3 mb-3 last:border-b-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${r.sev === 'HIGH' ? 'bg-red-100 text-red-700' : r.sev === 'MED' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>{r.sev}</span>
                      <span className="text-[12px] text-ink">{r.issue}</span>
                    </div>
                    <div className="text-[11px] text-ink-2 font-light">{r.fix} — <span className="text-green font-medium">{r.impact}</span></div>
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
