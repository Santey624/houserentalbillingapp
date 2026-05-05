import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <div className="text-6xl font-bold text-[#0f3460] mb-4">404</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h2>
        <p className="text-gray-500 text-sm mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/" className="bg-[#0f3460] text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0f3460]/90 transition">
          Go home
        </Link>
      </div>
    </div>
  )
}
