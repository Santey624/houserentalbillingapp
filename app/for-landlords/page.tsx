import type { Metadata } from 'next'
import { InfoPage } from '@/components/marketing/InfoPage'
import { SITE_URL, breadcrumbJsonLd, openGraphMetadata } from '@/lib/site'

const description =
  'See how GharKatha helps landlords in Nepal manage buildings, tenants, Nepali-calendar rent invoices, payments, utilities, and maintenance.'

export const metadata: Metadata = {
  title: 'Rent Management for Landlords in Nepal',
  description,
  alternates: {
    canonical: '/for-landlords',
  },
  openGraph: openGraphMetadata({
    title: 'GharKatha for Landlords in Nepal',
    description,
    path: '/for-landlords',
  }),
}

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE_URL}/for-landlords/#page`,
    url: `${SITE_URL}/for-landlords`,
    name: 'GharKatha for Landlords in Nepal',
    description,
    isPartOf: {
      '@id': `${SITE_URL}/#website`,
    },
  },
  breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'For Landlords', path: '/for-landlords' },
  ]),
]

export default function ForLandlordsPage() {
  return (
    <InfoPage
      eyebrow="For Landlords"
      title="GharKatha rent management for landlords in Nepal"
      introduction="GharKatha gives landlords one organized place to manage buildings, units, tenants, invoices, payment records, and maintenance activity without relying on scattered notebooks and messages."
      jsonLd={jsonLd}
      sections={[
        {
          title: 'Organize every property and unit',
          paragraphs: [
            'A reliable rent process starts with clear property records. GharKatha lets a landlord organize buildings and the individual units inside them, then connect each occupied unit with the relevant tenant. This creates a practical foundation for billing and day-to-day management.',
            'Instead of rebuilding the same context every month, property details remain available in one account. Landlords can move from a building-level overview to the information associated with a specific unit, making it easier to understand who occupies the property and which records belong together.',
          ],
          points: [
            'Manage multiple buildings',
            'Keep unit-level rental records',
            'Connect tenants to the correct unit',
            'Review property activity from one dashboard',
          ],
        },
        {
          title: 'Create clearer rent and utility invoices',
          paragraphs: [
            'GharKatha supports invoice creation using Nepali-calendar billing periods and Nepalese rupee amounts. Landlords can record rent, electricity usage, and additional costs in a structured invoice rather than sending an unexplained total through a message.',
            'Each generated invoice gives the tenant a clearer breakdown and gives the landlord a downloadable record. Consistent invoices reduce ambiguity and build a useful history for both sides of the rental relationship.',
          ],
          points: [
            'Nepali month and year billing',
            'Rent and electricity calculations',
            'Additional-cost notes',
            'Downloadable PDF invoices',
          ],
        },
        {
          title: 'Track payment proof with context',
          paragraphs: [
            'When a tenant submits payment proof, the landlord can review it alongside the related invoice. Keeping the evidence connected to the bill is more dependable than searching through chat history or a phone gallery for an old screenshot.',
            'The verification workflow helps landlords distinguish between an issued invoice and a payment that has been reviewed. This gives the dashboard more meaning and supports more accurate follow-up when an amount remains unresolved.',
          ],
        },
        {
          title: 'Handle maintenance requests in one workflow',
          paragraphs: [
            'Property management continues after rent is collected. Tenants can report maintenance needs through GharKatha, allowing landlords to review requests and track their status in the same platform used for rental records.',
            'A shared maintenance history reduces repeated explanations and provides clearer visibility into what was reported and whether it has been addressed. For landlords managing more than one unit, that organization can save significant time.',
          ],
        },
      ]}
    />
  )
}
