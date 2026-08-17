import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <div className="pt-24 pb-6 px-6 bg-surface text-center">
        <div className="text-[11px] font-mono tracking-widest text-green mb-3 uppercase">Pricing</div>
        <h1 className="font-serif text-4xl md:text-5xl font-normal tracking-tight text-ink mb-4">Pricing shaped by our <em className="italic text-green">design partners.</em></h1>
        <p className="text-[16px] text-ink-2 max-w-md mx-auto font-light">VeroBehavior is in beta. We&apos;re finalizing pricing with our first e-commerce partners, so it reflects real value, not guesswork.</p>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-12 flex-1">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-surface-2 border border-surface-3 rounded-2xl p-8 text-center flex flex-col">
            <div className="font-serif text-2xl text-ink mb-3">Design partners: free</div>
            <p className="text-[15px] text-ink-2 font-light max-w-lg mx-auto mb-6 leading-relaxed flex-1">Full platform access during our beta, in exchange for feedback and permission to share results. Founding partners lock in a lifetime discount when we launch paid plans.</p>
            <Link href="/contact" className="bg-transparent border border-green text-green hover:bg-green/5 px-8 py-3.5 rounded-lg text-[14px] font-semibold inline-block transition-colors">Apply as design partner</Link>
          </div>

          <div className="bg-surface-2 border border-surface-3 rounded-2xl p-8 text-center flex flex-col">
            <div className="font-serif text-2xl text-ink mb-3">Public pricing: coming soon</div>
            <p className="text-[15px] text-ink-2 font-light max-w-lg mx-auto mb-6 leading-relaxed flex-1">Free tier is live now — sign up anytime. Paid usage-based plans, tied to your store&apos;s monthly traffic with no per-seat fees, are coming as we finalize them with our early partners.</p>
            <Link href="/contact" className="bg-transparent text-ink-2 border border-surface-3 hover:border-ink-3 px-8 py-3.5 rounded-lg text-[14px] font-semibold inline-block">Talk to us</Link>
          </div>
        </div>

        <div className="text-center text-[12px] text-ink-3">All plans will include: GDPR compliant · under-10KB snippet · zero CLS · explainable AI insights</div>
      </div>
      <Footer />
    </div>
  )
}
