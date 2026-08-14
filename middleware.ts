import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Admin-only routes
    if (pathname.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized({ token }) {
        // Must have a token to access any protected route
        return !!token
      },
    },
    pages: {
      signIn: '/login',
    },
  }
)

// Protect all routes except public ones
export const config = {
  matcher: [
    '/((?!login|api/auth|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)',
  ],
}
