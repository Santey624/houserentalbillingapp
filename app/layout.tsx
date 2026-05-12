import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { SessionProvider } from 'next-auth/react'
import './globals.css'

const dmSans = localFont({
  src: [
    {
      path: '../public/fonts/dm-sans-latin-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/dm-sans-latin-700-normal.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-dm-sans',
  display: 'swap',
})

const playfair = localFont({
  src: [
    {
      path: '../public/fonts/playfair-display-latin-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/playfair-display-latin-700-normal.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AKS Rental Platform',
  description: 'Rental management for Nepal landlords and tenants',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
