'use client'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { useState, useEffect, useCallback, useRef } from 'react'

type BehaviorEvent = { type: string; ts: number; data?: Record<string, unknown> }
type Insight = {
  state: string; intentScore: number; conversionProbability: number
  tags: string[]; insight: { type: string; text: string; principle: string }
  recommendation: string; estimatedLift: string
}

const STATE_CONFIG: Record<string, { icon: string; label: string; sub: string; color: string; bg: string }> = {
  browsing:    { icon:'👀', label:'Browsing',         sub:'User arrived. No strong signals yet.',             color:'#1A3A2A', bg:'#E8F2EC' },
  engaged:     { icon:'🔍', label:'Engaged',          sub:'Multiple touchpoints. Interest building.',         color:'#1A4A6E', bg:'#E8F0F8' },
  hesitating:  { icon:'⚡', label:'Hesitation',       sub:'Repeated cursor movement near CTA detected.',     color:'#854F0B', bg:'#FBF3E4' },
  comparing:   { icon:'↔️', label:'Comparing',       sub:'Evaluating multiple options. Decision mode.',      color:'#4A4947', bg:'#F3F2EC' },
  high_intent: { icon:'🎯', label:'High Intent',      sub:'Strong purchase signals. Act now.',               color:'#1A3A2A', bg:'#E8F2EC' },
  converted:   { icon:'🛒', label:'Conversion!',      sub:'Conversion event captured.',                     color:'#fff',    bg:'#1A3A2A' },
}

