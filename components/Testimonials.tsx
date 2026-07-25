import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah M.',
    location: 'Wayzata, MN',
    text: 'The lettuce from GG Farms is unlike anything I\'ve had before. It\'s so fresh. We order every week and couldn\'t be happier.',
    rating: 5,
  },
  {
    name: 'Mike R.',
    location: 'Minnetonka, MN',
    text: 'Those tomatoes are incredible. I didn\'t know greenhouse grown could taste this good. My wife won\'t let me buy them anywhere else anymore.',
    rating: 5,
  },
  {
    name: 'Jennifer L.',
    location: 'Plymouth, MN',
    text: 'Love supporting a local family farm. The eggs have the most beautiful golden yolks. Worth every penny for the quality.',
    rating: 5,
  },
]

export default function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1C1C1C] mb-4">What Our Neighbors Say</h2>
          <p className="text-gray-500 text-lg">Real people, real opinions.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-8">
          {testimonials.map(t => (
            <div key={t.name} className="bg-[#F5F0E1] rounded-2xl p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#C9A84C] text-[#C9A84C]" />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed mb-4 italic">"{t.text}"</p>
              <div>
                <div className="font-semibold text-[#1C1C1C]">{t.name}</div>
                <div className="text-gray-400 text-sm">{t.location}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
