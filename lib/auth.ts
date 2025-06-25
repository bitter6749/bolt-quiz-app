import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { userDb, accountDb, sessionDb, monthlyUsageDb } from './db'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false
      
      try {
        // Check if user exists
        let existingUser = await userDb.findUnique({ email: user.email })
        
        if (!existingUser) {
          // Create new user
          existingUser = await userDb.create({
            email: user.email,
            name: user.name || '',
            image: user.image || '',
            role: 'USER',
          })
          
          // Create initial monthly usage record
          const currentMonth = new Date().toISOString().slice(0, 7)
          await monthlyUsageDb.create({
            userId: existingUser.id,
            monthYear: currentMonth,
            totalPrompts: 0,
            totalCost: 0,
          })
        }
        
        // Create or update account
        if (account) {
          await accountDb.create({
            userId: existingUser.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            refresh_token: account.refresh_token,
            access_token: account.access_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            session_state: account.session_state,
          })
        }
        
        return true
      } catch (error) {
        console.error('Sign in error:', error)
        return false
      }
    },
    
    async session({ session, token }) {
      if (session.user?.email) {
        const user = await userDb.findUnique({ email: session.user.email })
        if (user) {
          session.user.id = user.id
          session.user.role = user.role
        }
      }
      return session
    },
    
    async jwt({ token, user, account }) {
      if (user) {
        token.uid = user.id
      }
      return token
    },
    
    redirect: async ({ url, baseUrl }) => {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  session: {
    strategy: 'jwt',
  },
  debug: process.env.NODE_ENV === 'development',
}