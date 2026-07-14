import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = await auth()

  const isLandlordRoute = pathname.startsWith('/landlord')
  const isTenantRoute = pathname.startsWith('/tenant')
  const isNotificationsRoute = pathname.startsWith('/notifications')

  if (!isLandlordRoute && !isTenantRoute && !isNotificationsRoute) {
    return NextResponse.next()
  }

  if (!session?.user) {
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  if (isLandlordRoute && session.user.role !== 'LANDLORD') {
    return NextResponse.redirect(new URL('/tenant', request.url))
  }

  if (isTenantRoute && session.user.role !== 'TENANT') {
    return NextResponse.redirect(new URL('/landlord', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/landlord/:path*', '/tenant/:path*', '/notifications/:path*'],
}
