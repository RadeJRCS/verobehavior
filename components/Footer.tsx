import Link from 'next/link'
export default function Footer() {
  return (
    <footer className="bg-[#0E0E14] text-white/40 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-serif text-[18px] text-white/90 block mb-2">Vero<em className="italic text-[#7F77DD]">Behavior</em></Link>
            <p className="text-[12px] leading-relaxed mb-4">AI-powered CRO platform that explains the psychology behind every user session.</p>
            <div className="inline-flex items-center gap-2 bg-[#1D9E75]/15 border border-[#1D9E75]/30 rounded-md px-3 py-1.5 text-[10px] text-[#5DCAA5] font-mono">✓ Ethical AI by design</div>
          </div>
          {[{title:'Product',links:[{href:'/demo',l:'Live Demo'},{href:'/dashboard',l:'Dashboard'},{href:'/pricing',l:'Pricing'},{href:'/docs',l:'Documentation'},{href:'/docs',l:'API Reference'}]},{title:'Solutions',links:[{href:'/demo',l:'E-commerce'},{href:'/demo',l:'SaaS'},{href:'/demo',l:'Lead Generation'},{href:'/demo',l:'Agencies'},{href:'/contact',l:'Enterprise'}]},{title:'Resources',links:[{href:'/blog',l:'Blog'},{href:'/docs',l:'Help Center'},{href:'/blog',l:'Research'},{href:'/docs',l:'Changelog'},{href:'/contact',l:'Support'}]},{title:'Company',links:[{href:'/about',l:'About'},{href:'/contact',l:'Contact'},{href:'/privacy',l:'Privacy Policy'},{href:'/terms',l:'Terms of Service'},{href:'/about',l:'Ethical AI Charter'}]}].map(col => (
            <div key={col.title}><div className="text-[10px] font-mono tracking-widest text-white/60 mb-3 uppercase">{col.title}</div><div className="flex flex-col gap-2">{col.links.map((lnk,i) => <Link key={`${lnk.l}-${i}`} href={lnk.href} className="text-[12px] text-white/35 hover:text-white/70 transition-colors">{lnk.l}</Link>)}</div></div>
          ))}
        </div>
        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="text-[11px]">© 2026 VeroBehavior. All rights reserved.</div>
          <div className="flex gap-5">{[{href:'/privacy',l:'Privacy'},{href:'/terms',l:'Terms'},{href:'/about',l:'Ethics'},{href:'/contact',l:'Contact'}].map(x => <Link key={x.l} href={x.href} className="text-[11px] hover:text-white/60 transition-colors">{x.l}</Link>)}</div>
        </div>
      </div>
    </footer>
  )
}
