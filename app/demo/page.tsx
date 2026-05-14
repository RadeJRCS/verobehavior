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
  browsing:    { icon:'👀', label:'Browsing',     sub:'User arrived. No strong signals yet.',           color:'#1A3A2A', bg:'#E8F2EC' },
  engaged:     { icon:'🔍', label:'Engaged',      sub:'Multiple touchpoints. Interest building.',       color:'#1A4A6E', bg:'#E8F0F8' },
  hesitating:  { icon:'⚡', label:'Hesitation',   sub:'Repeated cursor movement near CTA detected.',   color:'#854F0B', bg:'#FBF3E4' },
  comparing:   { icon:'↔️', label:'Comparing',   sub:'Evaluating multiple options. Decision mode.',    color:'#4A4947', bg:'#F3F2EC' },
  high_intent: { icon:'🎯', label:'High Intent',  sub:'Strong purchase signals. Act now.',             color:'#1A3A2A', bg:'#E8F2EC' },
  converted:   { icon:'🛒', label:'Conversion!',  sub:'Conversion event captured.',                   color:'#fff',    bg:'#1A3A2A' },
}

const BUNDLE_PRICES: Record<string, number> = {
  'Headphones only': 349,
  '+ Carry case (+$29)': 378,
  '+ Case + Cable + Mic (+$59)': 408,
}

const COLOR_THEMES: Record<string, { bg: string; accent: string; label: string }> = {
  'Midnight Black': { bg: 'linear-gradient(135deg, #1A1A2E 0%, #2D2D4E 50%, #1A1A2E 100%)', accent: '#6C63FF', label: '⬛' },
  'Pearl White':    { bg: 'linear-gradient(135deg, #D8D8D8 0%, #F0F0F0 50%, #D0D0D0 100%)', accent: '#888',    label: '⬜' },
  'Forest Green':   { bg: 'linear-gradient(135deg, #1A3A2A 0%, #2D5A42 50%, #1A3A2A 100%)', accent: '#A8D4B8', label: '🟩' },
}

const THUMB_VIEWS = [
  { icon: '🎧', title: 'Front view',  desc: 'Main product shot' },
  { icon: '📦', title: 'Packaging',   desc: 'In original box' },
  { icon: '📋', title: 'Specs',       desc: 'Technical details' },
]

