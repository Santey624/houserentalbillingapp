import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Logo, LogoDark } from '@/components/shared/Logo'

type ContentSection = {
  title: string
  paragraphs: string[]
  points?: string[]
}

type InfoPageProps = {
  eyebrow: string
  title: string
  introduction: string
  sections: ContentSection[]
  jsonLd: object
}

const publicLinks = [
  { href: '/about', label: 'About' },
  { href: '/for-landlords', label: 'For Landlords' },
  { href: '/for-tenants', label: 'For Tenants' },
  { href: '/rent-management-nepal', label: 'Rent Management Nepal' },
]

export function InfoPage({
  eyebrow,
  title,
  introduction,
  sections,
  jsonLd,
}: InfoPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-5 px-5 py-4 sm:px-8">
          <Link href="/" aria-label="GharKatha home">
            <Logo height={48} />
          </Link>
          <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
            {publicLinks.map((link) => (
              <Link key={link.href} href={link.href} className="btn-ghost">
                {link.label}
              </Link>
            ))}
          </nav>
          <Link href="/auth/signup" className="btn-primary">
            Get Started <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      <main>
        <article>
          <section className="border-b border-border px-5 py-20 sm:px-8 sm:py-28">
            <div className="mx-auto max-w-4xl">
              <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground">
                  Home
                </Link>
                <span aria-hidden="true" className="mx-2">
                  /
                </span>
                <span aria-current="page">{eyebrow}</span>
              </nav>
              <p className="mb-5 font-mono text-xs uppercase tracking-[0.15em] text-accent">
                {eyebrow}
              </p>
              <h1 className="mb-7 text-4xl leading-tight text-foreground sm:text-6xl">{title}</h1>
              <p className="max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
                {introduction}
              </p>
            </div>
          </section>

          <section className="px-5 py-20 sm:px-8 sm:py-24">
            <div className="mx-auto grid max-w-4xl gap-14">
              {sections.map((section) => (
                <section key={section.title} aria-labelledby={section.title.replaceAll(' ', '-').toLowerCase()}>
                  <h2
                    id={section.title.replaceAll(' ', '-').toLowerCase()}
                    className="mb-5 text-3xl text-foreground"
                  >
                    {section.title}
                  </h2>
                  <div className="space-y-4 text-base leading-7 text-muted-foreground">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  {section.points ? (
                    <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                      {section.points.map((point) => (
                        <li key={point} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <CheckCircle2
                            aria-hidden="true"
                            size={16}
                            className="mt-0.5 flex-shrink-0 text-accent"
                          />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>
          </section>

          <section className="bg-muted/40 px-5 py-16 sm:px-8">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-6 text-2xl text-foreground">Learn more about GharKatha</h2>
              <div className="flex flex-wrap gap-3">
                {publicLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="btn-secondary">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-foreground px-5 py-20 text-center sm:px-8">
            <h2 className="mb-4 text-3xl text-white">Ready to manage rent with less effort?</h2>
            <p className="mx-auto mb-8 max-w-2xl text-white/60">
              Create your GharKatha account and bring property, invoice, payment, and maintenance
              records into one organized platform.
            </p>
            <Link href="/auth/signup" className="btn-primary h-12 px-7">
              Create an Account <ArrowRight size={15} />
            </Link>
          </section>
        </article>
      </main>

      <footer className="bg-foreground px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <LogoDark showTagline />
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {publicLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-white/50 hover:text-white/80">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
