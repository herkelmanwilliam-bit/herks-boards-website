import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E1]">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-[#1C1C1C] mb-8">Privacy Policy</h1>
        <div className="bg-white rounded-2xl p-8 shadow-sm space-y-6 text-gray-600 leading-relaxed">
          <p><strong className="text-[#1C1C1C]">Last updated:</strong> May 2026</p>
          <p>GG Farms, LLC ("GG Farms," "we," "us") operates ggfarmsmn.com. This page explains how we handle your information.</p>
          <h2 className="text-xl font-bold text-[#1C1C1C]">Information We Collect</h2>
          <p>When you place an order, we collect your name, email address, phone number, and delivery address. Payment information is processed securely by Stripe and is never stored on our servers.</p>
          <h2 className="text-xl font-bold text-[#1C1C1C]">How We Use It</h2>
          <p>We use your information only to fulfill your order and communicate with you about it. We do not sell your information to third parties.</p>
          <h2 className="text-xl font-bold text-[#1C1C1C]">Contact</h2>
          <p>Questions? Email us at <a href="mailto:ggfarmsmn@gmail.com" className="text-[#C9A84C] hover:underline">ggfarmsmn@gmail.com</a> or visit our <Link href="/contact" className="text-[#C9A84C] hover:underline">contact page</Link>.</p>
        </div>
      </div>
    </div>
  )
}
