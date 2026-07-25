'use client'

import { useState } from 'react'

export default function CustomOrderPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    details: '',
    dimensions: '',
    woodType: 'Walnut',
    juiceGroove: false,
    engravingText: '',
    budget: ''
  })

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    try {
      const res = await fetch('/api/custom-order', {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setFormData(prev => ({ ...prev, [name]: val }))
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen py-24">
      <div className="max-w-4xl mx-auto px-4">
        
        <div className="text-center mb-16">
          <h2 className="text-xs tracking-[0.3em] text-slate-400 font-bold mb-4">COMMISSION A PIECE</h2>
          <h1 className="text-4xl sm:text-5xl font-serif text-[#0f172a] mb-6">Bespoke Builds</h1>
          <div className="h-px w-16 bg-slate-300 mx-auto mb-8"></div>
          <p className="text-lg text-slate-500 font-light max-w-2xl mx-auto leading-relaxed">
            Looking for a specific dimension, a unique state plaque, or custom engraving? Detail your vision below and we'll reply with a quote and timeline.
          </p>
        </div>

        {status === 'success' ? (
          <div className="bg-white border border-slate-200 text-[#0f172a] p-10 rounded-sm shadow-sm text-center">
            <h2 className="text-3xl font-serif mb-4">Request Received</h2>
            <p className="text-slate-500 font-light">Thank you for your interest. We will review your specifications and be in touch shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 sm:p-12 rounded-sm border border-slate-200 shadow-sm">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-bold tracking-widest text-slate-400 mb-3">NAME</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-[#f8fafc] border border-slate-200 rounded-sm focus:outline-none focus:border-[#0f172a] p-4 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest text-slate-400 mb-3">EMAIL</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#f8fafc] border border-slate-200 rounded-sm focus:outline-none focus:border-[#0f172a] p-4 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-bold tracking-widest text-slate-400 mb-3">DIMENSIONS (E.G. 10" x 14")</label>
                <input type="text" name="dimensions" value={formData.dimensions} onChange={handleChange} className="w-full bg-[#f8fafc] border border-slate-200 rounded-sm focus:outline-none focus:border-[#0f172a] p-4 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest text-slate-400 mb-3">PRIMARY WOOD</label>
                <select name="woodType" value={formData.woodType} onChange={handleChange} className="w-full bg-[#f8fafc] border border-slate-200 rounded-sm focus:outline-none focus:border-[#0f172a] p-4 text-sm appearance-none cursor-pointer">
                  <option value="Walnut">Walnut</option>
                  <option value="Oak">Oak</option>
                  <option value="Maple">Maple</option>
                  <option value="Padauk">Padauk</option>
                  <option value="Purple Heart">Purple Heart</option>
                  <option value="Zebra Wood">Zebra Wood</option>
                  <option value="Mixed / Unsure">Mixed / Unsure</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-bold tracking-widest text-slate-400 mb-3">ENGRAVING TEXT (OPTIONAL)</label>
                <input type="text" name="engravingText" value={formData.engravingText} onChange={handleChange} placeholder="e.g. 'The Smith Family'" className="w-full bg-[#f8fafc] border border-slate-200 rounded-sm focus:outline-none focus:border-[#0f172a] p-4 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest text-slate-400 mb-3">TARGET BUDGET</label>
                <input type="text" name="budget" value={formData.budget} onChange={handleChange} placeholder="$" className="w-full bg-[#f8fafc] border border-slate-200 rounded-sm focus:outline-none focus:border-[#0f172a] p-4 text-sm" />
              </div>
            </div>

            <div className="flex items-center bg-[#f8fafc] border border-slate-200 p-4 rounded-sm">
              <input type="checkbox" name="juiceGroove" id="juiceGroove" checked={formData.juiceGroove} onChange={handleChange} className="h-5 w-5 text-[#0f172a] focus:ring-[#0f172a] border-slate-300 rounded-sm cursor-pointer" />
              <label htmlFor="juiceGroove" className="ml-3 block text-sm font-medium text-[#0f172a] cursor-pointer">Include a routed juice groove</label>
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest text-slate-400 mb-3">PROJECT DETAILS</label>
              <textarea required name="details" rows={5} value={formData.details} onChange={handleChange} placeholder="Describe your vision..." className="w-full bg-[#f8fafc] border border-slate-200 rounded-sm focus:outline-none focus:border-[#0f172a] p-4 text-sm resize-none" />
            </div>

            <button type="submit" disabled={status === 'submitting'} className="w-full bg-[#0f172a] text-white tracking-[0.2em] text-xs font-bold py-5 px-8 rounded-sm hover:bg-slate-800 transition-colors disabled:opacity-50 mt-4">
              {status === 'submitting' ? 'SENDING REQUEST...' : 'SUBMIT COMMISSION'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
