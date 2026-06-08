import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Link from 'next/link'

const plans = [
  { name: 'Free', price: '0', period: '/mo', badge: null, desc: 'Explore psychological CRO on your own site. No credit card required.', features: ['Up to 10K visitors/month', '1 active experiment', 'Basic behavioral tags', 'Session-level insights', 'Community support'], cta: 'Start free', ctaStyle: 'outline' as const, note: 'No credit card required' },
  { name: 'Starter', price: '149', period: '/mo', badge: null, desc: 'For teams getting started with psychology-driven CRO.', features: ['Up to 50K visitors/month', '3 concurrent experiments', 'Full psychology dashboard', 'XAI principle citations', 'Behavioral tagging engine', 'Email support'], cta: 'Start 14-day trial', ctaStyle: 'outline' as const, note: '14-day free trial included' },
  { name: 'Professional', price: '449', period: '/mo', badge: 'RECOMMENDED', desc: 'The full psychological intelligence stack for growth teams.', features: ['Up to 200K visitors/month', 'Unlimited experiments', 'Multi-armed bandit + Judge LLM', 'Psychological persona generation', '4 industry playbooks', 'Brand-voice tuning', 'Priority email + chat support'], cta: 'Start 14-day trial', ctaStyle: 'primary' as const, note: 'Most popular for mid-market teams' },
  { name: 'Business', price: '899', period: '/mo', badge: null, desc: 'Advanced features including GEO monitoring and CRM integrations.', features: ['Up to 500K visitors/month', 'Everything in Professional', 'GEO / AI visibility monitor', 'CRM integrations (HubSpot, Salesforce)', 'Dynamic content generation', 'Dedicated account manager', 'Phone + priority support'], cta: 'Contact us', ctaStyle: 'outline' as const, note: 'For scaling teams with 200K+ visitors' },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <div className="pt-24 pb-6 px-6 bg-surface text-center">
        <div className="text-[11px] font-mono tracking-widest text-green mb-3 uppercase">Pricing</div>
        <h1 className="font-serif text-4xl md:text-5xl font-normal tracking-tight text-ink mb-4">Simple, transparent <em className="italic text-green">pricing.</em></h1>
        <p className="text-[16px] text-ink-2 max-w-md mx-auto font-light">Usage-based tiers that grow with your traffic. No per-seat fees. Cancel anytime.</p>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-12 flex-1">
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {plans.map(plan => (
            <div key={plan.name} className={`bg-white border rounded-xl p-6 flex flex-col hover:-translate-y-0.5 transition-transform ${plan.badge ? 'border-2 border-green bg-green-light' : 'border-surface-3'}`}>
              {plan.badge && <span className="bg-green text-white text-[9px] font-mono px-2 py-1 rounded-md mb-4 self-start tracking-widest">{plan.badge}</span>}
              <div className="font-serif text-[20px] font-normal mb-2">{plan.name}</div>
              <div className="font-serif text-[34px] font-normal leading-none text-green mb-2">
                <sup className="text-[15px] align-top mt-2 mr-0.5">$</sup>{plan.price}
                <sub className="text-[12px] text-ink-3 font-sans font-normal">{plan.period}</sub>
              </div>
              <div className="text-[12px] text-ink-2 mb-5 leading-relaxed font-light">{plan.desc}</div>
              <div className="flex-1 flex flex-col gap-2 mb-6">
                {plan.features.map(f => <div key={f} className="flex gap-2 text-[12px] text-ink-2 items-start"><span className="text-green flex-shrink-0 mt-0.5">✓</span>{f}</div>)}
              </div>
              <Link href="/contact" className={`w-full py-2.5 rounded-lg text-[13px] font-semibold text-center block ${plan.ctaStyle === 'primary' ? 'bg-green text-white hover:opacity-90' : 'bg-transparent text-ink-2 border border-surface-3 hover:border-ink-3'}`}>{plan.cta}</Link>
              <div className="text-[11px] text-ink-3 text-center mt-2">{plan.note}</div>
            </div>
          ))}
        </div>

        <div className="text-center text-[12px] text-ink-3 mb-12">All plans include: GDPR compliant, less than 10KB snippet, zero CLS, XAI explanations, no performance impact</div>

        <div className="bg-surface-2 border border-surface-3 rounded-2xl p-8 text-center mb-8">
          <div className="font-serif text-2xl text-ink mb-3">Need enterprise features?</div>
          <p className="text-[15px] text-ink-2 font-light max-w-lg mx-auto mb-2 leading-relaxed">Agentic AI, A2A context protocol, dynamic pricing, on-premise deployment, and custom SLA are available for enterprise clients.</p>
          <p className="text-[13px] text-ink-3 mb-6">Contact us for a custom proposal tailored to your traffic and requirements.</p>
          <Link href="/contact" className="bg-green text-white px-8 py-3.5 rounded-lg text-[14px] font-semibold hover:opacity-90 inline-block">Talk to our team</Link>
        </div>

        <div className="bg-surface-2 border border-surface-3 rounded-2xl p-8 text-center">
          <div className="font-serif text-2xl text-ink mb-3">Design partner program</div>
          <p className="text-[15px] text-ink-2 font-light max-w-lg mx-auto mb-6 leading-relaxed">We are offering free access to a limited number of design partners. You get the full platform. We get your feedback to make the product better.</p>
          <Link href="/contact" className="bg-gold text-white px-8 py-3.5 rounded-lg text-[14px] font-semibold hover:opacity-90 inline-block">Apply as design partner</Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
