import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Herk\'s Boards | Custom Woodworking & Cutting Boards',
  description: 'Handcrafted cutting boards, custom woodworking, and decorative wooden plaques.',
  keywords: 'custom cutting boards, handmade cutting boards, woodworking, Herks Boards',
  icons: {
    icon: '/favicon-32.png',
    apple: '/favicon-192.png',
  },
  openGraph: {
    title: 'Herk\'s Boards | Custom Woodworking',
    description: 'Handcrafted cutting boards, custom woodworking, and decorative wooden plaques.',
    url: 'https://www.herksboards.com',
    siteName: 'Herk\'s Boards',
    locale: 'en_US',
    type: 'website',
    images: [{
      url: 'https://www.herksboards.com/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Herk\'s Boards Custom Woodworking',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Herk\'s Boards | Custom Woodworking',
    description: 'Handcrafted cutting boards, custom woodworking, and decorative wooden plaques.',
    images: ['https://www.herksboards.com/og-image.jpg'],
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
    logo: 'https://www.herksboards.com/images/logo.png',
    image: 'https://www.herksboards.com/images/og-image.jpg',
    description: 'Handcrafted cutting boards, custom woodworking, and decorative wooden plaques.',
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