export default function DemoPage() {
  const [events, setEvents] = useState<BehaviorEvent[]>([])
  const [insight, setInsight] = useState<Insight | null>(null)
  const [loading, setLoading] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [scrollDepth, setScrollDepth] = useState(0)
  const [selectedColor, setSelectedColor] = useState('Midnight Black')
  const [selectedBundle, setSelectedBundle] = useState('Headphones only')
  const [activeThumb, setActiveThumb] = useState(0)
  const [imgHovered, setImgHovered] = useState(false)
  const [cartAdded, setCartAdded] = useState(false)
  const [tags, setTags] = useState<Set<string>>(new Set(['browsing']))
  const [currentState, setCurrentState] = useState('browsing')
  const [convProb, setConvProb] = useState(8)
  const [intentScore, setIntentScore] = useState(12)
  const [apiMode, setApiMode] = useState<'live' | 'demo'>('live')
  const startRef = useRef(Date.now())
  const lastAnalyzeRef = useRef(0)

  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const el = document.getElementById('productScroll')
    if (!el) return
    const fn = () => {
      const d = Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100)
      setScrollDepth(prev => Math.max(prev, isNaN(d) ? 0 : d))
    }
    el.addEventListener('scroll', fn, { passive: true })
    return () => el.removeEventListener('scroll', fn)
  }, [])

  const addTag = useCallback((tag: string) => setTags(prev => new Set([...prev, tag])), [])

  const trackEvent = useCallback((type: string, data?: Record<string, unknown>) => {
    const ev: BehaviorEvent = { type, ts: Date.now() - startRef.current, data }
    setEvents(prev => {
      const next = [...prev, ev]
      const isKey = ['add_to_cart', 'wishlist', 'reviews_hover'].includes(type)
      if (isKey || (Date.now() - lastAnalyzeRef.current > 3000 && next.length >= 3)) {
        lastAnalyzeRef.current = Date.now()
        analyzeWithAI(next, type)
      }
      return next.slice(-20)
    })
    setIntentScore(p => Math.min(99, p + (type === 'add_to_cart' ? 40 : type === 'reviews_hover' ? 12 : 6)))
    if (type === 'add_to_cart')    { setCurrentState('converted'); addTag('converted'); addTag('high-intent') }
    else if (type === 'wishlist')  { setCurrentState('hesitating'); addTag('price-friction') }
    else if (type === 'reviews_hover') { setCurrentState('engaged'); addTag('social-proof-seeking') }
    else if (type === 'variant_change') { setCurrentState('comparing'); addTag('comparing') }
    else if (type === 'img_hover') { addTag('visual-seeking') }
    else if (events.length > 3)   { setCurrentState('engaged') }
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
        await new Promise(r => setTimeout(r, 600))
        const demos: Record<string, Insight> = {
          img_hover:      { state: 'engaged',    intentScore: 38, conversionProbability: 22, tags: ['visual-seeking'], insight: { type: 'ENGAGEMENT', text: 'User inspecting product image — tactile-visual compensation. Cannot physically inspect the product, compensating through visual information gathering.', principle: 'Elaboration Likelihood Model — high involvement processing' }, recommendation: 'Add 360° view to reduce tactile anxiety.', estimatedLift: '+12-18% add-to-cart' },
          reviews_hover:  { state: 'engaged',    intentScore: 55, conversionProbability: 38, tags: ['social-proof-seeking'], insight: { type: 'SOCIAL PROOF', text: 'User seeking social validation before committing — classic loss aversion pattern. Fear of wrong choice drives review consultation.', principle: 'Social proof (Cialdini) + loss aversion (Kahneman)' }, recommendation: 'Surface top review summary above the fold near CTA.', estimatedLift: '+15-22% conversion' },
          add_to_cart:    { state: 'converted',  intentScore: 94, conversionProbability: 95, tags: ['converted', 'high-intent'], insight: { type: 'CONVERSION EVENT', text: 'Add to Cart triggered! Loss aversion framing ("SAVE $100 · Limited time") successfully activated scarcity response.', principle: 'Loss aversion + scarcity principle (Cialdini)' }, recommendation: 'Cross-sell within 3 seconds of cart add.', estimatedLift: '+28% AOV' },
          wishlist:       { state: 'hesitating', intentScore: 45, conversionProbability: 28, tags: ['price-friction'], insight: { type: 'HESITATION', text: 'Wishlist instead of cart — price sensitivity or timing friction. Intent is present but commitment threshold not met.', principle: 'Commitment & consistency (Cialdini) — low foot-in-door' }, recommendation: 'Show "Pay over 3 months from $116/mo" near CTA.', estimatedLift: '+19% checkout starts' },
          variant_change: { state: 'comparing',  intentScore: 52, conversionProbability: 35, tags: ['comparing', 'color_preference'], insight: { type: 'DECISION FATIGUE', text: 'User switching between variants — comparison mode active. Multiple option evaluation may create mild choice overload.', principle: "Hick's Law — decision time increases with number of choices" }, recommendation: 'Add "Most Popular" badge to Midnight Black to anchor decision.', estimatedLift: '+14% faster checkout' },
        }
        const key = Object.keys(demos).find(k => trigger.includes(k)) || 'img_hover'
        const d = demos[key]
        setInsight(d); setConvProb(d.conversionProbability)
        setCurrentState(d.state); setIntentScore(d.intentScore)
        d.tags.forEach(t => addTag(t))
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const stCfg = STATE_CONFIG[currentState] || STATE_CONFIG.browsing
  const currentPrice = BUNDLE_PRICES[selectedBundle] || 349
  const colorTheme = COLOR_THEMES[selectedColor]

  const thumbContent = (idx: number) => {
    if (idx === 0) return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <span style={{ fontSize: 72, filter: selectedColor === 'Pearl White' ? 'brightness(0.3)' : 'none' }}>🎧</span>
        <span className="text-[11px] font-mono tracking-widest opacity-40 text-white">
          {selectedColor.toUpperCase()}
        </span>
      </div>
    )
    if (idx === 1) return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <span style={{ fontSize: 64 }}>📦</span>
        <span className="text-[11px] font-mono tracking-widest text-white/40">PACKAGING</span>
      </div>
    )
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-left">
        <div className="text-white/80 text-[11px] font-mono leading-relaxed w-full">
          <div className="mb-1 text-white/40 tracking-widest">SPECIFICATIONS</div>
          <div>Battery: 40 hours</div>
          <div>Driver: 40mm</div>
          <div>Freq: 20Hz–20kHz</div>
          <div>BT: 5.3 · A2DP</div>
          <div>Weight: 250g</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Nav />
      <div className="pt-16">
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
                    {/* Main image */}
                    <div
                      className="rounded-xl aspect-square flex items-center justify-center cursor-zoom-in relative overflow-hidden transition-all duration-500"
                      style={{
                        background: colorTheme.bg,
                        transform: imgHovered ? 'scale(1.02)' : 'scale(1)',
                        boxShadow: imgHovered ? `0 20px 60px ${colorTheme.accent}40` : '0 4px 20px rgba(0,0,0,0.1)',
                        transition: 'all 0.4s ease',
                      }}
                      onMouseEnter={() => { setImgHovered(true); trackEvent('img_hover') }}
                      onMouseLeave={() => { setImgHovered(false); trackEvent('img_leave') }}
                    >
                      {thumbContent(activeThumb)}

                      {/* Hover overlay */}
                      {imgHovered && (
                        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.15)' }}>
                          <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-[11px] font-mono tracking-widest">
                            🔍 INSPECTING
                          </div>
                        </div>
                      )}

                      {/* Color indicator */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <span className="text-[9px] font-mono text-white/40 tracking-widest">{selectedColor.toUpperCase()}</span>
                        <span className="text-[9px] font-mono text-white/40 tracking-widest">{THUMB_VIEWS[activeThumb].title.toUpperCase()}</span>
                      </div>
                    </div>

                    {/* Thumbnails */}
                    <div className="flex gap-2 mt-3">
                      {THUMB_VIEWS.map((thumb, i) => (
                        <button
                          key={i}
                          onClick={() => { setActiveThumb(i); trackEvent('thumb_click', { thumb: i, view: thumb.title }) }}
                          className="flex-1 aspect-square rounded-lg flex flex-col items-center justify-center transition-all duration-300 border-2 relative overflow-hidden"
                          style={{
                            background: i === activeThumb ? colorTheme.bg : '#F3F2EC',
                            borderColor: i === activeThumb ? colorTheme.accent : '#E4E1DC',
                            transform: i === activeThumb ? 'scale(1.05)' : 'scale(1)',
                          }}
                          title={thumb.title}
                        >
                          <span className="text-xl" style={{ filter: i === activeThumb && selectedColor === 'Pearl White' ? 'brightness(0.4)' : 'none' }}>
                            {thumb.icon}
                          </span>
                          <span className="text-[8px] font-mono mt-1" style={{ color: i === activeThumb ? 'rgba(255,255,255,0.6)' : '#8F8D89' }}>
                            {thumb.title.split(' ')[0].toUpperCase()}
                          </span>
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
                    <div className="mb-1 flex items-baseline gap-2">
                      <span className="font-serif text-3xl font-normal text-ink transition-all duration-300">${currentPrice}</span>
                      {currentPrice === 349
                        ? <span className="text-[14px] text-ink-3 line-through">$449</span>
                        : <span className="text-[13px] text-ink-3">base $349</span>
                      }
                    </div>
                    <div className="inline-block bg-green-light text-green text-[10px] font-mono px-2 py-0.5 rounded-full mb-4">SAVE $100 · Limited time</div>

                    {/* Color variants */}
                    <div className="mb-4">
                      <div className="text-[12px] font-medium mb-2">
                        Color: <span className="text-ink-3 font-normal">{selectedColor}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(COLOR_THEMES).map(c => (
                          <button key={c}
                            onClick={() => { setSelectedColor(c); trackEvent('variant_change', { type: 'color', value: c }) }}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-md border text-[12px] transition-all duration-300"
                            style={{
                              borderColor: selectedColor === c ? colorTheme.accent : '#E4E1DC',
                              background: selectedColor === c ? COLOR_THEMES[c].bg : 'transparent',
                              color: selectedColor === c ? (c === 'Pearl White' ? '#333' : '#fff') : '#4A4947',
                              transform: selectedColor === c ? 'scale(1.03)' : 'scale(1)',
                            }}>
                            <span className="w-3 h-3 rounded-full border border-white/30 flex-shrink-0"
                              style={{ background: c === 'Midnight Black' ? '#1A1A2E' : c === 'Pearl White' ? '#F0F0F0' : '#1A3A2A' }} />
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bundle variants */}
                    <div className="mb-4">
                      <div className="text-[12px] font-medium mb-2">Bundle</div>
                      <div className="flex flex-col gap-2">
                        {Object.keys(BUNDLE_PRICES).map(b => (
                          <button key={b}
                            onClick={() => { setSelectedBundle(b); trackEvent('variant_change', { type: 'bundle', value: b }) }}
                            className="text-left px-3 py-2 rounded-md border text-[12px] transition-all flex justify-between items-center"
                            style={{
                              borderColor: selectedBundle === b ? '#1A3A2A' : '#E4E1DC',
                              background: selectedBundle === b ? '#E8F2EC' : 'transparent',
                              color: selectedBundle === b ? '#1A3A2A' : '#4A4947',
                            }}>
                            <span>{b}</span>
                            <span className="font-mono font-semibold">${BUNDLE_PRICES[b]}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <p className="text-[12px] text-ink-2 leading-relaxed mb-4 font-light">
                      Premium 40-hour battery life. Adaptive noise cancellation. Hi-Res Audio certified. Foldable design for travel. Bluetooth 5.3 or 3.5mm.
                    </p>

                    <button
                      onClick={() => { trackEvent('add_to_cart'); setCartAdded(true); setTimeout(() => setCartAdded(false), 2500) }}
                      className="w-full py-3 rounded-lg text-[14px] font-semibold mb-2 transition-all duration-300"
                      style={{
                        background: cartAdded ? '#0F6E56' : '#1A3A2A',
                        color: '#fff',
                      }}>
                      {cartAdded ? '✓ Added to Cart!' : `Add to Cart — $${currentPrice}`}
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
              <div className="text-[9px] font-mono tracking-widest text-ink-3 uppercase mb-2">Session State</div>
              <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 mb-4 transition-all duration-300" style={{ background: stCfg.bg }}>
                <span className="text-xl">{stCfg.icon}</span>
                <div>
                  <div className="text-[12px] font-semibold" style={{ color: currentState === 'converted' ? '#fff' : stCfg.color }}>{stCfg.label}</div>
                  <div className="text-[11px] leading-snug" style={{ color: currentState === 'converted' ? 'rgba(255,255,255,.7)' : '#8F8D89' }}>{stCfg.sub}</div>
                </div>
              </div>

              <div className="text-[9px] font-mono tracking-widest text-ink-3 uppercase mb-2">Metrics</div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[{ n: elapsed + 's', l: 'TIME' }, { n: Math.min(99, intentScore), l: 'INTENT' }, { n: events.length, l: 'EVENTS' }].map(m => (
                  <div key={m.l} className="bg-surface rounded-md py-2 px-2 text-center">
                    <div className="font-serif text-xl text-green leading-none">{m.n}</div>
                    <div className="text-[9px] font-mono text-ink-3 mt-1">{m.l}</div>
                  </div>
                ))}
              </div>

              <div className="text-[9px] font-mono tracking-widest text-ink-3 uppercase mb-2">Engagement</div>
              <div className="space-y-2 mb-4">
                {[
                  { label: 'Scroll depth', pct: Math.min(100, scrollDepth + elapsed * 2), color: '#1A3A2A' },
                  { label: 'Conversion prob.', pct: Math.min(95, convProb), color: '#C8963C' },
                ].map(b => (
                  <div key={b.label}>
                    <div className="flex justify-between text-[10px] text-ink-2 mb-1"><span>{b.label}</span><span>{Math.round(b.pct)}%</span></div>
                    <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${b.pct}%`, background: b.color }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-[9px] font-mono tracking-widest text-ink-3 uppercase mb-2">Behavioral Tags</div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {[...tags].map(t => (
                  <span key={t} className="text-[9px] font-mono bg-green-light text-green px-2 py-0.5 rounded-full animate-slide-in">{t}</span>
                ))}
              </div>

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

        <div className="max-w-6xl mx-auto px-4 pb-8">
          <div className="bg-[#0E0E14] rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono text-white/40 mb-1">This demo is powered by the VeroBehavior snippet + Claude API:</div>
              <code className="text-[11px] font-mono text-[#A8D4B8]">{'<script src="cdn.verobehavior.com/vb.min.js?key=vb_demo" async></script>'}</code>
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
