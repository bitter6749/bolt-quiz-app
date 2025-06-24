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
        
        // Allow access to auth pages
        if (req.nextUrl.pathname.startsWith('/login') || 
            req.nextUrl.pathname.startsWith('/auth/error')) {
          return true
        }
        
        // Protect all other routes
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
    '/api/admin/:path*',
    '/api/user/:path*'
  ]
}