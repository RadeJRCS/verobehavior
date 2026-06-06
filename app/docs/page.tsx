import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Link from 'next/link'

const sections = [
  { icon: '🚀', title: 'Quick start', desc: 'Install the snippet and see your first insights in under 5 minutes.', items: ['Create account', 'Get API key', 'Install snippet', 'First insights in 48h'] },
  { icon: '🔧', title: 'Integration guides', desc: 'Step-by-step guides for every platform we support.', items: ['Shopify', 'WooCommerce', 'WordPress', 'Google Tag Manager', 'Custom HTML', 'React / Next.js'] },
  { icon: '🧠', title: 'Psychology engine', desc: 'How our AI classifies behavior and generates insights.', items: ['Behavioral tagging', 'Cognitive states', 'Psychological principles', 'XAI explanations'] },
  { icon: '⚖️', title: 'Decision engine', desc: 'Multi-armed bandit, Judge LLM, and test evaluation.', items: ['MAB algorithm', 'Judge LLM scoring', 'Predictive ranking', 'Agentic mode'] },
  { icon: '🌐', title: 'GEO monitor', desc: 'AI search visibility and machine readability optimization.', items: ['ChatGPT monitoring', 'Perplexity tracking', 'JSON-LD setup', 'Machine readability'] },
  { icon: '📡', title: 'API reference', desc: 'REST API documentation for custom integrations.', items: ['Authentication', 'POST /api/analyze', 'POST /api/geo', 'GET /api/sessions', 'Webhooks', 'Rate limits'] },
]

export default function DocsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <div className="pt-24 pb-6 px-6 bg-surface text-center">
        <div className="text-[11px] font-mono tracking-widest text-green mb-3 uppercase">Documentation</div>
        <h1 className="font-serif text-4xl md:text-5xl font-normal tracking-tight text-ink mb-4">Everything you need to<br /><em className="italic text-green">get started and scale.</em></h1>
        <p className="text-[16px] text-ink-2 max-w-md mx-auto font-light">Integration guides, API reference, and best practices.</p>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-12 flex-1">
        <div className="bg-green rounded-xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-white font-serif text-xl mb-1">Quick start: 5 minutes</div>
            <div className="text-white/60 text-[13px] font-light">Add one line of code and see your first behavioral insights within 48 hours.</div>
          </div>
          <code className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-[11px] font-mono text-[#A8D4B8] whitespace-nowrap">
            {'<script src=".../vb.min.js" async>'}
          </code>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {sections.map(s => (
            <div key={s.title} className="bg-white border border-surface-3 rounded-xl p-6 hover:-translate-y-0.5 transition-transform cursor-pointer">
              <div className="text-2xl mb-3">{s.icon}</div>
              <div className="font-serif text-lg text-ink mb-2">{s.title}</div>
              <p className="text-[13px] text-ink-2 font-light leading-relaxed mb-4">{s.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {s.items.map(item => (
                  <span key={item} className="text-[10px] font-mono bg-surface text-ink-2 px-2 py-0.5 rounded-full">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 bg-surface-2 border border-surface-3 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-serif text-xl text-ink mb-1">Need help?</div>
            <p className="text-[13px] text-ink-2 font-light">Our support team responds within 4 hours during business hours.</p>
          </div>
          <Link href="/contact" className="bg-green text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold hover:opacity-90 whitespace-nowrap">Contact support →</Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
