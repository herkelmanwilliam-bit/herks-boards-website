import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact GG Farms MN | Minnetrista, MN',
  description: 'Get in touch with GG Farms in Minnetrista, Minnesota. Questions about orders, pickup, or delivery — we\'d love to hear from you.',
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
