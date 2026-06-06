import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Link from 'next/link'

const features = [
  {
    icon: '🧠', tag: 'Psychology engine',
    title: 'Every session explained in the language of human psychology.',
    desc: 'Our AI, powered by Claude, analyzes user sessions and explains the why behind every behavior: citing Cialdini, Kahneman, cognitive load theory, and more. No black box. Every insight is explainable.',
    points: ['Auto-tagging: hesitation, decision fatigue, confusion, high intent', 'XAI: every recommendation cites its psychological principle', 'Brand-voice tuning: insights match your communication style', 'Ethical AI by design: fully explainable, human-in-the-loop'],
    accent: '#1A3A2A', bg: '#E8F2EC',
  },
  {
    icon: '⚖️', tag: 'Decision engine',
    title: 'Tests that get smarter while they run.',
    desc: 'Multi-armed bandit allocates traffic to winning variants in real time. A Judge LLM evaluates each variant on psychological alignment: not just conversion lift: so you understand why it won.',
    points: ['Multi-armed bandit: dynamic traffic reallocation in hours, not weeks', 'Judge LLM: scores variants on psychological effectiveness', 'Predictive test ranking: AI prioritizes your backlog by impact', 'Agentic mode: one-click autonomous test launch with approval gate'],
    accent: '#854F0B', bg: '#FBF3E4',
  },
  {
    icon: '🌐', tag: 'Visibility engine',
    title: 'Optimize how AI search finds your brand: and converts them.',
    desc: 'As ChatGPT, Perplexity, and Google SGE replace traditional search, your brand must be visible before the click and compelling after it. VeroBehavior connects both layers.',
    points: ['Brand monitoring across ChatGPT, Perplexity, SGE', 'AEO + JSON-LD structured data engine', 'Machine readability score: 0 to 100, with specific fixes', 'Intent-to-conversion bridge: connect AI search to on-site psychology'],
    accent: '#1A4A6E', bg: '#E8F0F8',
  },
]

const useCases = [
  { industry: 'E-commerce', problem: 'High cart abandonment', insight: 'AI detects decision fatigue from too many product options', action: 'Recommends simplified layout based on cognitive load theory', principle: 'Hick\'s Law · choice architecture' },
  { industry: 'SaaS', problem: 'Low trial signup conversion', insight: 'AI identifies hesitation behavior near the CTA button', action: 'Suggests reduced-commitment language + social proof placement', principle: 'Loss aversion · commitment bias (Cialdini)' },
  { industry: 'Lead generation', problem: 'Form abandonment on long forms', insight: 'AI recognizes overwhelm and friction patterns', action: 'Proposes multi-step form with progress indicator', principle: 'Endowed progress effect' },
]

