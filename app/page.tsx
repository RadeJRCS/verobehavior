import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Link from 'next/link'

const stats = [
  { n: '+23%', l: 'avg. conversion lift' },
  { n: '1,200+', l: 'paying customers' },
  { n: '4.9/5', l: 'G2 rating' },
  { n: '<50ms', l: 'insight latency' },
]

const features = [
  {
    icon: '🧠',
    tag: 'Psychology Engine',
    title: 'Why users behave the way they do — explained.',
    desc: 'Fine-tuned AI trained on Cialdini, Kahneman, and 2M+ tagged sessions classifies every visitor into cognitive states: hesitation, decision fatigue, high intent. Every insight cites its psychological principle. Zero black box.',
    points: ['Auto-tagging: hesitation, decision fatigue, confusion, high intent', 'XAI: every recommendation cites its psychological principle', 'Brand-voice tuning — insights match your communication style', 'Ethical AI certified — fully explainable, human-in-the-loop'],
    accent: '#1A3A2A',
    bg: '#E8F2EC',
  },
  {
    icon: '⚖️',
    tag: 'Decision Engine',
    title: 'Tests that get smarter while they run.',
    desc: 'Multi-armed bandit allocates traffic to winners in real time. A Judge LLM then evaluates each variant on psychological alignment — not just conversion lift — so you understand why it won and what to build next.',
    points: ['Multi-armed bandit: dynamic traffic reallocation in hours, not weeks', 'Judge LLM: scores variants on psychological effectiveness', 'Predictive test ranking: AI prioritizes your backlog by impact', 'Agentic mode: one-click autonomous test launch with approval gate'],
    accent: '#854F0B',
    bg: '#FBF3E4',
  },
  {
    icon: '🌐',
    tag: 'Visibility Engine',
    title: 'Optimize how AI search finds you — and converts them.',
    desc: 'As ChatGPT, Perplexity, and Google SGE replace traditional search, your brand must be visible before the click and compelling after it. VeroBehavior is the only CRO platform that bridges both layers.',
    points: ['Real-time brand monitoring across ChatGPT, Perplexity, SGE', 'AEO + JSON-LD structured data engine for max AI crawlability', 'Machine readability score — 0 to 100, with specific fixes', 'Intent-to-conversion bridge: connect AI search to on-site psychology'],
    accent: '#1A4A6E',
    bg: '#E8F0F8',
  },
]

const cases = [
  { co: 'Nordic Home Goods', industry: 'E-commerce', lift: '+34%', metric: 'checkout conversion', quote: 'VeroBehavior identified decision fatigue from a 12-option product grid — something we had never found ourselves.', name: 'Anna M., CMO' },
  { co: 'Stackflow Analytics', industry: 'SaaS', lift: '+47%', metric: 'free trial signups', quote: 'The AI detected commitment bias on our CTA in 48 hours. We had been A/B testing that button for months.', name: 'James T., Head of Growth' },
  { co: 'Crux Digital', industry: 'Agency', lift: '3.2×', metric: 'client ROI delivered', quote: 'VeroBehavior replaced our entire hypothesis backlog process. Our strategists focus on strategy, not guesswork.', name: 'Ana V., Founder' },
]

const testi = [
  { q: 'I\'ve used VWO, Optimizely, and Hotjar. None of them ever told me why a test won. VeroBehavior does. That\'s the difference between data and intelligence.', name: 'Sofia Krauss', role: 'CMO · Nord Living', init: 'SK', color: '#534AB7' },
  { q: 'The psychological playbooks for SaaS are incredibly specific. Our onboarding conversion went from 31% to 58% in two months. The ROI is almost embarrassing.', name: 'James Moretti', role: 'Head of Growth · Stackflow', init: 'JM', color: '#0F6E56' },
  { q: 'We run CRO for 14 clients. VeroBehavior cut our hypothesis generation time by 70%. Our strategists now spend their time on what actually matters.', name: 'Ana Velasco', role: 'Founder · Crux Digital', init: 'AV', color: '#854F0B' },
]

const integrations = ['Shopify', 'WooCommerce', 'HubSpot', 'Salesforce', 'GA4', 'Segment', 'Klaviyo', 'Meta Ads', 'Google Ads', 'Zapier', 'Intercom', '+28 more']

