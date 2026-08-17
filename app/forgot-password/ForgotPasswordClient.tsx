'use client'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordClient({ nav }: { nav: React.ReactNode }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || status === 'sending') return
    setStatus('sending')
    setErrorMsg('')
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })
    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
    } else {
      setStatus('sent')
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {nav}
      <div className="pt-24 flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-[11px] font-mono tracking-widest text-green mb-4 uppercase">Reset password</div>
            <h1 className="font-serif text-4xl font-normal tracking-tight text-ink mb-3">
              Forgot your <em className="italic text-green">password?</em>
            </h1>
            <p className="text-[14px] text-ink-2 font-light leading-relaxed">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          <div className="bg-white border border-surface-3 rounded-xl p-6">
            {status === 'sent' ? (
              <div className="text-center py-4">
                <span className="text-3xl block mb-3">✓</span>
                <div className="font-serif text-lg text-ink mb-2">Check your email for a reset link.</div>
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
                  {status === 'sending' ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
            )}
          </div>

          <div className="text-center mt-6">
            <p className="text-[13px] text-ink-3">
              Remembered it? <Link href="/login" className="text-green underline">Log in</Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
