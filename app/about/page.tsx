import Link from 'next/link'
import { ArrowRight, Hammer } from 'lucide-react'

export const metadata = {
  title: 'About Herk\'s Boards — Our Story',
  description: 'Herk\'s Boards offers custom woodworking and handcrafted cutting boards from Iowa.'
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden bg-[#1C1C1C]">
        <div className="absolute inset-0 bg-[#1C1C1C]/80 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="text-amber-500 font-bold text-sm uppercase tracking-widest mb-3">Iowa</div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">Craftsmanship in Every Cut</h1>
            <p className="text-gray-300 text-lg max-w-xl mx-auto">
              Custom woodworking built to endure.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-amber-700 font-bold text-sm uppercase tracking-wide mb-3">Our Story</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1C1C1C] mb-6">About Herk's Boards</h2>
          <div className="space-y-4 text-[#1C1C1C]/70 leading-relaxed text-lg text-left">
            <p>
              Herk's Boards was established in 2024 to bring high-quality, handcrafted cutting boards and decorative wooden plaques to homes across the country.
            </p>
            <p>
              Operating out of Iowa, every piece is made by hand with meticulous attention to detail. Whether it's a solid Walnut edge-grain board for your kitchen, an Iowa State university plaque for your wall, or a custom build tailored precisely to your dimensions, we take pride in using premium hardwoods and food-safe finishes.
            </p>
            <p>
              We believe a cutting board shouldn't just be a kitchen tool—it should be a piece of functional art that you're proud to leave out on the counter.
            </p>
          </div>
        </div>
      </div>

      {/* Location + CTA */}
      <div className="bg-[#1C1C1C] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-amber-500 font-bold text-sm uppercase tracking-wide mb-3">Nationwide Shipping</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">We Ship Anywhere in the US</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 bg-amber-700 text-white px-8 py-4 rounded-xl font-bold hover:bg-amber-800 transition-colors"
            >
              Shop Standard Boards
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/custom-order"
              className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-amber-600/50 text-amber-500 px-8 py-4 rounded-xl font-bold hover:border-amber-500 transition-colors"
            >
              Request a Custom Build
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}
