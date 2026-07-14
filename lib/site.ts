export const SITE_NAME = 'GharKatha'
export const SITE_URL = 'https://gharkatha.com'
export const SITE_DESCRIPTION =
  'GharKatha is Nepal’s smart rent management platform for landlords and tenants to manage properties, invoices, payments, and maintenance online in Nepal.'

export function openGraphMetadata({
  title,
  description,
  path,
}: {
  title: string
  description: string
  path: string
}) {
  return {
    type: 'website' as const,
    locale: 'en_NP',
    url: path,
    siteName: SITE_NAME,
    title,
    description,
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'GharKatha Smart Rent Management',
      },
    ],
  }
}

export function absoluteUrl(path = '/') {
  return new URL(path, SITE_URL).toString()
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}
