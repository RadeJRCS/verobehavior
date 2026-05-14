'use client'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { useState } from 'react'

const sessions = [
  { id: 'sess_4821', state: 'hesitating',  pages: 4, duration: '3m 12s', intent: 67, conv: 34, tag: 'decision fatigue' },
  { id: 'sess_3302', state: 'high_intent', pages: 7, duration: '6m 44s', intent: 89, conv: 72, tag: 'high intent' },
  { id: 'sess_9174', state: 'converted',   pages: 3, duration: '2m 08s', intent: 95, conv: 95, tag: 'converted' },
  { id: 'sess_7750', state: 'comparing',   pages: 9, duration: '8m 30s', intent: 52, conv: 28, tag: 'comparing' },
  { id: 'sess_1123', state: 'browsing',    pages: 2, duration: '0m 45s', intent: 14, conv: 6,  tag: 'browsing' },
]

const tagColor: Record<string, string> = {
  'decision fatigue': '#FCECEA', 'high intent': '#E8F2EC', converted: '#1A3A2A',
  comparing: '#F3F2EC', browsing: '#EEF',
}
const tagText: Record<string, string> = {
  'decision fatigue': '#993C1D', 'high intent': '#1A3A2A', converted: '#fff',
  comparing: '#4A4947', browsing: '#534AB7',
}

