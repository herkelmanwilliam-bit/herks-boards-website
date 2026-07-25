import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-[#0f172a] mb-8">Privacy Policy</h1>
        <div className="bg-white rounded-sm p-8 shadow-sm space-y-6 text-gray-600 leading-relaxed">
          <p><strong className="text-[#0f172a]">Last updated:</strong> May 2026</p>
          <p>GG Farms, LLC ("GG Farms," "we," "us") operates ggfarmsmn.com. This page explains how we handle your information.</p>
          <h2 className="text-xl font-bold text-[#0f172a]">Information We Collect</h2>
          <p>When you place an order, we collect your name, email address, phone number, and delivery address. Payment information is processed securely by Stripe and is never stored on our servers.</p>
          <h2 className="text-xl font-bold text-[#0f172a]">How We Use It</h2>
          <p>We use your information only to fulfill your order and communicate with you about it. We do not sell your information to third parties.</p>
          <h2 className="text-xl font-bold text-[#0f172a]">Contact</h2>
          <p>Questions? Email us at <a href="mailto:ggfarmsmn@gmail.com" className="text-[#94a3b8] hover:underline">ggfarmsmn@gmail.com</a> or visit our <Link href="/contact" className="text-[#94a3b8] hover:underline">contact page</Link>.</p>
        </div>
      </div>
    </div>
  )
}
