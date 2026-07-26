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
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden bg-[#0f172a]">
        <div className="absolute inset-0 bg-[#0f172a]/80 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-3">Iowa</div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">Craftsmanship in Every Cut</h1>
            <p className="text-gray-300 text-lg max-w-xl mx-auto">
              Custom woodworking built to endure.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-slate-600 font-bold text-sm uppercase tracking-wide mb-3">Our Story</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] mb-12">About Herk's Boards</h2>
          <div className="space-y-6 text-[#0f172a]/80 leading-relaxed text-lg text-left">
            <p>
              Herk’s Boards was born in the fall of 2024 after Bill and Abby Herkelman were gifted a few woodworking tools by Bill’s parents. What they intended as a thoughtful gift quickly turned into a full-blown woodworking addiction. Thanks, Mom and Dad.
            </p>
            <p>
              Armed with Bill’s uncanny ability to turn a random idea into a finished project and Abby’s slightly concerning obsession with cutting boards, Herk’s Boards officially came to life.
            </p>
            <p>
              By day, we’re both law enforcement officers. By night (and most weekends), we’re usually covered in sawdust, debating wood species, and convincing ourselves that buying another tool is absolutely necessary. We also share our home with six dogs, which means there’s a good chance at least one piece of every project has been quality inspected by a canine supervisor.
            </p>
            <p>
              We love being outdoors, creating things together, and taking on new challenges. Sometimes we build what our customers dream up. Sometimes we build whatever weird idea pops into our heads at 10 p.m. Both approaches have worked out surprisingly well.
            </p>
            <p>
              In the summer of 2025, we built our own woodworking shop and dramatically expanded our tool collection. Some people might call it an investment. Others might call it a problem. We prefer the term “growth.”
            </p>
            <p>
              No matter what we’re making, quality is our top priority. We want every customer to open their order and think, “This is even better than I hoped.” Whether you’re looking for a handcrafted cutting board, a custom piece, or an idea that seems a little crazy, we’d love the opportunity to create something you’ll love.
            </p>
            <p className="font-semibold text-center mt-12 pt-8 text-slate-500 italic">
              Thanks for supporting our small business—and for helping justify all those tool purchases.
            </p>
          </div>
        </div>
      </div>

      {/* Location + CTA */}
      <div className="bg-[#0f172a] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-slate-400 font-bold text-sm uppercase tracking-wide mb-3">Nationwide Shipping</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">We Ship Anywhere in the US</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 bg-slate-600 text-white px-8 py-4 rounded-sm font-bold hover:bg-slate-700 transition-colors"
            >
              Shop Standard Boards
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/custom-order"
              className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-slate-500/50 text-slate-400 px-8 py-4 rounded-sm font-bold hover:border-slate-400 transition-colors"
            >
              Request a Custom Build
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}