export default function DemoPage() {
  const [events, setEvents] = useState<BehaviorEvent[]>([])
  const [insight, setInsight] = useState<Insight | null>(null)
  const [loading, setLoading] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [scrollDepth, setScrollDepth] = useState(0)
  const [selectedColor, setSelectedColor] = useState('Midnight Black')
  const [selectedBundle, setSelectedBundle] = useState('Headphones only')
  const [cartAdded, setCartAdded] = useState(false)
  const [tags, setTags] = useState<Set<string>>(new Set(['browsing']))
  const [currentState, setCurrentState] = useState('browsing')
  const [convProb, setConvProb] = useState(8)
  const [intentScore, setIntentScore] = useState(12)
  const [apiMode, setApiMode] = useState<'live' | 'demo'>('live')
  const startRef = useRef(Date.now())
  const lastAnalyzeRef = useRef(0)

  // Timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000)
    return () => clearInterval(t)
  }, [])

  // Scroll tracking (product page div)
  useEffect(() => {
    const el = document.getElementById('productScroll')
    if (!el) return
    const fn = () => {
      const d = Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100)
      setScrollDepth(Math.max(scrollDepth, isNaN(d) ? 0 : d))
    }
    el.addEventListener('scroll', fn, { passive: true })
    return () => el.removeEventListener('scroll', fn)
  }, [scrollDepth])

  const addTag = useCallback((tag: string) => setTags(prev => new Set([...prev, tag])), [])

  const trackEvent = useCallback((type: string, data?: Record<string, unknown>) => {
    const ev: BehaviorEvent = { type, ts: Date.now() - startRef.current, data }
    setEvents(prev => {
      const next = [...prev, ev]
      // Debounce: analyze max once every 3 seconds, or on key events
      const isKey = ['add_to_cart', 'wishlist', 'reviews_hover'].includes(type)
      if (isKey || (Date.now() - lastAnalyzeRef.current > 3000 && next.length >= 3)) {
        lastAnalyzeRef.current = Date.now()
        analyzeWithAI(next, type)
      }
      return next.slice(-20) // keep last 20 events
    })

    // Immediate local state updates
    setIntentScore(p => Math.min(99, p + (type === 'add_to_cart' ? 40 : type === 'reviews_hover' ? 12 : 6)))
    if (type === 'add_to_cart') { setCurrentState('converted'); addTag('converted'); addTag('high-intent') }
    else if (type === 'wishlist') { setCurrentState('hesitating'); addTag('price-friction') }
    else if (type === 'reviews_hover') { setCurrentState('engaged'); addTag('social-proof-seeking') }
    else if (type === 'variant_change') { setCurrentState('comparing'); addTag('comparing') }
    else if (type === 'img_hover') { addTag('visual-seeking') }
    else if (events.length > 3) { setCurrentState('engaged') }
  }, [events.length, addTag])

  const analyzeWithAI = async (evs: BehaviorEvent[], trigger: string) => {
    if (loading) return
    setLoading(true)
    try {
      if (apiMode === 'live') {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            events: evs.slice(-8),
            pageContext: 'E-commerce product page: Lumina Pro X Headphones ($349)',
            sessionDuration: Math.floor((Date.now() - startRef.current) / 1000),
            scrollDepth,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          setInsight(data)
          setConvProb(data.conversionProbability || convProb)
          if (data.tags) data.tags.forEach((t: string) => addTag(t))
          if (data.state) setCurrentState(data.state)
          if (data.intentScore) setIntentScore(data.intentScore)
        }
      } else {
        // Demo mode — static responses
        await new Promise(r => setTimeout(r, 600))
        const demos: Record<string, Insight> = {
          img_hover: { state: 'engaged', intentScore: 38, conversionProbability: 22, tags: ['visual-seeking', 'engaged'], insight: { type: 'ENGAGEMENT', text: 'User inspecting product image repeatedly — tactile-visual compensation behavior. Cannot physically inspect the product, compensating through visual information gathering.', principle: 'Elaboration Likelihood Model — high involvement processing' }, recommendation: 'Add a 360° view or zoom feature to reduce tactile anxiety.', estimatedLift: '+12-18% add-to-cart' },
          reviews_hover: { state: 'engaged', intentScore: 55, conversionProbability: 38, tags: ['social-proof-seeking'], insight: { type: 'SOCIAL PROOF', text: 'User seeking social validation before committing — classic loss aversion pattern. Fear of making a wrong choice drives review consultation.', principle: 'Social proof (Cialdini) + loss aversion (Kahneman)' }, recommendation: 'Surface top review summary above the fold, near the CTA.', estimatedLift: '+15-22% conversion' },
          add_to_cart: { state: 'converted', intentScore: 94, conversionProbability: 95, tags: ['converted', 'high-intent'], insight: { type: 'CONVERSION EVENT', text: 'Add to Cart triggered! Loss aversion framing ("SAVE $100 · Limited time") successfully activated scarcity response.', principle: 'Loss aversion + scarcity principle (Cialdini)' }, recommendation: 'Follow up with cross-sell within 3 seconds of cart add.', estimatedLift: '+28% AOV' },
          wishlist: { state: 'hesitating', intentScore: 45, conversionProbability: 28, tags: ['price-friction', 'hesitating'], insight: { type: 'HESITATION', text: 'Wishlist behavior indicates price sensitivity or timing friction. Intent is present but commitment threshold not met.', principle: 'Commitment & consistency (Cialdini) — low foot-in-door' }, recommendation: 'Show "Pay over 3 months from $116/mo" near CTA to reduce commitment anxiety.', estimatedLift: '+19% checkout starts' },
        }
        const key = Object.keys(demos).find(k => trigger.includes(k)) || 'img_hover'
        setInsight(demos[key])
        const d = demos[key]
        setConvProb(d.conversionProbability)
        setCurrentState(d.state)
        setIntentScore(d.intentScore)
        d.tags.forEach(t => addTag(t))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const stCfg = STATE_CONFIG[currentState] || STATE_CONFIG.browsing

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Nav />
      <div className="pt-16">

        {/* Header */}
        <div className="bg-green py-8 px-6 text-center">
          <div className="text-[11px] font-mono tracking-widest text-[#A8D4B8] mb-2 uppercase">Interactive Live Demo</div>
          <h1 className="font-serif text-3xl md:text-4xl font-normal text-white mb-3">
            Interact with the product page.<br />
            <em className="italic text-[#A8D4B8]">Watch the AI analyze in real time.</em>
          </h1>
          <p className="text-[13px] text-white/50 font-mono">← Hover, click, scroll, compare variants — the VeroBehavior panel updates live using Claude API →</p>
          <div className="flex justify-center gap-3 mt-4">
            <button onClick={() => setApiMode('live')}
              className={`px-4 py-1.5 rounded-md text-[12px] font-mono transition-all ${apiMode === 'live' ? 'bg-gold text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
              🤖 Live Claude API
            </button>
            <button onClick={() => setApiMode('demo')}
              className={`px-4 py-1.5 rounded-md text-[12px] font-mono transition-all ${apiMode === 'demo' ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
              ⚡ Demo Mode (fast)
            </button>
          </div>
        </div>

        {/* Split demo */}
        <div className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-[1fr_380px] gap-4 items-start">

          {/* Product page */}
          <div className="bg-white border border-surface-3 rounded-xl overflow-hidden">
            <div className="bg-surface-2 border-b border-surface-3 px-4 py-2.5 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <div className="flex-1 bg-white border border-surface-3 rounded text-[10px] text-ink-3 font-mono text-center py-1">
                shop.example.com/lumina-pro-x
              </div>
            </div>
            <div id="productScroll" className="overflow-y-auto" style={{ maxHeight: '72vh' }}>
              <div className="p-5">
                <div className="text-[10px] text-ink-3 font-mono mb-4">Home / Audio / Headphones / Lumina Pro X</div>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Product image */}
                  <div>
                    <div
                      className="bg-gradient-to-br from-green to-green-mid rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer hover:scale-[1.01] transition-transform relative"
                      onMouseEnter={() => trackEvent('img_hover')}
                      onMouseLeave={() => trackEvent('img_leave')}
                    >
                      <span className="text-6xl">🎧</span>
                      <span className="absolute bottom-3 text-[10px] font-mono text-white/40 tracking-widest">hover to inspect</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {['🎧', '📦', '📋'].map((e, i) => (
                        <button key={i} onClick={() => trackEvent('thumb_click', { thumb: i })}
                          className="w-14 h-14 bg-surface rounded-lg flex items-center justify-center text-xl border border-surface-3 hover:border-green/40 transition-colors">
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Product info */}
                  <div>
                    <div className="text-[10px] font-mono tracking-widest text-ink-3 mb-1">LUMINA AUDIO</div>
                    <h2 className="font-serif text-2xl font-normal text-ink mb-2 leading-tight">Lumina Pro X Noise-Cancelling Headphones</h2>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-gold text-sm tracking-wider">★★★★★</span>
                      <span className="text-[11px] text-ink-3 font-mono">(2,847 reviews)</span>
                    </div>
                    <div className="mb-1">
                      <span className="font-serif text-3xl font-normal text-ink">$349</span>
                      <span className="text-[14px] text-ink-3 line-through ml-2">$449</span>
                    </div>
                    <div className="inline-block bg-green-light text-green text-[10px] font-mono px-2 py-0.5 rounded-full mb-4">SAVE $100 · Limited time</div>

                    {/* Color variants */}
                    <div className="mb-4">
                      <div className="text-[12px] font-medium mb-2">Color: <span className="text-ink-3 font-normal">{selectedColor}</span></div>
                      <div className="flex flex-wrap gap-2">
                        {['Midnight Black', 'Pearl White', 'Forest Green'].map(c => (
                          <button key={c} onClick={() => { setSelectedColor(c); trackEvent('variant_change', { type: 'color', value: c }) }}
                            className={`px-3 py-1.5 rounded-md border text-[12px] transition-all ${selectedColor === c ? 'border-green bg-green-light text-green font-medium' : 'border-surface-3 text-ink-2 hover:border-green/30'}`}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bundle variants */}
                    <div className="mb-4">
                      <div className="text-[12px] font-medium mb-2">Bundle</div>
                      <div className="flex flex-col gap-2">
                        {['Headphones only', '+ Carry case (+$29)', '+ Case + Cable + Mic (+$59)'].map(b => (
                          <button key={b} onClick={() => { setSelectedBundle(b); trackEvent('variant_change', { type: 'bundle', value: b }) }}
                            className={`text-left px-3 py-2 rounded-md border text-[12px] transition-all ${selectedBundle === b ? 'border-green bg-green-light text-green' : 'border-surface-3 text-ink-2 hover:border-green/30'}`}>
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>

                    <p className="text-[12px] text-ink-2 leading-relaxed mb-4 font-light">
                      Premium 40-hour battery life. Adaptive noise cancellation. Hi-Res Audio certified. Foldable design for travel. Bluetooth 5.3 or 3.5mm.
                    </p>
                    <button
                      onClick={() => { trackEvent('add_to_cart'); setCartAdded(true); setTimeout(() => setCartAdded(false), 2500) }}
                      className={`w-full py-3 rounded-lg text-[14px] font-semibold mb-2 transition-all ${cartAdded ? 'bg-[#0F6E56] text-white' : 'bg-green text-white hover:opacity-90'}`}>
                      {cartAdded ? '✓ Added to Cart!' : 'Add to Cart — $349'}
                    </button>
                    <button onClick={() => trackEvent('wishlist')}
                      className="w-full py-2.5 rounded-lg border border-surface-3 text-[13px] text-ink-2 hover:border-ink-3 transition-colors">
                      ♡ Add to Wishlist
                    </button>
                  </div>
                </div>

                {/* Reviews */}
                <div className="mt-6 border-t border-surface-2 pt-5" onMouseEnter={() => trackEvent('reviews_hover')}>
                  <div className="text-[13px] font-semibold mb-3">Top Reviews</div>
                  {[
                    { name: 'Marcus T.', stars: 5, text: 'Best headphones I\'ve owned. Noise cancellation is genuinely impressive, even on planes.' },
                    { name: 'Sarah K.', stars: 4, text: 'Great sound, comfortable for long sessions. Wish the carry case was included in the base price.' },
                    { name: 'David R.', stars: 5, text: 'Switched from Sony WH-1000XM5 and don\'t regret it. Battery life is phenomenal.' },
                  ].map(r => (
                    <div key={r.name} className="py-3 border-b border-surface-2 last:border-b-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[12px] font-medium">{r.name}</span>
                        <span className="text-gold text-xs">{'★'.repeat(r.stars)}</span>
                      </div>
                      <p className="text-[12px] text-ink-2 font-light">{r.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* VeroBehavior panel */}
          <div className="bg-white border border-surface-3 rounded-xl overflow-hidden sticky top-[72px]">
            <div className="bg-green px-4 py-3 flex items-center justify-between">
              <span className="font-serif text-[15px] text-white">Vero<em className="italic text-[#A8D4B8]">Behavior</em></span>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#A8D4B8]">
                <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-gold animate-pulse-dot' : 'bg-[#5EBA7D] animate-pulse-dot'}`} />
                {loading ? 'ANALYZING...' : apiMode === 'live' ? 'CLAUDE API LIVE' : 'DEMO MODE'}
              </div>
            </div>
            <div className="p-4 overflow-y-auto" style={{ maxHeight: '70vh' }}>

              {/* State */}
              <div className="text-[9px] font-mono tracking-widest text-ink-3 uppercase mb-2">Session State</div>
              <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 mb-4 transition-all" style={{ background: stCfg.bg }}>
                <span className="text-xl">{stCfg.icon}</span>
                <div>
                  <div className="text-[12px] font-semibold" style={{ color: currentState === 'converted' ? '#fff' : stCfg.color }}>{stCfg.label}</div>
                  <div className="text-[11px] leading-snug" style={{ color: currentState === 'converted' ? 'rgba(255,255,255,.7)' : '#8F8D89' }}>{stCfg.sub}</div>
                </div>
              </div>

              {/* Metrics */}
              <div className="text-[9px] font-mono tracking-widest text-ink-3 uppercase mb-2">Metrics</div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { n: elapsed + 's', l: 'TIME' },
                  { n: Math.min(99, intentScore), l: 'INTENT' },
                  { n: events.length, l: 'EVENTS' },
                ].map(m => (
                  <div key={m.l} className="bg-surface rounded-md py-2 px-2 text-center">
                    <div className="font-serif text-xl text-green leading-none">{m.n}</div>
                    <div className="text-[9px] font-mono text-ink-3 mt-1">{m.l}</div>
                  </div>
                ))}
              </div>

              {/* Progress bars */}
              <div className="text-[9px] font-mono tracking-widest text-ink-3 uppercase mb-2">Engagement</div>
              <div className="space-y-2 mb-4">
                {[
                  { label: 'Scroll depth', pct: Math.min(100, scrollDepth + elapsed * 2), color: '#1A3A2A' },
                  { label: 'Conversion prob.', pct: Math.min(95, convProb), color: '#C8963C' },
                ].map(b => (
                  <div key={b.label}>
                    <div className="flex justify-between text-[10px] text-ink-2 mb-1">
                      <span>{b.label}</span><span>{Math.round(b.pct)}%</span>
                    </div>
                    <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${b.pct}%`, background: b.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="text-[9px] font-mono tracking-widest text-ink-3 uppercase mb-2">Behavioral Tags</div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {[...tags].map(t => (
                  <span key={t} className="text-[9px] font-mono bg-green-light text-green px-2 py-0.5 rounded-full animate-slide-in">
                    {t}
                  </span>
                ))}
              </div>

              {/* AI Insight */}
              <div className="text-[9px] font-mono tracking-widest text-ink-3 uppercase mb-2">
                {apiMode === 'live' ? '🤖 Claude API Insight' : '⚡ Behavioral Insight'}
              </div>
              {insight ? (
                <div className="animate-slide-in">
                  <div className="bg-surface border-l-2 border-green rounded-r-lg p-3 mb-3">
                    <div className="text-[9px] font-mono text-green uppercase tracking-wider mb-1.5">{insight.insight.type}</div>
                    <div className="text-[12px] text-ink leading-relaxed mb-2">{insight.insight.text}</div>
                    <div className="text-[10px] font-mono text-ink-3">→ {insight.insight.principle}</div>
                  </div>
                  <div className="bg-green rounded-lg p-3">
                    <div className="text-[9px] font-mono text-[#A8D4B8] uppercase tracking-wider mb-1.5">AI Recommendation</div>
                    <div className="text-[12px] text-white leading-relaxed mb-2">{insight.recommendation}</div>
                    <div className="text-[10px] font-mono text-[#A8D4B8]">Est. lift: {insight.estimatedLift}</div>
                    <button className="mt-2 w-full bg-white/15 border border-white/25 text-white py-1.5 rounded-md text-[10px] font-mono hover:bg-white/25 transition-colors">
                      Launch A/B Test →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-surface rounded-lg p-3 text-[12px] text-ink-3 font-light">
                  {loading ? '⏳ Claude is analyzing your behavioral session...' : 'Interact with the product page to generate psychological insights.'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Snippet info */}
        <div className="max-w-6xl mx-auto px-4 pb-8">
          <div className="bg-[#0E0E14] rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono text-white/40 mb-1">This demo is powered by the VeroBehavior snippet + Claude API:</div>
              <code className="text-[11px] font-mono text-[#A8D4B8]">
                {'<script src="cdn.verobehavior.com/vb.min.js?key=vb_demo" async></script>'}
              </code>
            </div>
            <a href="/pricing" className="bg-gold text-white px-5 py-2 rounded-lg text-[13px] font-semibold whitespace-nowrap hover:opacity-90 transition-opacity">
              Get your snippet →
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
