import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const sections = [
  { t: '1. Acceptance of terms', p: 'By accessing or using VeroBehavior services, you agree to be bound by these Terms of Service. If you are using our services on behalf of an organization, you represent that you have the authority to bind that organization.' },
  { t: '2. Description of service', p: 'VeroBehavior provides an AI-powered Conversion Rate Optimization platform that analyzes user behavior on websites and provides psychologically-informed insights and recommendations. The service includes a JavaScript tracking snippet, an analytics dashboard, AI-generated insights, and experimentation tools.' },
  { t: '3. Subscription and billing', p: 'VeroBehavior offers tiered subscription plans based on monthly unique visitors and feature set. All plans are billed monthly or annually with a 14-day free trial. You may cancel at any time. Refunds are available within the first 30 days of a paid subscription.' },
  { t: '4. Acceptable use', p: 'You agree not to use VeroBehavior to: collect personally identifiable information without consent, implement deceptive or manipulative practices, violate any applicable laws or regulations, or reverse-engineer our AI models or algorithms.' },
  { t: '5. Data ownership', p: 'You retain ownership of all data collected through your use of VeroBehavior. We process this data solely to provide our services. Upon termination, all your data is deleted within 30 days unless you request an export.' },
  { t: '6. Service level agreement', p: 'VeroBehavior maintains 99.9% uptime for Scale plan customers. We provide status updates at status.verobehavior.com. Planned maintenance windows are communicated 72 hours in advance.' },
  { t: '7. Limitation of liability', p: 'VeroBehavior AI-generated recommendations are informational and should not be considered professional advice. We are not liable for business decisions made based on our insights. Our total liability is limited to the fees paid in the 12 months preceding any claim.' },
  { t: '8. Contact', p: 'For questions about these terms, contact legal@verobehavior.com.' },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col"><Nav />
      <div className="pt-24 flex-1"><div className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-[11px] font-mono tracking-widest text-green mb-4 uppercase">Legal</div>
        <h1 className="font-serif text-4xl font-normal tracking-tight text-ink mb-2">Terms of Service</h1>
        <p className="text-[13px] text-ink-3 mb-10 font-mono">Last updated: May 1, 2026</p>
        <div className="space-y-8">
          {sections.map(s => <div key={s.t}><h2 className="font-serif text-xl text-ink font-normal mb-3">{s.t}</h2><p className="text-[15px] text-ink-2 leading-relaxed font-light">{s.p}</p></div>)}
        </div>
      </div></div>
      <Footer />
    </div>
  )
}
