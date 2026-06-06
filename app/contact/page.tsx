'use client'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { useState } from 'react'

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <div className="pt-24 flex-1">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="text-[11px] font-mono tracking-widest text-green mb-4 uppercase">Contact</div>
              <h1 className="font-serif text-4xl font-normal tracking-tight text-ink mb-4">Let's talk about <em className="italic text-green">your growth.</em></h1>
              <p className="text-[15px] text-ink-2 leading-relaxed font-light mb-8">Whether you want a demo, have a technical question, or are ready to start: we respond within 24 hours.</p>
              <div className="space-y-4">
                {[
                  { icon: '✉', label: 'Email', value: 'hello@verobehavior.com' },
                  { icon: '💬', label: 'Sales', value: 'sales@verobehavior.com' },
                  { icon: '🛡', label: 'Privacy inquiries', value: 'privacy@verobehavior.com' },
                  { icon: '📍', label: 'Office', value: 'Remote-first · EU / US / APAC' },
                ].map(c => (
                  <div key={c.label} className="flex items-center gap-3 py-3 border-b border-surface-3">
                    <span className="text-lg">{c.icon}</span>
                    <div>
                      <div className="text-[12px] text-ink-3">{c.label}</div>
                      <div className="text-[14px] text-ink">{c.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 bg-surface rounded-xl p-5 border border-surface-3">
                <div className="font-serif text-lg text-ink mb-2">Enterprise inquiries</div>
                <p className="text-[13px] text-ink-2 font-light leading-relaxed">Need custom SLA, on-prem deployment, or a dedicated implementation team? Our enterprise team will prepare a tailored proposal within 48 hours.</p>
              </div>
            </div>
            <div>
              {sent ? (
                <div className="bg-green-light border border-green/20 rounded-xl p-8 text-center mt-8">
                  <span className="text-4xl block mb-4">✓</span>
                  <div className="font-serif text-2xl text-green mb-2">Message sent!</div>
                  <p className="text-[14px] text-ink-2">We will get back to you within 24 hours.</p>
                </div>
              ) : (
                <div className="bg-white border border-surface-3 rounded-xl p-6 mt-8">
                  <div className="font-serif text-xl text-ink mb-5">Send us a message</div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[12px] font-medium text-ink-2 mb-1">Full name</label>
                      <input type="text" placeholder="Jane Smith" className="w-full bg-surface border border-surface-3 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-green/40 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-ink-2 mb-1">Work email</label>
                      <input type="email" placeholder="jane@company.com" className="w-full bg-surface border border-surface-3 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-green/40 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-ink-2 mb-1">Company website</label>
                      <input type="url" placeholder="https://company.com" className="w-full bg-surface border border-surface-3 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-green/40 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-ink-2 mb-1">I am interested in</label>
                      <select className="w-full bg-surface border border-surface-3 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-green/40 text-ink-2">
                        <option>Product demo</option>
                        <option>Free trial setup</option>
                        <option>Enterprise plan</option>
                        <option>Agency partnership</option>
                        <option>Technical integration</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-ink-2 mb-1">Message</label>
                      <textarea rows={4} placeholder="Tell us about your CRO goals..." className="w-full bg-surface border border-surface-3 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-green/40 transition-colors resize-none" />
                    </div>
                    <button onClick={() => setSent(true)} className="w-full bg-green text-white py-3 rounded-lg text-[14px] font-semibold hover:opacity-90 transition-opacity">
                      Send message
                    </button>
                    <p className="text-[11px] text-ink-3 text-center">We respond within 24 hours. No spam. Read our <a href="/privacy" className="text-green underline">privacy policy</a>.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