const insights = [
  { type: 'FRICTION', color: '#C0392B', text: 'Mobile users abandoning form — overwhelm pattern across 3+ fields. No progress indicator.', fix: 'Break into 3-step form with progress bar.', principle: 'endowed progress effect', lift: '+34%' },
  { type: 'OPPORTUNITY', color: '#534AB7', text: 'Social proof placement below fold on pricing page — hesitation detected near CTA.', fix: 'Move testimonials above fold, adjacent to CTA.', principle: 'social proof · Cialdini', lift: '+22%' },
  { type: 'RUNNING', color: '#1A3A2A', text: 'A/B test active: simplified pricing layout vs. original. Bandit allocating 68% to Variant B.', fix: 'Judge LLM: loss aversion framing is psychologically aligned.', principle: 'multi-armed bandit · Judge LLM', lift: 'monitoring' },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'insights'|'sessions'|'geo'>('insights')

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Nav />
      <div className="pt-16">
        <div className="bg-green py-6 px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-[11px] font-mono text-[#A8D4B8] mb-1 tracking-widest uppercase">Client Dashboard</div>
              <h1 className="font-serif text-2xl text-white font-normal">shop.example.com</h1>
            </div>
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-[12px] font-mono text-[#A8D4B8]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5EBA7D] animate-pulse-dot" />
              VeroBehavior snippet active
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { n: '5.2%', l: 'Conversion Rate', delta: '+0.8pp vs last week', c: '#1A3A2A' },
              { n: '+12%', l: 'AI Lift Potential', delta: 'Identified by Psychology Engine', c: '#534AB7' },
              { n: '1,245', l: 'Sessions Analyzed', delta: 'Last 30 days', c: '#854F0B' },
              { n: '3', l: 'Active Tests', delta: 'Judge LLM monitoring', c: '#1A4A6E' },
            ].map(k => (
              <div key={k.l} className="bg-white border border-surface-3 rounded-xl p-5">
                <div className="font-serif text-3xl font-normal leading-none mb-1" style={{ color: k.c }}>{k.n}</div>
                <div className="text-[13px] font-medium text-ink mb-1">{k.l}</div>
                <div className="text-[11px] text-ink-3">{k.delta}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-surface-2 border border-surface-3 rounded-lg p-1 mb-6 w-fit">
            {(['insights', 'sessions', 'geo'] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-4 py-1.5 rounded-md text-[13px] capitalize transition-all ${activeTab === t ? 'bg-green text-white font-medium' : 'text-ink-2 hover:text-ink'}`}>
                {t === 'geo' ? 'GEO Monitor' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'insights' && (
            <div className="grid md:grid-cols-3 gap-4">
              {insights.map(ins => (
                <div key={ins.type} className="bg-white border border-surface-3 rounded-xl p-5 border-l-2" style={{ borderLeftColor: ins.color }}>
                  <div className="text-[9px] font-mono uppercase tracking-widest mb-2" style={{ color: ins.color }}>{ins.type}</div>
                  <p className="text-[13px] text-ink leading-relaxed mb-3">{ins.text}</p>
                  <div className="bg-surface rounded-lg p-3 mb-3">
                    <div className="text-[10px] font-mono text-ink-3 mb-1">RECOMMENDED FIX</div>
                    <div className="text-[12px] text-ink">{ins.fix}</div>
                    <div className="text-[10px] font-mono mt-1" style={{ color: ins.color }}>→ {ins.principle}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-green">Est. lift: {ins.lift}</span>
                    {ins.type !== 'RUNNING' && (
                      <button className="text-[11px] font-mono bg-green text-white px-3 py-1 rounded-md hover:opacity-90">
                        Launch test →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="bg-white border border-surface-3 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-2 border-b border-surface-3">
                    {['Session', 'State', 'Pages', 'Duration', 'Intent', 'Conv. Prob.', 'Tag'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-mono tracking-widest text-ink-3 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(s => (
                    <tr key={s.id} className="border-b border-surface-2 hover:bg-surface cursor-pointer transition-colors">
                      <td className="px-4 py-3 text-[12px] font-mono text-ink-2">{s.id}</td>
                      <td className="px-4 py-3 text-[12px] capitalize text-ink">{s.state}</td>
                      <td className="px-4 py-3 text-[12px] font-mono text-ink-2">{s.pages}</td>
                      <td className="px-4 py-3 text-[12px] font-mono text-ink-2">{s.duration}</td>
                      <td className="px-4 py-3">
                        <div className="h-1.5 bg-surface rounded-full w-20 overflow-hidden">
                          <div className="h-full bg-green rounded-full" style={{ width: `${s.intent}%` }} />
                        </div>
                        <span className="text-[10px] font-mono text-ink-3">{s.intent}</span>
                      </td>
                      <td className="px-4 py-3 text-[12px] font-mono" style={{ color: s.conv > 60 ? '#1A3A2A' : '#4A4947' }}>{s.conv}%</td>
                      <td className="px-4 py-3">
                        <span className="text-[9px] font-mono px-2 py-1 rounded-full" style={{ background: tagColor[s.tag] || '#eee', color: tagText[s.tag] || '#444' }}>
                          {s.tag}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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
                      <div className="h-full rounded-full transition-all" style={{ width: `${p.score}%`, background: p.color }} />
                    </div>
                    <span className="text-[13px] font-semibold w-8 text-right" style={{ color: p.color }}>{p.score}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white border border-surface-3 rounded-xl p-5">
                <div className="text-[11px] font-mono tracking-widest text-ink-3 uppercase mb-4">GEO Recommendations</div>
                {[
                  { sev: 'HIGH', issue: 'Missing JSON-LD Product schema on pricing page', fix: 'Add Product + FAQPage schema', impact: '+28% SGE' },
                  { sev: 'MED', issue: 'Machine readability score: 62/100', fix: 'Add structured metadata to catalog', impact: '+15% Perplexity' },
                  { sev: 'LOW', issue: 'No entity disambiguation in About page', fix: 'Add Organization schema', impact: '+8% ChatGPT' },
                ].map(r => (
                  <div key={r.issue} className="border-b border-surface-2 pb-3 mb-3 last:border-b-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${r.sev === 'HIGH' ? 'bg-red-100 text-red-700' : r.sev === 'MED' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>{r.sev}</span>
                      <span className="text-[12px] text-ink">{r.issue}</span>
                    </div>
                    <div className="text-[11px] text-ink-2 font-light">{r.fix} — <span className="text-green font-medium">{r.impact} citation rate</span></div>
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
