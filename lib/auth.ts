import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user && user) {
        session.user.id = user.id
        session.user.role = (user as any).role
      }
      return session
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id
      }
      return token
    },
  },
  events: {
    createUser: async ({ user }) => {
      // Create initial monthly usage record
      const currentMonth = new Date().toISOString().slice(0, 7)
      await prisma.monthlyUsage.create({
        data: {
          userId: user.id,
          monthYear: currentMonth,
          totalPrompts: 0,
          totalCost: 0,
        },
      })
    },
  },
  session: {
    strategy: 'database',
  },
}