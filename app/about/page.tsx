import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col"><Nav />
      <div className="pt-24 flex-1"><div className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-[11px] font-mono tracking-widest text-green mb-4 uppercase">About VeroBehavior</div>
        <h1 className="font-serif text-5xl font-normal tracking-tight text-ink leading-tight mb-8">We are building a new category in <em className="italic text-green">conversion optimization.</em></h1>
        <div className="space-y-5 text-ink-2 text-[15px] leading-relaxed font-light">
          <p>Every CRO tool on the market answers the same question: <em>what are users doing?</em> They show heatmaps, scroll maps, click data. Useful, but incomplete.</p>
          <p>VeroBehavior asks the question that actually drives growth: <strong className="font-semibold text-ink">why are they doing it?</strong></p>
          <p>We built an AI engine powered by the Anthropic Claude API: analyzing user sessions through the lens of behavioral economics, Cialdini&apos;s influence principles, and cognitive load theory: to classify every visitor into psychological states and explain what is driving their behavior.</p>
          <p>This is not a better heatmap. It is a fundamentally different way to approach conversion optimization: one grounded in behavioral science, not guesswork.</p>
        </div>
        <div className="bg-surface rounded-xl p-6 my-10 border border-surface-3">
          <div className="font-serif text-xl text-green mb-3">Our ethical AI commitment</div>
          <p className="text-[14px] text-ink-2 leading-relaxed font-light">We believe behavioral psychology in marketing can be used ethically or manipulatively. VeroBehavior is designed to help users make better, more confident decisions: not to coerce or deceive. Every recommendation our AI generates is explainable, citing the specific psychological principle behind it. We will never recommend dark patterns, manufactured urgency, or manipulative tactics.</p>
        </div>
        <div className="space-y-5 text-ink-2 text-[15px] leading-relaxed font-light">
          <h2 className="font-serif text-2xl text-ink font-normal mt-10 mb-3">Where we are now</h2>
          <p>VeroBehavior is currently in <strong className="text-ink font-semibold">private beta</strong>. Our core platform is live: the JavaScript snippet tracks behavior, the Claude API analyzes sessions in real time, and the dashboard displays psychological insights.</p>
          <p>We are accepting a limited number of <strong className="text-ink font-semibold">design partners</strong>: companies that get free access in exchange for feedback and the willingness to help us shape the product.</p>
          <h2 className="font-serif text-2xl text-ink font-normal mt-10 mb-3">What is next</h2>
          <p>Our roadmap includes psychological persona generation, industry-specific playbooks, GEO/AEO monitoring for AI search visibility, and an agentic AI mode that can autonomously suggest and launch tests.</p>
        </div>
        <div className="mt-10 flex gap-3 flex-wrap">
          <Link href="/demo" className="bg-green text-white px-7 py-3 rounded-lg text-[14px] font-semibold hover:opacity-90 transition-opacity">Try the live demo →</Link>
          <Link href="/contact" className="bg-surface text-ink border border-surface-3 px-7 py-3 rounded-lg text-[14px] hover:border-ink-3 transition-colors">Apply as design partner</Link>
        </div>
      </div></div>
      <Footer />
    </div>
  )
}
