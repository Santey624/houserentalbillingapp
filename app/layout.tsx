import type { Metadata } from 'next'
import { Inter, Calistoga, JetBrains_Mono } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, openGraphMetadata } from '@/lib/site'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const calistoga = Calistoga({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-calistoga',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  weight: ['400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'GharKatha - Smart Rent Management in Nepal',
    template: '%s | GharKatha',
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'GharKatha',
    'rent management Nepal',
    'landlord software Nepal',
    'tenant rent management',
    'Nepali rent invoice',
  ],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: openGraphMetadata({
    title: 'GharKatha - Smart Rent Management in Nepal',
    description: SITE_DESCRIPTION,
    path: '/',
  }),
  twitter: {
    card: 'summary_large_image',
    title: 'GharKatha - Smart Rent Management in Nepal',
    description: SITE_DESCRIPTION,
    images: ['/opengraph-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${calistoga.variable} ${jetbrainsMono.variable} h-full`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>{children}</SessionProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}
