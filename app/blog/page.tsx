import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const posts = [
  { title: 'The Psychology of Cart Abandonment: Why 70% of Shoppers Leave', cat: 'Research', date: 'May 28, 2026', read: '8 min', excerpt: 'Decision fatigue, loss aversion, and cognitive load: the three psychological forces that drive cart abandonment, and how to counter each one.' },
  { title: "How Hick's Law Costs E-commerce Brands 23% of Their Revenue", cat: 'Case Study', date: 'May 14, 2026', read: '6 min', excerpt: 'We analyzed 1,200 e-commerce product pages. The ones with more than 6 variant options had conversion rates 23% lower.' },
  { title: 'GEO: Why Your Brand Needs to Optimize for AI Search', cat: 'Industry', date: 'Apr 30, 2026', read: '10 min', excerpt: 'With fewer than 41% of Google searches resulting in a click, brands must optimize for how AI represents them.' },
  { title: "Cialdini's 6 Principles Applied to Digital Product Pages", cat: 'Guide', date: 'Apr 18, 2026', read: '12 min', excerpt: 'Reciprocity, commitment, social proof, authority, liking, and scarcity: a practical guide with specific examples.' },
  { title: 'Multi-Armed Bandit vs. Traditional A/B Testing', cat: 'Technical', date: 'Apr 2, 2026', read: '7 min', excerpt: 'Traditional A/B tests waste traffic on losing variants. Multi-armed bandits dynamically shift traffic. Our decision framework.' },
  { title: 'The Case for Ethical AI in Conversion Optimization', cat: 'Ethics', date: 'Mar 20, 2026', read: '9 min', excerpt: 'Where is the line between persuasion and manipulation? Our Ethical AI Charter principles.' },
  { title: 'Why "Start Free Trial" Converts 31% Better Than "Sign Up"', cat: 'Research', date: 'Mar 5, 2026', read: '5 min', excerpt: 'Commitment bias makes users hesitate at high-commitment CTAs. We tested 14 variations across 80 SaaS sites.' },
  { title: 'Judge LLM: How We Evaluate Experiments on Psychological Effectiveness', cat: 'Product', date: 'Feb 18, 2026', read: '8 min', excerpt: 'Most platforms measure statistical significance. Our Judge LLM evaluates each variant on psychological alignment.' },
]
const cc: Record<string,string> = { Research:'bg-purple-50 text-purple-700', 'Case Study':'bg-green-50 text-green-700', Industry:'bg-blue-50 text-blue-700', Guide:'bg-amber-50 text-amber-700', Technical:'bg-gray-100 text-gray-700', Ethics:'bg-pink-50 text-pink-700', Product:'bg-cyan-50 text-cyan-700' }

export default function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col"><Nav />
      <div className="pt-24 pb-6 px-6 bg-surface text-center">
        <div className="text-[11px] font-mono tracking-widest text-green mb-3 uppercase">Blog</div>
        <h1 className="font-serif text-4xl md:text-5xl font-normal tracking-tight text-ink mb-4">Insights on psychology,<br/><em className="italic text-green">conversion, and AI.</em></h1>
        <p className="text-[16px] text-ink-2 max-w-md mx-auto font-light">Research, case studies, and practical guides from the VeroBehavior team.</p>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-12 flex-1">
        <div className="grid gap-6">
          {posts.map((p,i) => (
            <div key={i} className={`bg-white border border-surface-3 rounded-xl overflow-hidden hover:-translate-y-0.5 transition-transform cursor-pointer ${i===0?'md:grid md:grid-cols-[1.2fr_1fr]':''}`}>
              {i===0 && <div className="bg-gradient-to-br from-green to-green-mid p-8 flex items-center justify-center"><span className="text-6xl">🧠</span></div>}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${cc[p.cat]||'bg-gray-100 text-gray-700'}`}>{p.cat}</span>
                  <span className="text-[11px] text-ink-3">{p.date}</span>
                  <span className="text-[11px] text-ink-3">{p.read} read</span>
                </div>
                <h2 className={`font-serif font-normal text-ink mb-2 leading-snug ${i===0?'text-2xl':'text-lg'}`}>{p.title}</h2>
                <p className="text-[13px] text-ink-2 leading-relaxed font-light">{p.excerpt}</p>
                <div className="mt-3 text-[12px] text-green font-medium">Read article →</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 bg-green rounded-2xl p-8 text-center text-white">
          <div className="font-serif text-2xl font-normal mb-3">Get behavioral insights delivered weekly.</div>
          <p className="text-white/60 text-[14px] mb-6 font-light">Join 4,200+ CRO practitioners. No spam.</p>
          <div className="flex gap-2 max-w-md mx-auto flex-wrap justify-center">
            <input type="email" placeholder="your@email.com" className="flex-1 min-w-[200px] bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white text-[14px] outline-none placeholder:text-white/30" />
            <button className="bg-gold text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold hover:opacity-90 whitespace-nowrap">Subscribe</button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
