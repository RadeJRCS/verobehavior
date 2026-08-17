import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const sections = [
  { t: '1. Acceptance of terms', p: 'By accessing or using VeroBehavior services, you agree to be bound by these Terms of Service. If you are using our services on behalf of an organization, you represent that you have the authority to bind that organization.' },
  { t: '2. Description of service', p: 'VeroBehavior provides an AI-powered Conversion Rate Optimization platform that analyzes user behavior on websites and provides psychologically-informed insights and recommendations. The service includes a JavaScript tracking snippet, an analytics dashboard, AI-generated insights, and experimentation tools.' },
  { t: '3. Subscription and billing', p: 'VeroBehavior is currently in beta. Design partners receive free access in exchange for feedback. Public pricing plans have not launched yet and will be published once we finalize them with our early e-commerce partners. Terms for paid plans, billing, and refunds will be added here once pricing goes live.' },
  { t: '4. Acceptable use', p: 'You agree not to use VeroBehavior to: collect personally identifiable information without consent, implement deceptive or manipulative practices, violate any applicable laws or regulations, or reverse-engineer our AI models or algorithms.' },
  { t: '5. Data ownership', p: 'You retain ownership of all data collected through your use of VeroBehavior. We process this data solely to provide our services. We delete your data on request and do not retain it longer than necessary, and you may request an export at any time.' },
  { t: '6. Service level agreement', p: 'VeroBehavior is currently in beta and does not yet offer a formal uptime SLA. We aim for high reliability and will publish a formal SLA alongside paid plans. Planned maintenance windows will be communicated in advance.' },
  { t: '7. Limitation of liability', p: 'VeroBehavior AI-generated recommendations are informational and should not be considered professional advice. We are not liable for business decisions made based on our insights. Our total liability is limited to the fees paid in the 12 months preceding any claim.' },
  { t: '8. Contact', p: 'For questions about these terms, contact hello@verobehavior.com.' },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col"><Nav />
      <div className="pt-24 flex-1"><div className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-[11px] font-mono tracking-widest text-green mb-4 uppercase">Legal</div>
        <h1 className="font-serif text-4xl font-normal tracking-tight text-ink mb-2">Terms of Service</h1>
        <p className="text-[13px] text-ink-3 mb-10 font-mono">Last updated: August 7, 2026</p>
        <div className="space-y-8">
          {sections.map(s => <div key={s.t}><h2 className="font-serif text-xl text-ink font-normal mb-3">{s.t}</h2><p className="text-[15px] text-ink-2 leading-relaxed font-light">{s.p}</p></div>)}
        </div>
      </div></div>
      <Footer />
    </div>
  )
}
