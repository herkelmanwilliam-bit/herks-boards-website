'use client'

import { MapPin, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { useState } from 'react'

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!res.ok) throw new Error('Failed to send')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-sm flex items-center justify-center flex-shrink-0 border border-slate-200 shadow-sm">
                  <MapPin className="w-5 h-5 text-[#0f172a]" />
                </div>
                <div>
                  <div className="font-serif text-xl text-[#0f172a] mb-1">Workshop Location</div>
                  <div className="text-slate-500 font-light tracking-wider text-sm">IOWA, USA</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-sm flex items-center justify-center flex-shrink-0 border border-slate-200 shadow-sm">
                  <Mail className="w-5 h-5 text-[#0f172a]" />
                </div>
                <div>
                  <div className="font-serif text-xl text-[#0f172a] mb-1">Email</div>
                  <a href="mailto:Herkelmanwilliam@gmail.com" className="text-slate-500 font-light tracking-wider hover:text-[#0f172a] text-sm transition-colors">
                    HERKELMANWILLIAM@GMAIL.COM
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="mt-16 bg-white rounded-sm p-8 border border-slate-200 shadow-sm">
              <h3 className="text-[#0f172a] font-serif text-3xl mb-3">Get in Touch</h3>
              <p className="text-slate-500 font-light mb-8 text-sm">Have a question about a board or a custom build? Send a message.</p>

              {status === 'success' ? (
                <div className="flex items-center gap-3 text-[#0f172a] bg-slate-100 border border-slate-300 rounded-sm px-6 py-6">
                  <CheckCircle className="w-6 h-6 flex-shrink-0" />
                  <p className="text-sm font-medium tracking-wide">Message sent! We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      required
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded-sm px-4 py-4 text-[#0f172a] placeholder-slate-400 focus:outline-none focus:border-[#0f172a] text-sm"
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email address"
                      required
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded-sm px-4 py-4 text-[#0f172a] placeholder-slate-400 focus:outline-none focus:border-[#0f172a] text-sm"
                    />
                  </div>

                  <div>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Your message..."
                      required
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded-sm px-4 py-4 text-[#0f172a] placeholder-slate-400 focus:outline-none focus:border-[#0f172a] resize-none text-sm"
                    />
                  </div>

                  {status === 'error' && (
                    <div className="flex items-center gap-3 text-red-600 bg-red-50 rounded-sm px-4 py-3 border border-red-100">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm">Something went wrong. Please try again later.</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full bg-[#0f172a] text-white py-4 rounded-sm font-bold tracking-[0.2em] text-xs hover:bg-slate-800 transition-colors disabled:opacity-50 mt-4"
                  >
                    {status === 'submitting' ? 'SENDING...' : 'SEND MESSAGE'}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="bg-slate-200 rounded-sm border border-slate-300 flex items-center justify-center h-[400px] lg:h-auto overflow-hidden relative grayscale opacity-80 mix-blend-multiply">
            {/* Minimalist Iowa Map Placeholder */}
            <div className="absolute inset-0 bg-[#0f172a]/5 flex items-center justify-center font-serif text-4xl text-slate-400 tracking-widest">IOWA</div>
          </div>
        </div>
      </div>
    </div>
  )
}
