import type { Metadata } from 'next'
import { InfoPage } from '@/components/marketing/InfoPage'
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  breadcrumbJsonLd,
  openGraphMetadata,
} from '@/lib/site'

export const metadata: Metadata = {
  title: 'About GharKatha',
  description:
    'Learn what GharKatha means and how our Nepal-focused rent management platform helps landlords and tenants organize rental life.',
  alternates: {
    canonical: '/about',
  },
  openGraph: openGraphMetadata({
    title: 'About GharKatha',
    description:
      'Discover the story, purpose, and Nepal-focused approach behind GharKatha smart rent management.',
    path: '/about',
  }),
}

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${SITE_URL}/about/#page`,
    url: `${SITE_URL}/about`,
    name: 'About GharKatha',
    description: SITE_DESCRIPTION,
    isPartOf: {
      '@id': `${SITE_URL}/#website`,
    },
    about: {
      '@id': `${SITE_URL}/#organization`,
    },
  },
  breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'About GharKatha', path: '/about' },
  ]),
]

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="About GharKatha"
      title="GharKatha brings clarity to rental management in Nepal"
      introduction="GharKatha is a smart rent management platform created for the everyday relationship between landlords and tenants in Nepal. The name combines ghar—home—with katha—story—because every rental home has records, responsibilities, and people behind it."
      jsonLd={jsonLd}
      sections={[
        {
          title: 'Why GharKatha exists',
          paragraphs: [
            'Rental management is often spread across paper notebooks, chat messages, bank screenshots, and memory. That makes simple questions harder than they should be: Which invoice is due? Was the payment received? What was the electricity reading? Has a maintenance request been resolved? GharKatha brings those details together so both sides can work from the same organized record.',
            'The platform is designed around common rental workflows in Nepal rather than forcing landlords and tenants into a generic international property system. GharKatha supports Nepali-calendar billing, NPR amounts, payment-proof review, building and unit records, and maintenance communication in one focused experience.',
          ],
        },
        {
          title: 'Built for landlords and tenants',
          paragraphs: [
            'Landlords can organize buildings and units, connect tenants, prepare rent and utility invoices, review submitted payment proof, and follow maintenance requests. This replaces fragmented manual tracking with a clearer operational view of each property.',
            'Tenants can see their own invoices, download records, submit payment proof, and report maintenance needs without searching through old conversations. Each role receives the information and actions relevant to it, while private account information remains protected behind sign-in.',
          ],
          points: [
            'Building and unit organization',
            'Nepali-calendar rent invoicing',
            'NPR and electricity-charge records',
            'Payment-proof submission and review',
            'Maintenance request tracking',
            'Downloadable invoice documents',
          ],
        },
        {
          title: 'What the GharKatha name represents',
          paragraphs: [
            `GharKatha is more than a product label. “Ghar” represents the home and property being managed. “Katha” represents the ongoing story created by invoices, payments, maintenance, and communication. Together, ${SITE_NAME} describes a reliable digital history for each rental relationship.`,
            'Our goal is practical: reduce uncertainty, save time, and make rental records easier to understand. GharKatha is built to help Nepal’s landlords and tenants move from scattered information toward a transparent, dependable process that works on phones and computers.',
          ],
        },
        {
          title: 'A Nepal-first approach',
          paragraphs: [
            'GharKatha reflects the local details that matter: Nepali billing periods, Nepalese rupees, common property structures, and the payment methods tenants and landlords already use. The interface is responsive and accessible from modern mobile and desktop browsers, helping users manage rental tasks wherever they are.',
            'As the platform grows, the same principle will guide every improvement: solve real rental-management problems clearly, securely, and with respect for both landlords and tenants.',
          ],
        },
      ]}
    />
  )
}
