import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function LandingPage() {
  const session = await auth()

  if (session?.user) {
    redirect(session.user.role === 'LANDLORD' ? '/landlord' : '/tenant')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f3460] to-[#16213e] flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between">
        <span className="text-white text-xl font-bold tracking-wide">AKS Rental</span>
        <div className="flex gap-3">
          <Link
            href="/auth/signin"
            className="text-white border border-white/30 px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="bg-white text-[#0f3460] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition"
          >
            Get Started
          </Link>
        </div>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Rental Management<br />
          <span className="text-blue-300">for Nepal</span>
        </h1>
        <p className="text-blue-100 text-lg md:text-xl max-w-2xl mb-10">
          Manage buildings, generate invoices in Nepali calendar, track payments,
          and handle maintenance requests — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/auth/signup?role=LANDLORD"
            className="bg-white text-[#0f3460] px-8 py-3 rounded-xl font-semibold text-lg hover:bg-gray-100 transition shadow-lg"
          >
            I&apos;m a Landlord
          </Link>
          <Link
            href="/auth/signup?role=TENANT"
            className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-white/10 transition"
          >
            I&apos;m a Tenant
          </Link>
        </div>
      </section>

      <section className="bg-white/5 py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'For Landlords',
              items: ['Manage buildings & units', 'Generate Nepali-calendar invoices', 'Track rent & electricity', 'Verify payment proofs'],
            },
            {
              title: 'For Tenants',
              items: ['View and download invoices', 'Submit payment proof', 'File maintenance requests', 'Track request status'],
            },
            {
              title: 'Built for Nepal',
              items: ['Nepali calendar billing', 'NPR currency', 'eSewa / Khalti / Bank transfer', 'Multi-meter electricity'],
            },
          ].map((card) => (
            <div key={card.title} className="bg-white/10 rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-4">{card.title}</h3>
              <ul className="space-y-2">
                {card.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-blue-100 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-300 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center py-6 text-blue-300/60 text-sm">
        AKS Rental Platform &copy; {new Date().getFullYear()}
      </footer>
    </main>
  )
}