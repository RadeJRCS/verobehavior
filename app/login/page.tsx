'use client'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/dashboard')
      } else {
        setChecking(false)
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || status === 'sending') return
    setStatus('sending')
    setErrorMsg('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        // Invite-only: never auto-create an account for an unknown email.
        // Partners are created manually in the Supabase console.
        shouldCreateUser: false,
      },
    })
    if (error) {
      setStatus('error')
      setErrorMsg(
        error.message.toLowerCase().includes('signups not allowed')
          ? 'No account found for this email. Contact us if you believe this is a mistake.'
          : error.message
      )
    } else {
      setStatus('sent')
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex flex-col">
        <Nav />
        <div className="pt-24 flex-1 flex items-center justify-center">
          <div className="text-[13px] text-ink-3 font-mono">Checking session...</div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <div className="pt-24 flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-[11px] font-mono tracking-widest text-green mb-4 uppercase">Partner login</div>
            <h1 className="font-serif text-4xl font-normal tracking-tight text-ink mb-3">
              Log in to your <em className="italic text-green">dashboard.</em>
            </h1>
            <p className="text-[14px] text-ink-2 font-light leading-relaxed">
              Enter your email and we&apos;ll send you a login link. No password needed.
            </p>
          </div>

          <div className="bg-white border border-surface-3 rounded-xl p-6">
            {status === 'sent' ? (
              <div className="text-center py-4">
                <span className="text-3xl block mb-3">✓</span>
                <div className="font-serif text-lg text-ink mb-2">Check your email for your login link.</div>
                <p className="text-[13px] text-ink-2 font-light">Sent to {email}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-medium text-ink-2 mb-1">Work email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@company.com"
                    className="w-full bg-surface border border-surface-3 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-green/40 transition-colors"
                  />
                </div>
                {status === 'error' && (
                  <p className="text-[12px] text-red-600">{errorMsg || 'Something went wrong. Please try again.'}</p>
                )}
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full bg-green text-white py-3 rounded-lg text-[14px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {status === 'sending' ? 'Sending...' : 'Send me a login link'}
                </button>
              </form>
            )}
          </div>

          <div className="text-center mt-6">
            <p className="text-[13px] text-ink-3">
              Not a partner yet? <Link href="/contact" className="text-green underline">Apply for early access</Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
