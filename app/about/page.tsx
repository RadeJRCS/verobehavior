import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <div className="pt-24 flex-1">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="text-[11px] font-mono tracking-widest text-green mb-4 uppercase">About VeroBehavior</div>
          <h1 className="font-serif text-5xl font-normal tracking-tight text-ink leading-tight mb-8">
            We are not building a better CRO tool.<br />
            <em className="italic text-green">We are building a new category.</em>
          </h1>
          <div className="prose max-w-none text-ink-2 text-[15px] leading-relaxed font-light space-y-5">
            <p>
              Every CRO tool on the market answers the same question: <em>what are users doing?</em> They show you heatmaps, scroll maps, click data. They tell you a button was clicked 340 times last week.
            </p>
            <p>
              VeroBehavior asks the question that actually drives growth: <strong className="font-semibold text-ink">why are they doing it?</strong>
            </p>
            <p>
              We built a proprietary AI engine — not dependent on GPT-4, Claude, or any third-party LLM — fine-tuned on behavioral economics, Cialdini's influence principles, cognitive load theory, and 2M+ tagged user sessions. It classifies every visitor into psychological states: hesitation, decision fatigue, social proof seeking, high intent, confusion.
            </p>
            <p>
              And it explains — in human language, with citations — exactly which psychological principle is driving that behavior, and what to do about it.
            </p>
            <div className="bg-surface rounded-xl p-6 my-8 border border-surface-3">
              <div className="font-serif text-xl text-green mb-2">Our Ethical AI Charter</div>
              <p className="text-[14px]">
                We believe behavioral psychology in marketing can be used ethically or manipulatively. VeroBehavior is designed to help users make better, more confident decisions — not to coerce or deceive. Every recommendation we generate is evaluated against our Ethical AI principles. We hold an independent certification. We will never recommend dark patterns, manufactured urgency, or manipulative tactics.
              </p>
            </div>
            <p>
              The data flywheel is our moat. Every client session we analyze makes our psychological model smarter. By the time a competitor considers building what we have, we will have millions of additional data points they cannot access.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { n: '2026', l: 'Founded' },
              { n: '1,200+', l: 'Customers' },
              { n: '2M+', l: 'Sessions analyzed' },
            ].map(s => (
              <div key={s.l} className="text-center bg-surface border border-surface-3 rounded-xl py-6">
                <div className="font-serif text-3xl text-green mb-1">{s.n}</div>
                <div className="text-[12px] text-ink-3 font-mono">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="mt-10 flex gap-3">
            <Link href="/demo" className="bg-green text-white px-7 py-3 rounded-lg text-[14px] font-semibold hover:opacity-90 transition-opacity">
              Try the live demo →
            </Link>
            <Link href="/pricing" className="bg-surface text-ink border border-surface-3 px-7 py-3 rounded-lg text-[14px] hover:border-ink-3 transition-colors">
              View pricing
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
