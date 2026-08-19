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
        return !!token
      },
    },
    pages: {
      signIn: '/login',
    },
  }
)

// Only protect app routes — exclude all static assets, API auth, and public files
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next (static files, images, HMR)
     * - api/auth (NextAuth endpoints)
     * - login (public login page)
     * - Static public files (icons, manifest, sw, favicon)
     */
    '/((?!_next|api/auth|login|icons|manifest\\.json|sw\\.js|favicon\\.ico).*)',
  ],
}
