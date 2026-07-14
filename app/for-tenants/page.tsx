import type { Metadata } from 'next'
import { InfoPage } from '@/components/marketing/InfoPage'
import { SITE_URL, breadcrumbJsonLd, openGraphMetadata } from '@/lib/site'

const description =
  'Learn how GharKatha helps tenants in Nepal view rent invoices, download records, submit payment proof, and track maintenance requests online.'

export const metadata: Metadata = {
  title: 'Rent Records for Tenants in Nepal',
  description,
  alternates: {
    canonical: '/for-tenants',
  },
  openGraph: openGraphMetadata({
    title: 'GharKatha for Tenants in Nepal',
    description,
    path: '/for-tenants',
  }),
}

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE_URL}/for-tenants/#page`,
    url: `${SITE_URL}/for-tenants`,
    name: 'GharKatha for Tenants in Nepal',
    description,
    isPartOf: {
      '@id': `${SITE_URL}/#website`,
    },
  },
  breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'For Tenants', path: '/for-tenants' },
  ]),
]

export default function ForTenantsPage() {
  return (
    <InfoPage
      eyebrow="For Tenants"
      title="GharKatha gives tenants clearer rent records"
      introduction="GharKatha helps tenants in Nepal understand what they have been billed, keep downloadable invoice records, share payment proof, and communicate maintenance needs through one secure account."
      jsonLd={jsonLd}
      sections={[
        {
          title: 'See what each invoice includes',
          paragraphs: [
            'A rent request should be easy to understand. In GharKatha, tenants can open an invoice and review the billing period, rent amount, utility details, and additional costs recorded by the landlord. That context is more useful than receiving only a final total.',
            'Invoices are organized within the tenant account, so current and previous records are easier to find. A tenant can also download the invoice as a PDF when a copy is needed for personal records or later reference.',
          ],
          points: [
            'Clear billing periods',
            'Rent and utility breakdowns',
            'Invoice history in one account',
            'Downloadable PDF records',
          ],
        },
        {
          title: 'Submit payment proof against the right bill',
          paragraphs: [
            'After making a payment through an agreed method, a tenant can submit payment proof for the related invoice. Connecting the proof directly with the bill reduces the risk of screenshots becoming separated from their purpose.',
            'The landlord can then review the submission within the same workflow. This creates a clearer handoff between payment and verification while preserving a more useful record for both parties.',
          ],
        },
        {
          title: 'Report maintenance without losing the details',
          paragraphs: [
            'Maintenance issues are easier to resolve when the original description and status remain visible. GharKatha allows tenants to file a maintenance request from their account and follow its progress without depending entirely on repeated phone calls or old messages.',
            'A structured request helps identify what needs attention and gives the landlord a consistent place to manage the response. The result is a more transparent process for routine property concerns.',
          ],
          points: [
            'Submit a maintenance description',
            'Keep requests connected to the tenancy',
            'Follow the request status',
            'Maintain a shared activity record',
          ],
        },
        {
          title: 'Private access to personal rental information',
          paragraphs: [
            'Tenant invoices, payment proof, and maintenance records are not public marketing content. They are available through authenticated account pages intended for the tenant and the relevant property workflow.',
            'GharKatha separates public information about the platform from private rental activity. That approach gives tenants a straightforward public site to learn about the service and a protected dashboard for their own records.',
          ],
        },
      ]}
    />
  )
}
