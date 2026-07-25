import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-[#0f172a] mb-8">Terms of Service</h1>
        <div className="bg-white rounded-sm p-8 shadow-sm space-y-6 text-gray-600 leading-relaxed">
          <p><strong className="text-[#0f172a]">Last updated:</strong> May 2026</p>
          <p>By placing an order with GG Farms, LLC you agree to the following terms.</p>
          <h2 className="text-xl font-bold text-[#0f172a]">Orders & Payment</h2>
          <p>All orders are subject to availability. Payment is processed at checkout via Stripe. We reserve the right to cancel any order and issue a full refund if a product becomes unavailable.</p>
          <h2 className="text-xl font-bold text-[#0f172a]">Pickup & Delivery</h2>
          <p>Farm pickup is free at 700 County Road 92, Minnetrista, MN 55359. Local delivery is available for orders of $20 or more, with no delivery fee. We will contact you to coordinate timing.</p>
          <h2 className="text-xl font-bold text-[#0f172a]">Freshness & Returns</h2>
          <p>All produce is harvested fresh. If you are unsatisfied with your order for any reason, contact us within 24 hours and we will make it right.</p>
          <h2 className="text-xl font-bold text-[#0f172a]">Contact</h2>
          <p>Questions? Email us at <a href="mailto:ggfarmsmn@gmail.com" className="text-[#94a3b8] hover:underline">ggfarmsmn@gmail.com</a> or visit our <Link href="/contact" className="text-[#94a3b8] hover:underline">contact page</Link>.</p>
        </div>
      </div>
    </div>
  )
}
