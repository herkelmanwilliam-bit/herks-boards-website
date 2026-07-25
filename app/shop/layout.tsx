import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop Fresh Produce & Farm Eggs | GG Farms MN — Minnetrista, MN',
  description: 'Order fresh local vegetables and free range organic eggs from GG Farms in Minnetrista, MN. Pickup Tuesdays & Thursdays. Pesticide-free, harvested this week.',
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
