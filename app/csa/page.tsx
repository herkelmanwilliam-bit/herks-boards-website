import Link from 'next/link'

export default function CSAPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white rounded-sm shadow-sm p-10">
          <span className="text-5xl mb-6 block">📦</span>
          <h1 className="text-3xl font-bold text-[#0f172a] mb-3">GG Farms CSA Boxes</h1>
          <p className="text-gray-500 text-lg mb-8 leading-relaxed">
            Fresh greenhouse produce and farm eggs every week — curated by us, picked up or delivered to you. Choose the size that fits your household.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <Link
              href="/shop/csa-small"
              className="block bg-[#f8fafc] rounded-sm p-6 hover:bg-[#94a3b8]/10 transition-colors border border-transparent hover:border-[#94a3b8]/30"
            >
              <p className="text-2xl mb-2">🥬</p>
              <h2 className="font-bold text-[#0f172a] text-lg mb-1">Small Box</h2>
              <p className="text-gray-500 text-sm mb-3">Perfect for 1–2 people. 6–8 items + 1 dozen eggs.</p>
              <span className="text-[#94a3b8] font-bold text-xl">$35 / week</span>
            </Link>
            <Link
              href="/shop/csa-large"
              className="block bg-[#f8fafc] rounded-sm p-6 hover:bg-[#94a3b8]/10 transition-colors border border-transparent hover:border-[#94a3b8]/30"
            >
              <p className="text-2xl mb-2">🧺</p>
              <h2 className="font-bold text-[#0f172a] text-lg mb-1">Large Box</h2>
              <p className="text-gray-500 text-sm mb-3">Feeds a family of 4. 12–15 items + 2 dozen eggs.</p>
              <span className="text-[#94a3b8] font-bold text-xl">$65 / week</span>
            </Link>
          </div>
          <Link
            href="/shop"
            className="text-gray-400 text-sm hover:text-[#94a3b8] transition-colors"
          >
            ← Back to all products
          </Link>
        </div>
      </div>
    </div>
  )
}
