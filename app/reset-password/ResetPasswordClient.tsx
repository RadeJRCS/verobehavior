'use client'
import Footer from '@/components/Footer'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordClient({ nav }: { nav: React.ReactNode }) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'sending') return

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
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setStatus('error')
      setErrorMsg(
        error.message.toLowerCase().includes('auth session missing')
          ? 'This reset link is invalid or has expired. Request a new one.'
          : error.message
      )
    } else {
      router.push('/dashboard')
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
              Set a new <em className="italic text-green">password.</em>
            </h1>
          </div>

          <div className="bg-white border border-surface-3 rounded-xl p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-ink-2 mb-1">New password</label>
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
                <label className="block text-[12px] font-medium text-ink-2 mb-1">Confirm new password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
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
                {status === 'sending' ? 'Updating...' : 'Update password'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
