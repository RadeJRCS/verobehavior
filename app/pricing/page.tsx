import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Link from 'next/link'

const plans = [
  {
    name: 'Free', price: '0', period: '/mo', badge: null,
    desc: 'Explore psychological CRO for the first time.',
    features: ['Up to 10K visitors/month', '1 active experiment', 'Basic psych tags', 'Session behavioral flags', 'Community support'],
    cta: 'Start free', ctaStyle: 'outline', available: 'Now',
  },
  {
    name: 'Starter', price: '499', period: '/mo', badge: null,
    desc: 'For growing e-commerce teams with an active CRO program.',
    features: ['Up to 100K visitors/month', '5 concurrent experiments', 'Full psych insights dashboard', 'XAI principle citations', '2 industry playbooks', 'Email support'],
    cta: 'Get started', ctaStyle: 'outline', available: 'Now',
  },
  {
    name: 'Growth', price: '1,499', period: '/mo', badge: 'MOST POPULAR',
    desc: 'The full psychological intelligence stack for serious growth teams.',
    features: ['Up to 500K visitors/month', 'Unlimited experiments', 'Multi-armed bandit + Judge LLM', 'GEO / AI visibility layer', 'Psych persona generation', 'CRM integrations', 'Brand-voice tuning', 'Priority support + CSM'],
    cta: 'Start Growth trial', ctaStyle: 'primary', available: 'Now',
  },
  {
    name: 'Scale', price: '4,999', period: '/mo', badge: null,
    desc: 'Agentic AI and enterprise-grade control for market leaders.',
    features: ['Unlimited traffic', 'Autonomous test launch (A2A)', 'Dynamic pricing AI agent', 'On-prem model deployment', 'Ethical AI certificate', 'EU AI Act compliance audit', 'Dedicated implementation team', 'Custom SLA + 99.9% uptime'],
    cta: 'Talk to sales', ctaStyle: 'outline', available: 'Phase 3',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <div className="pt-24 pb-6 px-6 bg-surface text-center">
        <div className="text-[11px] font-mono tracking-widest text-green mb-3 uppercase">Pricing</div>
        <h1 className="font-serif text-4xl md:text-5xl font-normal tracking-tight text-ink mb-4">
          Psychology at every <em className="italic text-green">price point.</em>
        </h1>
        <p className="text-[16px] text-ink-2 max-w-md mx-auto font-light leading-relaxed">
          Usage-based tiers that grow with your traffic. No per-seat fees. Cancel anytime.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 flex-1">
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {plans.map(plan => (
            <div key={plan.name}
              className={`bg-white border rounded-xl p-6 flex flex-col transition-transform hover:-translate-y-0.5 ${
                plan.badge ? 'border-2 border-green bg-green-light' : 'border-surface-3'
              }`}>
              {plan.badge && (
                <span className="bg-green text-white text-[9px] font-mono px-2 py-1 rounded-md mb-4 self-start tracking-widest">
                  {plan.badge}
                </span>
              )}
              {plan.available === 'Phase 3' && (
                <span className="bg-surface-3 text-ink-3 text-[9px] font-mono px-2 py-1 rounded-md mb-4 self-start tracking-widest">
                  PHASE 3
                </span>
              )}
              <div className="font-serif text-[20px] font-normal mb-2">{plan.name}</div>
              <div className="font-serif text-[34px] font-normal leading-none text-green mb-2">
                <sup className="text-[15px] align-top mt-2 mr-0.5">$</sup>{plan.price}
                <sub className="text-[12px] text-ink-3 font-sans font-normal">{plan.period}</sub>
              </div>
              <div className="text-[12px] text-ink-2 mb-5 leading-relaxed font-light">{plan.desc}</div>
              <div className="flex-1 flex flex-col gap-2 mb-6">
                {plan.features.map(f => (
                  <div key={f} className="flex gap-2 text-[12px] text-ink-2 items-start leading-relaxed">
                    <span className="text-green flex-shrink-0 mt-0.5">✓</span>{f}
                  </div>
                ))}
              </div>
              <Link href="/demo"
                className={`w-full py-2.5 rounded-lg text-[13px] font-semibold text-center transition-all block ${
                  plan.ctaStyle === 'primary'
                    ? 'bg-green text-white hover:opacity-90'
                    : 'bg-transparent text-ink-2 border border-surface-3 hover:border-ink-3'
                }`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
        <div className="text-center text-[12px] text-ink-3 mb-12">
          All plans: GDPR compliant · &lt;10KB snippet · 0 CLS · Core Web Vitals safe · XAI explanations · No performance impact
        </div>

        {/* ROI calc */}
        <div className="bg-green rounded-2xl p-8 text-white text-center">
          <div className="font-serif text-3xl font-normal mb-3">
            If you have $1M/month in revenue and we lift conversion by 2%,<br />
            <em className="italic text-[#A8D4B8]">that's $20,000/month in new revenue.</em>
          </div>
          <p className="text-white/60 text-[14px] mb-6 font-light">
            VeroBehavior Growth plan costs $1,499/month. ROI: 13×.
          </p>
          <Link href="/demo" className="bg-gold text-white px-8 py-3.5 rounded-lg text-[14px] font-semibold hover:opacity-90 transition-opacity inline-block">
            Start your free trial →
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
