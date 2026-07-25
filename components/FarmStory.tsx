import Link from 'next/link'

export default function FarmStory() {
  return (
    <section className="py-20 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="bg-[#0f172a] rounded-sm aspect-[4/3] flex items-center justify-center text-white text-center p-8">
            <div>
              <div className="text-7xl mb-4">🌱</div>
              <div className="text-2xl font-bold text-[#94a3b8] mb-2">GG Farms</div>
              <div className="text-[#f8fafc]/50">Minnetrista, Minnesota</div>
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div><div className="text-2xl font-bold text-[#94a3b8]">80</div><div className="text-[#f8fafc]/40 text-xs">Acres</div></div>
                <div><div className="text-2xl font-bold text-[#94a3b8]">60×96</div><div className="text-[#f8fafc]/40 text-xs">Greenhouse</div></div>
                <div><div className="text-2xl font-bold text-[#94a3b8]">365</div><div className="text-[#f8fafc]/40 text-xs">Days/Year</div></div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-[#94a3b8] font-bold text-sm uppercase tracking-wide mb-3">Our Story</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] mb-6">
              A Family Farm Built for the Future
            </h2>
            <div className="space-y-4 text-[#0f172a]/70 leading-relaxed">
              <p>
                GG Farms was founded by Scott and Gina Herkelman on 80 acres in Minnetrista, Minnesota. "GG" is Gina's family nickname — and a nod to Scott's decades in the gaming industry, where "GG" means <em>Good Game</em>.
              </p>
              <p>
                We built a state-of-the-art 60' × 96' climate-controlled greenhouse because we believed Minnesota deserved access to truly fresh, local produce year-round — not vegetables trucked in from thousands of miles away.
              </p>
              <p>
                Our sons Julian and Charles work alongside us every day. This is a family operation, and you can taste the care in every crop we grow.
              </p>
            </div>
            <Link href="/contact" className="inline-flex items-center gap-2 mt-8 text-[#94a3b8] font-semibold hover:text-[#b8942f]">
              Get in touch →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

