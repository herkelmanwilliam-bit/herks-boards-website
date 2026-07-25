import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Herk\'s Boards | Custom Woodworking & Cutting Boards in Waterloo, IA',
  description: 'Handcrafted cutting boards, custom woodworking, and decorative wooden plaques. Built by hand in Waterloo, Iowa.',
  keywords: 'custom cutting boards, handmade cutting boards, woodworking, Herks Boards, Waterloo IA, Iowa woodworking, end grain cutting boards, bespoke woodworking',
  icons: {
    icon: '/favicon-32.png',
    apple: '/favicon-192.png',
  },
  openGraph: {
    title: 'Herk\'s Boards | Custom Woodworking in Waterloo, IA',
    description: 'Handcrafted cutting boards, custom woodworking, and decorative wooden plaques built in Iowa.',
    url: 'https://www.herksboards.com',
    siteName: 'Herk\'s Boards',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Herk\'s Boards | Custom Woodworking in Waterloo, IA',
    description: 'Handcrafted cutting boards, custom woodworking, and decorative wooden plaques built in Iowa.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Herk\'s Boards',
    url: 'https://www.herksboards.com',
    description: 'Handcrafted custom cutting boards, decorative state plaques, and bespoke woodworking.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Waterloo',
      addressRegion: 'IA',
      postalCode: '50701',
      addressCountry: 'US'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 42.4928,
      longitude: -92.3426
    },
    priceRange: '$$',
    sameAs: ['https://www.instagram.com/herksboards/'],
  }

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <Toaster position="bottom-center" />
      </body>
    </html>
  )
}
