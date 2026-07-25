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
    // TODO: Wire up to Resend or API route for emails
    setTimeout(() => {
      setStatus('success')
    }, 1000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setFormData(prev => ({ ...prev, [name]: val }))
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Request a Custom Build</h1>
      <p className="text-lg text-gray-600 mb-8">
        Looking for a specific size, a unique state plaque, or a custom engraving? Fill out the form below with your ideas and I'll get back to you with a quote.
      </p>

      {status === 'success' ? (
        <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-sm">
          <h2 className="text-2xl font-semibold mb-2">Request Received!</h2>
          <p>Thanks for reaching out. I'll review your custom request and get back to you soon.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-sm border border-gray-100 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-slate-400 focus:border-slate-400 p-3 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-slate-400 focus:border-slate-400 p-3 border" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Dimensions (e.g. 10" x 14")</label>
              <input type="text" name="dimensions" value={formData.dimensions} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-slate-400 focus:border-slate-400 p-3 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Wood Species</label>
              <select name="woodType" value={formData.woodType} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-slate-400 focus:border-slate-400 p-3 border">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Custom Engraving Text (Optional)</label>
            <input type="text" name="engravingText" value={formData.engravingText} onChange={handleChange} placeholder="e.g. 'The Smith Family' or leave blank" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-slate-400 focus:border-slate-400 p-3 border" />
          </div>

          <div className="flex items-center">
            <input type="checkbox" name="juiceGroove" id="juiceGroove" checked={formData.juiceGroove} onChange={handleChange} className="h-5 w-5 text-slate-500 focus:ring-slate-400 border-gray-300 rounded" />
            <label htmlFor="juiceGroove" className="ml-2 block text-sm text-gray-900">Include a juice groove</label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Budget</label>
            <input type="text" name="budget" value={formData.budget} onChange={handleChange} placeholder="$" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-slate-400 focus:border-slate-400 p-3 border" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Details</label>
            <textarea required name="details" rows={4} value={formData.details} onChange={handleChange} placeholder="Tell me more about what you're looking for..." className="w-full border-gray-300 rounded-md shadow-sm focus:ring-slate-400 focus:border-slate-400 p-3 border" />
          </div>

          <button type="submit" disabled={status === 'submitting'} className="w-full bg-slate-700 text-white font-bold py-4 px-8 rounded-sm hover:bg-slate-800 transition-colors disabled:opacity-50">
            {status === 'submitting' ? 'Sending Request...' : 'Submit Custom Request'}
          </button>
        </form>
      )}
    </div>
  )
}
