'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type NavUser = { email: string } | null

export default function NavClient({ user }: { user: NavUser }) {
  const path = usePathname()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [dd, setDd] = useState<string | null>(null)
  const ddRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) {
        setDd(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/')
    router.refresh()
  }

  const productLinks = [
    { href: '/demo', label: 'Live Demo', desc: 'See VeroBehavior analyze behavior in real time' },
    { href: '/docs', label: 'Documentation', desc: 'Integration guides, API reference, tutorials' },
  ]

  const solutionLinks = [
    { href: '/demo', label: 'Cart abandonment', desc: 'Recover abandoned carts with behavioral psychology' },
    { href: '/demo', label: 'Checkout drop-off', desc: 'Reduce friction and hesitation at the payment step' },
    { href: '/demo', label: 'Product page bounce', desc: 'Turn browsers into buyers with sharper product pages' },
  ]

  const simpleLinks = [
    { href: '/', label: 'Home' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/blog', label: 'Blog' },
    { href: '/about', label: 'About' },
  ]

  const renderDropdown = (label: string, links: typeof productLinks) => (
    <div className="relative" ref={dd === label ? ddRef : undefined}>
      <button
        onClick={() => setDd(dd === label ? null : label)}
        className={`px-3 py-1.5 rounded-md text-[13px] transition-all flex items-center gap-1 ${
          dd === label
            ? 'bg-white/15 text-white'
            : 'text-white/60 hover:text-white hover:bg-white/10'
        }`}
      >
        {label}
        <span className={`text-[10px] transition-transform duration-200 ${dd === label ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>
      {dd === label && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 w-[280px] z-[9999]">
          {links.map(child => (
            <Link
              key={child.label}
              href={child.href}
              onClick={() => setDd(null)}
              className="block px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="text-[13px] font-medium text-gray-900">{child.label}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{child.desc}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[9998] transition-all duration-300 ${
      scrolled ? 'bg-[#1A3A2A]/95 backdrop-blur-md shadow-lg' : 'bg-[#1A3A2A]'
    }`}>
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-serif text-[19px] text-white tracking-tight">
          Vero<em className="text-[#A8D4B8] not-italic italic">Behavior</em>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {simpleLinks.slice(0, 1).map(l => (
            <Link key={l.label} href={l.href}
              className={`px-3 py-1.5 rounded-md text-[13px] transition-all ${
                path === l.href ? 'bg-white/15 text-white font-medium' : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}>
              {l.label}
            </Link>
          ))}

          {renderDropdown('Product', productLinks)}
          {renderDropdown('Solutions', solutionLinks)}

          {simpleLinks.slice(1).map(l => (
            <Link key={l.label} href={l.href}
              className={`px-3 py-1.5 rounded-md text-[13px] transition-all ${
                path === l.href ? 'bg-white/15 text-white font-medium' : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {path !== '/dashboard' && (
                <Link href="/dashboard" className="text-[12px] text-white/50 hover:text-white/80 transition-colors">
                  Dashboard
                </Link>
              )}
              <span className="text-[12px] text-white/40 max-w-[160px] truncate">{user.email}</span>
              <button onClick={handleLogout} className="text-[12px] text-white/50 hover:text-white/80 transition-colors">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-[12px] text-white/50 hover:text-white/80 transition-colors">
                Log in
              </Link>
              <Link href="/contact" className="bg-[#C8963C] text-white px-4 py-1.5 rounded-md text-[13px] font-semibold hover:opacity-90 transition-opacity">
                Apply as design partner
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-white p-1" onClick={() => setOpen(!open)}>
          <div className="w-5 h-0.5 bg-white mb-1" />
          <div className="w-5 h-0.5 bg-white mb-1" />
          <div className="w-5 h-0.5 bg-white" />
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[#1A3A2A] border-t border-white/10 px-6 py-4">
          {[
            { href: '/', label: 'Home' },
            { href: '/demo', label: 'Live Demo' },
            { href: '/pricing', label: 'Pricing' },
            { href: '/blog', label: 'Blog' },
            { href: '/docs', label: 'Docs' },
            { href: '/about', label: 'About' },
            { href: '/contact', label: 'Contact' },
            ...(user ? [] : [{ href: '/login', label: 'Log in' }]),
          ].map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block py-2.5 text-[14px] text-white/70 hover:text-white border-b border-white/5">
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              {path !== '/dashboard' && (
                <Link href="/dashboard" onClick={() => setOpen(false)}
                  className="block py-2.5 text-[14px] text-white/70 hover:text-white border-b border-white/5">
                  Dashboard
                </Link>
              )}
              <div className="mt-4 text-center text-[12px] text-white/40">{user.email}</div>
              <button onClick={() => { setOpen(false); handleLogout() }}
                className="mt-2 block w-full text-center bg-white/10 border border-white/20 text-white px-4 py-2.5 rounded-md text-[13px] font-semibold">
                Log out
              </button>
            </>
          ) : (
            <Link href="/contact" onClick={() => setOpen(false)}
              className="mt-4 block text-center bg-[#C8963C] text-white px-4 py-2.5 rounded-md text-[13px] font-semibold">
              Apply as design partner
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