const faqs = [
  ['How is VeroBehavior different from VWO or Optimizely?', 'VWO and Optimizely show you what users did: click rates, scroll depth, conversions. VeroBehavior explains why they behaved that way, expressed in psychological terms. We don\'t replace those tools; we provide the intelligence layer that makes testing decisions more informed.'],
  ['Does VeroBehavior slow down my website?', 'No. Our JavaScript snippet is under 10KB, loads asynchronously, and produces zero Cumulative Layout Shift (CLS). All AI processing happens server-side, not in the browser.'],
  ['How does the AI work: is it GPT?', 'Our current MVP uses Claude via the Anthropic API for behavioral analysis. Our roadmap includes building a proprietary fine-tuned model trained on behavioral psychology and session data to reduce latency and improve domain accuracy.'],
  ['Is my data safe?', 'All behavioral data is fully anonymized and tied to pseudonymous session IDs. We never collect personally identifiable information from website visitors. GDPR and CCPA compliant by design.'],
  ['How quickly can I see results?', 'First psychological insights appear within 48 hours of installing the snippet, depending on your traffic volume. The more sessions our AI analyzes, the more accurate the insights become.'],
  ['What stage is the product in?', 'VeroBehavior is currently in private beta. We are onboarding a select group of design partners who get free early access in exchange for feedback. Apply through our contact page.'],
]

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 text-center bg-surface">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-green-light border border-green/20 rounded-full px-4 py-1.5 text-[11px] font-mono font-medium text-green mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
            Private beta: accepting design partners
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-normal leading-[1.05] tracking-tight text-ink mb-6">
            Stop testing words.<br />
            <em className="italic text-green">Start testing psychology.</em>
          </h1>
          <p className="text-lg text-ink-2 max-w-xl mx-auto mb-10 leading-relaxed font-light">
            VeroBehavior is the first CRO platform that explains the <em>why</em> behind every click, scroll, and conversion: powered by AI trained on behavioral science.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            <Link href="/demo" className="bg-green text-white px-7 py-3.5 rounded-lg text-[14px] font-semibold hover:opacity-90 transition-opacity">
              See live demo →
            </Link>
            <Link href="/contact" className="bg-white text-ink border border-surface-3 px-7 py-3.5 rounded-lg text-[14px] hover:border-ink-3 transition-colors">
              Apply for early access
            </Link>
          </div>
          <p className="text-[13px] text-ink-3 mb-14">
            Free for design partners · One-line integration · GDPR compliant
          </p>

          {/* What it does: not fake stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 border border-surface-3 rounded-xl overflow-hidden bg-white max-w-3xl mx-auto">
            {[
              { n: 'Why', desc: 'Explains the psychology behind user behavior' },
              { n: '<50ms', desc: 'Real-time behavioral analysis' },
              { n: '<10KB', desc: 'Lightweight snippet, zero CLS' },
            ].map((s, i) => (
              <div key={i} className="py-5 px-4 text-center border-r border-surface-3 last:border-r-0">
                <div className="font-serif text-3xl text-green leading-none mb-1">{s.n}</div>
                <div className="text-[11px] text-ink-3">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="bg-green overflow-hidden py-2.5">
        <div className="flex animate-ticker whitespace-nowrap gap-12" style={{ animationDuration: '22s' }}>
          {[...Array(2)].map((_, i) =>
            ['Psychology Engine', 'Multi-Armed Bandit', 'Judge LLM', 'GEO Monitor', 'Behavioral Tagging', 'XAI Explanations', 'Ethical AI', 'Real-time Analysis'].map(item => (
              <span key={`${i}-${item}`} className="inline-flex items-center gap-4 text-[11px] font-mono text-white/70 uppercase tracking-widest">
                {item} <span className="text-gold text-sm">◆</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6 bg-surface-2 border-y border-surface-3">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <div className="text-[11px] font-mono tracking-widest text-green mb-3 uppercase">How it works</div>
          <h2 className="font-serif text-4xl font-normal tracking-tight text-ink mb-4">
            One line of code. <em className="italic text-green">Insights in 48 hours.</em>
          </h2>
        </div>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            { step: '01', icon: '📋', title: 'Install the snippet', desc: 'Add one line of JavaScript to your site header. Under 10KB, async, no performance impact. Works with Shopify, WordPress, or any HTML site.' },
            { step: '02', icon: '🧠', title: 'AI analyzes behavior', desc: 'Our AI watches how users interact with your pages: detecting hesitation, decision fatigue, confusion, and high intent patterns in real time.' },
            { step: '03', icon: '💡', title: 'Get actionable insights', desc: 'The dashboard shows exactly why users behave the way they do, which psychological principles are at play, and what specific changes will improve conversion.' },
          ].map(s => (
            <div key={s.step} className="bg-white border border-surface-3 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-green" />
              <div className="text-[10px] font-mono text-ink-3 tracking-widest mb-3">{s.step}</div>
              <div className="text-2xl mb-3">{s.icon}</div>
              <div className="font-serif text-lg text-ink mb-2">{s.title}</div>
              <div className="text-[13px] text-ink-2 leading-relaxed font-light">{s.desc}</div>
            </div>
          ))}
        </div>
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-[#0E0E14] rounded-xl p-5 text-center">
            <div className="text-[10px] font-mono text-white/40 tracking-widest mb-2">THE SNIPPET</div>
            <code className="text-[13px] font-mono text-[#A8D4B8]">
              {'<script src="https://verobehavior.vercel.app/api/snippet?key=YOUR_KEY" async></script>'}
            </code>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-[11px] font-mono tracking-widest text-green mb-3 uppercase">The platform</div>
            <h2 className="font-serif text-4xl md:text-5xl font-normal tracking-tight text-ink">
              Three engines. One <em className="italic text-green">unfair advantage.</em>
            </h2>
          </div>
          <div className="flex flex-col gap-14">
            {features.map((f, i) => (
              <div key={i} className="grid md:grid-cols-2 gap-10 items-center">
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
                  <div className="text-[10px] font-mono tracking-widest uppercase mb-2" style={{ color: f.accent }}>How it works</div>
                  <div className="bg-white rounded-lg p-4 border border-white/60 shadow-sm">
                    <div className="text-[11px] font-mono text-ink-3 mb-3">AI INSIGHT EXAMPLE</div>
                    <div className="text-[13px] text-ink leading-relaxed">
                      {i === 0 && '"User shows decision fatigue: 12 product options exceed optimal choice architecture. Hick\'s Law predicts a 23% lift if options are reduced to 3."'}
                      {i === 1 && '"Variant C wins on conversion AND psychological alignment. Loss aversion framing is the correct trigger for this price-sensitive segment: allocating 68% traffic."'}
                      {i === 2 && '"Brand cited in 94% of ChatGPT CRO queries. Add FAQ JSON-LD to pricing page: machine readability 62→89, projected +30% SGE presence."'}
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

      {/* USE CASES: real examples, not fake case studies */}
      <section className="py-20 px-6 bg-surface-2 border-y border-surface-3">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-[11px] font-mono tracking-widest text-green mb-3 uppercase">Use cases</div>
            <h2 className="font-serif text-4xl font-normal tracking-tight text-ink">
              How VeroBehavior solves <em className="italic text-green">real problems.</em>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {useCases.map(uc => (
              <div key={uc.industry} className="bg-white border border-surface-3 rounded-xl overflow-hidden">
                <div className="p-5">
                  <div className="text-[10px] font-mono tracking-widest uppercase text-green mb-2">{uc.industry}</div>
                  <div className="font-serif text-lg text-ink mb-3">{uc.problem}</div>
                  <div className="space-y-3">
                    {[
                      { label: 'AI detects', text: uc.insight },
                      { label: 'Recommends', text: uc.action },
                    ].map(s => (
                      <div key={s.label}>
                        <div className="text-[10px] font-mono text-ink-3 uppercase tracking-wider mb-1">{s.label}</div>
                        <div className="text-[13px] text-ink-2 leading-relaxed font-light">{s.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-5 py-3 bg-surface border-t border-surface-3">
                  <div className="text-[10px] font-mono text-green">→ {uc.principle}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/demo" className="text-[13px] text-green font-medium hover:underline">
              See these principles in action with our live demo →
            </Link>
          </div>
        </div>
      </section>

      {/* WHY VEROBEHAVIOR: instead of fake testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-normal tracking-tight text-ink">
              Why build with <em className="italic text-green">behavioral psychology?</em>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { q: 'Current CRO tools tell you what users did.', a: 'VeroBehavior tells you why: in the language of Cialdini, Kahneman, and cognitive science. That changes what you test next.' },
              { q: 'A/B tests take weeks and often inconclusive.', a: 'Our multi-armed bandit + Judge LLM shifts traffic dynamically and evaluates results on psychological effectiveness, not just statistics.' },
              { q: 'Hiring a behavioral psychologist costs $150K+/year.', a: 'VeroBehavior makes that expertise available as a SaaS product for a fraction of the cost, improving with every session it analyzes.' },
              { q: 'AI search is replacing traditional Google clicks.', a: 'Our GEO engine monitors how AI represents your brand in ChatGPT, Perplexity, and SGE: and connects that visibility to on-site conversion.' },
            ].map(item => (
              <div key={item.q} className="bg-white border border-surface-3 rounded-xl p-6">
                <div className="font-serif text-[16px] text-ink mb-3 leading-snug">{item.q}</div>
                <div className="text-[13px] text-ink-2 leading-relaxed font-light">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-surface-2 border-t border-surface-3">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-[11px] font-mono tracking-widest text-green mb-3 uppercase">FAQ</div>
            <h2 className="font-serif text-4xl font-normal tracking-tight text-ink">
              Common questions.<br /><em className="italic text-green">Honest answers.</em>
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
            Understand your users.<br />
            <em className="italic text-[#A8D4B8]">Not just measure them.</em>
          </h2>
          <p className="text-[16px] text-white/60 max-w-md mx-auto mb-10 font-light leading-relaxed">
            We are accepting a limited number of design partners for our private beta. Free access in exchange for feedback.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/demo" className="bg-gold text-white px-8 py-3.5 rounded-lg text-[14px] font-semibold hover:opacity-90 transition-opacity">
              Try the live demo →
            </Link>
            <Link href="/contact" className="bg-white/10 border border-white/20 text-white px-8 py-3.5 rounded-lg text-[14px] hover:bg-white/15 transition-colors">
              Apply as design partner
            </Link>
          </div>
          <div className="flex flex-wrap gap-5 justify-center mt-8">
            {['Free for beta partners', 'One-line integration', 'GDPR compliant', 'Ethical AI by design'].map(t => (
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