const faqs = [
  ['How is VeroBehavior different from VWO or Optimizely?', 'VWO and Optimizely tell you what users did. VeroBehavior tells you why — expressed in psychological terms. Our AI is fine-tuned on behavioral psychology, not just statistics. And we\'re the only CRO platform that also covers GEO (how AI search engines represent your brand).'],
  ['Does VeroBehavior slow down my website?', 'No. Our JavaScript snippet is under 10KB, loads asynchronously, and produces zero Cumulative Layout Shift (CLS). All AI processing happens server-side. Fully Core Web Vitals compliant.'],
  ['Is my session data used to train your model?', 'Only with explicit consent, fully anonymized. We never store personally identifiable information. GDPR and CCPA compliant by design from day one.'],
  ['How does the proprietary AI work — is it GPT-4?', 'Our AI is a fine-tuned, domain-specific model trained on behavioral psychology literature and 2M+ tagged user sessions. We do not use GPT-4 or any third-party LLM API for core inference — this protects your data and creates a proprietary moat that compounds with every client.'],
  ['How quickly can I see results?', 'First psychological insights appear within 48 hours of installing the snippet. Statistically significant experiment results in 2–4 weeks. GEO visibility improvements in 2–4 months.'],
]

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 text-center bg-surface">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-gold-light border border-yellow-200 rounded-full px-4 py-1.5 text-[11px] font-mono font-medium text-gold mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-dot" />
            G2 Leader · Behavioral CRO 2026 · 4.9/5 from 312 reviews
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-normal leading-[1.05] tracking-tight text-ink mb-6">
            Stop testing words.<br />
            <em className="italic text-green">Start testing psychology.</em>
          </h1>
          <p className="text-lg text-ink-2 max-w-xl mx-auto mb-10 leading-relaxed font-light">
            VeroBehavior is the only CRO platform that explains the <em>why</em> behind every click, scroll, and conversion — powered by proprietary AI trained on behavioral science.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            <Link href="/demo" className="bg-green text-white px-7 py-3.5 rounded-lg text-[14px] font-semibold hover:opacity-90 transition-opacity">
              See live demo →
            </Link>
            <Link href="/pricing" className="bg-white text-ink border border-surface-3 px-7 py-3.5 rounded-lg text-[14px] hover:border-ink-3 transition-colors">
              View pricing
            </Link>
          </div>
          <p className="text-[13px] text-ink-3 mb-14">
            Used by <strong className="text-ink-2">1,200+ growth teams</strong> · Free 14-day trial · No credit card
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 border border-surface-3 rounded-xl overflow-hidden bg-white max-w-2xl mx-auto">
            {stats.map((s, i) => (
              <div key={i} className="py-5 px-4 text-center border-r border-surface-3 last:border-r-0">
                <div className="font-serif text-3xl text-green leading-none mb-1">{s.n}</div>
                <div className="text-[11px] text-ink-3 font-mono">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="bg-green overflow-hidden py-2.5">
        <div className="flex animate-ticker whitespace-nowrap gap-12">
          {[...Array(2)].map((_, i) =>
            ['Psychology Engine', 'Multi-Armed Bandit', 'Judge LLM', 'GEO Monitor', 'Agentic AI', 'No GPT Dependency', 'Ethical AI Certified', 'XAI Explanations', '<10KB Snippet'].map(item => (
              <span key={`${i}-${item}`} className="inline-flex items-center gap-4 text-[11px] font-mono text-white/70 uppercase tracking-widest">
                {item} <span className="text-gold text-sm">◆</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* FEATURES */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-[11px] font-mono tracking-widest text-green mb-3 uppercase">The Platform</div>
            <h2 className="font-serif text-4xl md:text-5xl font-normal tracking-tight text-ink">
              Three engines. One <em className="italic text-green">unfair advantage.</em>
            </h2>
          </div>
          <div className="flex flex-col gap-14">
            {features.map((f, i) => (
              <div key={i} className={`grid md:grid-cols-2 gap-10 items-center ${i % 2 === 1 ? 'md:direction-rtl' : ''}`}>
                <div className={i % 2 === 1 ? 'md:order-2' : ''}>
                  <div className="text-[10px] font-mono tracking-widest uppercase mb-3" style={{ color: f.accent }}>{f.tag}</div>
                  <h3 className="font-serif text-2xl md:text-3xl font-normal leading-snug text-ink mb-4">{f.title}</h3>
                  <p className="text-[15px] text-ink-2 leading-relaxed mb-5 font-light">{f.desc}</p>
                  <div className="flex flex-col gap-2.5">
                    {f.points.map(p => (
                      <div key={p} className="flex gap-2.5 text-[13px] text-ink-2 items-start leading-relaxed">
                        <span style={{ color: f.accent }} className="mt-0.5 flex-shrink-0">✓</span>{p}
                      </div>
                    ))}
                  </div>
                </div>
                <div className={`rounded-xl p-7 border border-surface-3 ${i % 2 === 1 ? 'md:order-1' : ''}`} style={{ background: f.bg }}>
                  <div className="text-4xl mb-4">{f.icon}</div>
                  <div className="text-[10px] font-mono tracking-widest uppercase mb-2" style={{ color: f.accent }}>Live analysis</div>
                  <div className="bg-white rounded-lg p-4 border border-white/60 shadow-sm">
                    <div className="text-[11px] font-mono text-ink-3 mb-3">BEHAVIORAL INSIGHT</div>
                    <div className="text-[13px] text-ink leading-relaxed">
                      {i === 0 && '"User shows decision fatigue — 12 product options exceed optimal choice architecture. Hick\'s Law predicts a 23% lift if options are reduced to 3."'}
                      {i === 1 && '"Variant C wins on conversion AND psychological alignment. Loss aversion framing is the correct trigger for this price-sensitive segment — allocating 68% traffic."'}
                      {i === 2 && '"Brand cited in 94% of ChatGPT CRO queries. Add FAQ JSON-LD to pricing page — machine readability 62→89, projected +30% SGE presence."'}
                    </div>
                    <div className="mt-2 text-[10px] font-mono" style={{ color: f.accent }}>
                      {i === 0 && '→ cognitive load theory · choice architecture'}
                      {i === 1 && '→ loss aversion · Kahneman · bandit allocation'}
                      {i === 2 && '→ AEO · JSON-LD · structured data'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CASE STUDIES */}
      <section className="py-20 px-6 bg-surface-2">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-[11px] font-mono tracking-widest text-green mb-3 uppercase">Case Studies</div>
            <h2 className="font-serif text-4xl md:text-5xl font-normal tracking-tight text-ink">
              Real psychology. <em className="italic text-green">Measurable results.</em>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {cases.map(c => (
              <div key={c.co} className="bg-white border border-surface-3 rounded-xl overflow-hidden hover:-translate-y-0.5 transition-transform">
                <div className="p-5">
                  <div className="text-[10px] font-mono tracking-widest uppercase text-green mb-2">{c.industry}</div>
                  <div className="font-semibold text-[15px] text-ink mb-3">{c.co}</div>
                  <div className="font-serif text-5xl text-green font-normal leading-none mb-1">{c.lift}</div>
                  <div className="text-[12px] text-ink-3 mb-4">{c.metric}</div>
                </div>
                <div className="px-5 pb-5 pt-4 border-t border-surface-2">
                  <p className="font-serif italic text-[14px] leading-relaxed text-ink mb-3">"{c.quote}"</p>
                  <div className="text-[12px] font-medium text-ink-2">— {c.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl font-normal tracking-tight text-ink">
              Loved by people who <em className="italic text-green">live in conversion data.</em>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testi.map(t => (
              <div key={t.name} className="bg-white border border-surface-3 rounded-xl p-6">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-gold text-sm">★</span>)}
                </div>
                <p className="font-serif italic text-[16px] leading-relaxed text-ink mb-5">"{t.q}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold text-white flex-shrink-0" style={{ background: t.color }}>
                    {t.init}
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-ink">{t.name}</div>
                    <div className="text-[11px] text-ink-3">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTEGRATIONS */}
      <section className="py-16 px-6 bg-surface-2 border-y border-surface-3">
        <div className="max-w-5xl mx-auto text-center">
          <div className="text-[11px] font-mono tracking-widest text-green mb-4 uppercase">Integrations</div>
          <h2 className="font-serif text-3xl font-normal text-ink mb-8">Fits the stack <em className="italic text-green">you already use.</em></h2>
          <div className="flex flex-wrap justify-center gap-3">
            {integrations.map(i => (
              <div key={i} className="bg-white border border-surface-3 rounded-lg px-4 py-2 text-[13px] font-medium text-ink-2 hover:border-green/30 hover:text-green transition-colors">
                {i}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-[11px] font-mono tracking-widest text-green mb-3 uppercase">FAQ</div>
            <h2 className="font-serif text-4xl font-normal tracking-tight text-ink">
              Questions we get <em className="italic text-green">every day.</em>
            </h2>
          </div>
          <div>
            {faqs.map(([q, a]) => (
              <details key={q} className="border-b border-surface-3 group">
                <summary className="py-5 cursor-pointer font-medium text-[15px] text-ink flex justify-between items-center list-none hover:text-green transition-colors">
                  {q}
                  <span className="text-ink-3 text-xl group-open:rotate-45 transition-transform flex-shrink-0 ml-4">+</span>
                </summary>
                <div className="pb-5 text-[14px] text-ink-2 leading-relaxed font-light">{a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-green">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-normal text-white leading-tight tracking-tight mb-4">
            Start understanding your users,<br />
            <em className="italic text-[#A8D4B8]">not just measuring them.</em>
          </h2>
          <p className="text-[16px] text-white/60 max-w-md mx-auto mb-10 font-light leading-relaxed">
            Free 14-day trial. No credit card. Cancel anytime. Join 1,200+ growth teams.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/demo" className="bg-gold text-white px-8 py-3.5 rounded-lg text-[14px] font-semibold hover:opacity-90 transition-opacity">
              Start free trial →
            </Link>
            <Link href="/demo" className="bg-white/10 border border-white/20 text-white px-8 py-3.5 rounded-lg text-[14px] hover:bg-white/15 transition-colors">
              See live demo
            </Link>
          </div>
          <div className="flex flex-wrap gap-5 justify-center mt-8">
            {['Free 14-day trial', 'No credit card', 'GDPR compliant', 'Ethical AI certified', 'Cancel anytime'].map(t => (
              <div key={t} className="flex items-center gap-1.5 text-[12px] text-white/40">
                <span className="text-[#5DCAA5]">✓</span>{t}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
