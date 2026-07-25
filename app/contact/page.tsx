'use client'

import { MapPin, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { useState } from 'react'

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    // Simulation for now, will connect to Resend
    setTimeout(() => {
      setStatus('success')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#0f172a] rounded-sm flex items-center justify-center flex-shrink-0 border border-gray-800">
                  <MapPin className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <div className="font-semibold text-[#0f172a] mb-1">Workshop Location</div>
                  <div className="text-[#0f172a]/70">Iowa, USA</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#0f172a] rounded-sm flex items-center justify-center flex-shrink-0 border border-gray-800">
                  <Mail className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <div className="font-semibold text-[#0f172a] mb-1">Email</div>
                  <a href="mailto:info@herksboards.com" className="text-slate-600 hover:text-slate-700 font-medium">
                    info@herksboards.com
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="mt-10 bg-[#0f172a] rounded-sm p-8 border border-gray-800 shadow-xl">
              <h3 className="text-white font-bold text-2xl mb-2">Get in Touch</h3>
              <p className="text-gray-400 mb-6">Have a question about a board or a custom build? Send a message.</p>

              {status === 'success' ? (
                <div className="flex items-center gap-3 text-green-400 bg-green-400/10 border border-green-400/20 rounded-sm px-4 py-4">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">Message sent! I'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      name="name"
                      placeholder="Your name"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-slate-400"
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email address"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-slate-400"
                    />
                  </div>

                  <div>
                    <textarea
                      name="message"
                      rows={4}
                      placeholder="Your message..."
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-slate-400 resize-none"
                    />
                  </div>

                  {status === 'error' && (
                    <div className="flex items-center gap-3 text-red-400 bg-red-400/10 rounded-sm px-4 py-3">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm">Something went wrong. Please try again later.</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full bg-slate-600 text-white py-4 rounded-sm font-bold hover:bg-slate-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                  >
                    {status === 'submitting' ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Map (Generic Iowa for now) */}
          <div className="rounded-sm overflow-hidden shadow-lg h-[400px] lg:h-auto border border-gray-200">
            <iframe
              title="Iowa Location"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '400px' }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3012876.5414845524!2d-96.1130635443306!3d42.06240212781446!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x87ee5e6f51952f41%3A0xc6fb04cbe39049a4!2sIowa!5e0!3m2!1sen!2sus!4v1"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
