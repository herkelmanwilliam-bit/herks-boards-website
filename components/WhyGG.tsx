import { Leaf, Zap, Heart, Truck } from 'lucide-react'

const reasons = [
  {
    icon: Leaf,
    title: 'Always Pesticide-Free',
    description: 'Our Greenhouse grown system means we never need pesticides. What you get is pure, clean produce.',
    color: 'bg-[#94a3b8]/10 text-[#94a3b8]',
  },
  {
    icon: Zap,
    title: 'Harvested This Week',
    description: 'We harvest throughout the week so everything you receive is fresh from our Minnetrista greenhouse.',
    color: 'bg-[#94a3b8]/10 text-[#94a3b8]',
  },
  {
    icon: Heart,
    title: 'Family Owned & Operated',
    description: 'Scott, Gina, Julian and Charles pour their hearts into every crop. You know exactly who grew your food.',
    color: 'bg-[#94a3b8]/10 text-[#94a3b8]',
  },
  {
    icon: Truck,
    title: 'Farm Pickup & Local Delivery',
    description: 'Farm Pickup is free at our Minnetrista location. Local delivery available. Fresh Minnesota produce, on your schedule.',
    color: 'bg-[#94a3b8]/10 text-[#94a3b8]',
  },
]

export default function WhyGG() {
  return (
    <section className="py-20 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] mb-4">Why GG Farms?</h2>
          <p className="text-xl text-[#0f172a]/60 max-w-2xl mx-auto">
            Not your average farm. We grow indoors, year-round, with technology that produces better vegetables than outdoor growing can.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map(r => (
            <div key={r.title} className="text-center">
              <div className={`w-14 h-14 ${r.color} border border-[#94a3b8]/30 rounded-sm flex items-center justify-center mx-auto mb-4`}>
                <r.icon className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-[#0f172a] text-lg mb-2">{r.title}</h3>
              <p className="text-[#0f172a]/60 text-sm leading-relaxed">{r.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

