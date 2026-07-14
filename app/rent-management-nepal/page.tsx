import type { Metadata } from 'next'
import { InfoPage } from '@/components/marketing/InfoPage'
import { SITE_URL, breadcrumbJsonLd, openGraphMetadata } from '@/lib/site'

const description =
  'A practical guide to digital rent management in Nepal, including Nepali-calendar invoices, payment records, utilities, and maintenance workflows.'

export const metadata: Metadata = {
  title: 'Digital Rent Management in Nepal',
  description,
  alternates: {
    canonical: '/rent-management-nepal',
  },
  openGraph: openGraphMetadata({
    title: 'Digital Rent Management in Nepal with GharKatha',
    description,
    path: '/rent-management-nepal',
  }),
}

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${SITE_URL}/rent-management-nepal/#article`,
    url: `${SITE_URL}/rent-management-nepal`,
    headline: 'Digital Rent Management in Nepal',
    description,
    author: {
      '@id': `${SITE_URL}/#organization`,
    },
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
    mainEntityOfPage: {
      '@id': `${SITE_URL}/rent-management-nepal/#page`,
    },
  },
  breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Rent Management Nepal', path: '/rent-management-nepal' },
  ]),
]

export default function RentManagementNepalPage() {
  return (
    <InfoPage
      eyebrow="Rent Management Nepal"
      title="A practical approach to digital rent management in Nepal"
      introduction="Digital rent management replaces scattered notebooks, messages, and screenshots with connected property, invoice, payment, and maintenance records. GharKatha applies that approach to the needs of landlords and tenants in Nepal."
      jsonLd={jsonLd}
      sections={[
        {
          title: 'What rent management includes',
          paragraphs: [
            'Rent management is more than collecting a monthly amount. It begins with accurate information about the building, unit, landlord, and tenant. It continues through billing, utility calculations, payment confirmation, and the maintenance responsibilities that arise during a tenancy.',
            'When each step is handled separately, important context is easily lost. A rent amount may be written in one notebook, an electricity reading stored in a message, and payment proof saved as an unnamed image. A digital system connects those records around the relevant property and billing period.',
          ],
          points: [
            'Property and unit records',
            'Tenant connections',
            'Recurring rent invoices',
            'Electricity and additional charges',
            'Payment evidence and review',
            'Maintenance communication',
          ],
        },
        {
          title: 'Why Nepal-specific billing matters',
          paragraphs: [
            'Many rental arrangements in Nepal follow Nepali months and years. A platform that only assumes Gregorian billing can add unnecessary translation work and make records less intuitive for the people using them. GharKatha supports Nepali-calendar invoice periods so a digital record can reflect the billing language already used by landlords and tenants.',
            'Amounts also need to be understandable in Nepalese rupees, with room for rent, electricity, and other agreed costs. A structured invoice makes these components visible instead of presenting a single unexplained number.',
          ],
        },
        {
          title: 'Creating a dependable payment record',
          paragraphs: [
            'Digital wallets, bank transfers, and other payment methods can produce electronic evidence, but the screenshot alone is not a complete rent record. It needs to be connected with the tenant, invoice, amount, and billing period it is intended to settle.',
            'A useful workflow lets the tenant submit proof for a specific invoice and lets the landlord review that proof with the bill in view. This does not replace the payment provider; it organizes the information needed to understand and verify the rental transaction.',
          ],
        },
        {
          title: 'Making maintenance part of the same system',
          paragraphs: [
            'A healthy rental relationship also depends on how property issues are communicated. If maintenance requests live only in calls or chat threads, the original details and current status can become unclear. Keeping requests inside the rent management platform creates a consistent history.',
            'Tenants gain a direct way to report an issue, while landlords gain a list they can review and update. Combining maintenance and billing does not mean the tasks are identical; it means both are attached to the same organized rental relationship.',
          ],
        },
        {
          title: 'How to move from manual to digital records',
          paragraphs: [
            'The transition can start simply: add the property and units, connect the current tenants, and use the platform for the next invoice. From that point forward, each new bill, payment submission, and maintenance request contributes to a clearer digital history.',
            'GharKatha is designed to make that process approachable for individual landlords and tenants, not only large property businesses. The value comes from consistent records over time: fewer missing details, easier follow-up, and a shared understanding of rental activity.',
          ],
        },
      ]}
    />
  )
}
