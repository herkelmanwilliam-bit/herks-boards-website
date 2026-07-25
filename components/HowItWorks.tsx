import { Ruler, Hammer, Truck, CheckCircle } from 'lucide-react'

const steps = [
  { icon: Ruler, step: '01', title: 'Choose Your Design', description: 'Pick from our standard sizes in the shop, or submit a custom build request with your exact dimensions and wood type.' },
  { icon: Hammer, step: '02', title: 'Handcrafted', description: 'Every board is cut, glued, sanded, and finished by hand using premium hardwoods and food-safe oils.' },
  { icon: CheckCircle, step: '03', title: 'Quality Check', description: 'We meticulously check edges, juice grooves, and finishes to ensure your board is flawless.' },
  { icon: Truck, step: '04', title: 'Shipped to You', description: 'We ship nationwide anywhere in the US. Your custom board will arrive carefully packaged and ready for your kitchen.' },
]

export default function HowItWorks() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] mb-4">The Process</h2>
          <p className="text-xl text-gray-500">From raw timber to your kitchen counter.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div key={s.step} className="relative bg-white p-6 rounded-sm shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-white rounded-sm flex items-center justify-center mb-6">
                <s.icon className="w-8 h-8 text-slate-600" />
              </div>
              <div className="text-xs font-bold text-slate-500 mb-2">STEP {s.step}</div>
              <h3 className="font-bold text-[#0f172a] text-lg mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
