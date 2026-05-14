'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Nav() {
  const path = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const links = [
    { href: '/', label: 'Home' },
    { href: '/demo', label: 'Live Demo' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#1A3A2A]/95 backdrop-blur-md shadow-lg' : 'bg-[#1A3A2A]'
    }`}>
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-serif text-[19px] text-white tracking-tight">
          Vero<em className="text-[#A8D4B8] not-italic italic">Behavior</em>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={`px-3 py-1.5 rounded-md text-[13px] transition-all ${
                path === l.href
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/dashboard"
            className="text-[13px] text-white/60 hover:text-white transition-colors px-3 py-1.5">
            Dashboard
          </Link>
          <Link href="/demo"
            className="bg-[#C8963C] text-white px-4 py-1.5 rounded-md text-[13px] font-semibold hover:opacity-90 transition-opacity">
            Start Free Trial
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-white p-1" onClick={() => setOpen(!open)}>
          <div className="w-5 h-0.5 bg-white mb-1" />
          <div className="w-5 h-0.5 bg-white mb-1" />
          <div className="w-5 h-0.5 bg-white" />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#1A3A2A] border-t border-white/10 px-6 py-4">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block py-2.5 text-[14px] text-white/70 hover:text-white border-b border-white/5">
              {l.label}
            </Link>
          ))}
          <Link href="/demo" onClick={() => setOpen(false)}
            className="mt-4 block text-center bg-[#C8963C] text-white px-4 py-2.5 rounded-md text-[13px] font-semibold">
            Start Free Trial
          </Link>
        </div>
      )}
    </nav>
  )
}
