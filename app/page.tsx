import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LandingNav from '@/components/landing/LandingNav'
import HeroSection from '@/components/landing/HeroSection'
import ProblemSection from '@/components/landing/ProblemSection'
import SolutionSection from '@/components/landing/SolutionSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import NepalSection from '@/components/landing/NepalSection'
import { FinalCta, LandingFooter } from '@/components/landing/FinalCta'
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  openGraphMetadata,
} from '@/lib/site'

export const metadata: Metadata = {
  title: {
    absolute: 'GharKatha - Smart Rent Management in Nepal',
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: '/',
  },
  openGraph: openGraphMetadata({
    title: 'GharKatha - Smart Rent Management in Nepal',
    description: SITE_DESCRIPTION,
    path: '/',
  }),
}

const homeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/gharkatha.png'),
        width: 2172,
        height: 724,
      },
      description: SITE_DESCRIPTION,
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      publisher: {
        '@id': `${SITE_URL}/#organization`,
      },
      inLanguage: 'en',
    },
  ],
}

export default async function LandingPage() {
  const session = await auth()

  if (session?.user) {
    redirect(session.user.role === 'LANDLORD' ? '/landlord' : '/tenant')
  }

  return (
    <main className="landing-root min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <LandingNav />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <NepalSection />
      <FinalCta />
      <LandingFooter />
    </main>
  )
}
