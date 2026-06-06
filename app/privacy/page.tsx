import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const sections = [
  { t: '1. Introduction', p: 'VeroBehavior Inc. ("we", "our", "us") is committed to protecting the privacy of our users and their website visitors. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform and services.' },
  { t: '2. Data we collect', p: 'Our JavaScript snippet collects behavioral data from website visitors including: mouse movements and click patterns, scroll depth and page engagement time, form interactions (field focus, not field content), device type, browser, and general geographic location (country/region level from IP, which is never stored). All behavioral data is fully anonymized and tied to pseudonymous session IDs. We never collect personally identifiable information (PII) such as names, emails, phone numbers, or payment information from your website visitors.' },
  { t: '3. How we use data', p: 'Behavioral data is processed by our AI engine to generate psychological insights and conversion optimization recommendations. Data may be used in aggregate, anonymized form to improve our AI models, only with explicit client consent through our Shared Training Program. Individual session data is never shared with third parties, sold, or used for advertising.' },
  { t: '4. Data retention', p: 'Session data is retained for 90 days by default. Clients on Growth and Scale plans can configure retention periods from 30 days to 24 months. All data is encrypted at rest (AES-256) and in transit (TLS 1.3). Upon account termination, all client data is permanently deleted within 30 days.' },
  { t: '5. GDPR compliance', p: 'VeroBehavior is fully compliant with the General Data Protection Regulation (GDPR). We act as a data processor on behalf of our clients (data controllers). We support data subject access requests, right to erasure, and data portability. We maintain a Data Processing Agreement (DPA) available upon request.' },
  { t: '6. CCPA compliance', p: 'For California residents, VeroBehavior complies with the California Consumer Privacy Act. We do not sell personal information and provide mechanisms for consumers to request access to or deletion of their data through their website operator.' },
  { t: '7. Ethical AI commitment', p: 'Our AI engine is independently certified under our Ethical AI Charter. We do not recommend manipulative or deceptive practices. All AI recommendations include explainable reasoning (XAI), citing the specific psychological principle behind each suggestion. An internal Ethics Review Board evaluates our models quarterly.' },
  { t: '8. Contact', p: 'For privacy-related inquiries, contact our Data Protection Officer at privacy@verobehavior.com or through our contact page.' },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col"><Nav />
      <div className="pt-24 flex-1"><div className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-[11px] font-mono tracking-widest text-green mb-4 uppercase">Legal</div>
        <h1 className="font-serif text-4xl font-normal tracking-tight text-ink mb-2">Privacy Policy</h1>
        <p className="text-[13px] text-ink-3 mb-10 font-mono">Last updated: May 1, 2026</p>
        <div className="space-y-8">
          {sections.map(s => <div key={s.t}><h2 className="font-serif text-xl text-ink font-normal mb-3">{s.t}</h2><p className="text-[15px] text-ink-2 leading-relaxed font-light">{s.p}</p></div>)}
        </div>
      </div></div>
      <Footer />
    </div>
  )
}
