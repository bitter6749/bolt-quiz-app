import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect admin routes
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return token?.role === 'ADMIN'
        }
        
        // Protect all other routes except login
        if (req.nextUrl.pathname.startsWith('/login')) {
          return true
        }
        
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/quiz/:path*',
    '/history/:path*',
    '/admin/:path*',
    '/api/quiz/:path*',
    '/api/ai/:path*',
    '/api/admin/:path*'
  ]
}