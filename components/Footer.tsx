import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#0E0E14] text-white/40 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="font-serif text-[18px] text-white/90 mb-2">
              Vero<em className="italic text-[#7F77DD]">Behavior</em>
            </div>
            <p className="text-[12px] leading-relaxed mb-4">
              The operating system for psychologically-intelligent growth.
            </p>
            <div className="inline-flex items-center gap-2 bg-[#1D9E75]/15 border border-[#1D9E75]/30 rounded-md px-3 py-1.5 text-[10px] text-[#5DCAA5] font-mono">
              ✓ Ethical AI Certified 2026
            </div>
          </div>
          {[
            { title: 'Product', links: ['Live Demo', 'Psychology Engine', 'Decision Engine', 'GEO Monitor', 'Pricing'] },
            { title: 'Solutions', links: ['E-commerce', 'SaaS', 'Lead Generation', 'Agencies', 'Enterprise'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Privacy Policy', 'Ethical AI Charter'] },
          ].map(col => (
            <div key={col.title}>
              <div className="text-[10px] font-mono letter-spacing tracking-widest text-white/60 mb-3 uppercase">{col.title}</div>
              <div className="flex flex-col gap-2">
                {col.links.map(l => (
                  <a key={l} href="#" className="text-[12px] text-white/35 hover:text-white/70 transition-colors">{l}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="text-[11px]">© 2026 VeroBehavior. All rights reserved.</div>
          <div className="flex gap-5">
            {['Privacy', 'Terms', 'Ethics', 'Status'].map(l => (
              <a key={l} href="#" className="text-[11px] hover:text-white/60 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
