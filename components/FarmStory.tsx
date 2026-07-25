import Link from 'next/link'

export default function FarmStory() {
  return (
    <section className="py-20 bg-[#F5F0E1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="bg-[#1C1C1C] rounded-3xl aspect-[4/3] flex items-center justify-center text-white text-center p-8">
            <div>
              <div className="text-7xl mb-4">🌱</div>
              <div className="text-2xl font-bold text-[#C9A84C] mb-2">GG Farms</div>
              <div className="text-[#F5F0E1]/50">Minnetrista, Minnesota</div>
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div><div className="text-2xl font-bold text-[#C9A84C]">80</div><div className="text-[#F5F0E1]/40 text-xs">Acres</div></div>
                <div><div className="text-2xl font-bold text-[#C9A84C]">60×96</div><div className="text-[#F5F0E1]/40 text-xs">Greenhouse</div></div>
                <div><div className="text-2xl font-bold text-[#C9A84C]">365</div><div className="text-[#F5F0E1]/40 text-xs">Days/Year</div></div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-[#C9A84C] font-bold text-sm uppercase tracking-wide mb-3">Our Story</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1C1C1C] mb-6">
              A Family Farm Built for the Future
            </h2>
            <div className="space-y-4 text-[#1C1C1C]/70 leading-relaxed">
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
            <Link href="/contact" className="inline-flex items-center gap-2 mt-8 text-[#C9A84C] font-semibold hover:text-[#b8942f]">
              Get in touch →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

