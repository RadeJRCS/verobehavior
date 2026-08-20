'use client'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupClient({ nav }: { nav: React.ReactNode }) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
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

    if (password.length < 6) {
      setStatus('error')
      setErrorMsg('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setStatus('error')
      setErrorMsg('Passwords do not match.')
      return
    }

    setStatus('sending')
    setErrorMsg('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
    } else {
      setStatus('sent')
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex flex-col">
        {nav}
        <div className="pt-24 flex-1 flex items-center justify-center">
          <div className="text-[13px] text-ink-3 font-mono">Checking session...</div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {nav}
      <div className="pt-24 flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-[11px] font-mono tracking-widest text-green mb-4 uppercase">Create account</div>
            <h1 className="font-serif text-4xl font-normal tracking-tight text-ink mb-3">
              Start your <em className="italic text-green">free trial.</em>
            </h1>
            <p className="text-[14px] text-ink-2 font-light leading-relaxed">
              Free tier included. No credit card required.
            </p>
          </div>

          <div className="bg-white border border-surface-3 rounded-xl p-6">
            {status === 'sent' ? (
              <div className="text-center py-4">
                <span className="text-3xl block mb-3">✓</span>
                <div className="font-serif text-lg text-ink mb-2">Check your email to verify your account.</div>
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
                <div>
                  <label className="block text-[12px] font-medium text-ink-2 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-surface border border-surface-3 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-green/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-ink-2 mb-1">Confirm password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
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
                  {status === 'sending' ? 'Creating account...' : 'Create account'}
                </button>
              </form>
            )}
          </div>

          <div className="text-center mt-6">
            <p className="text-[13px] text-ink-3">
              Already have an account? <Link href="/login" className="text-green underline">Log in</Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
