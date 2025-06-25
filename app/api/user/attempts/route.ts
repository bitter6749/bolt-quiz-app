import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { quizAttemptDb } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const attempts = await quizAttemptDb.findMany({ userId: session.user.id })
    return NextResponse.json(attempts)
  } catch (error) {
    console.error('Error fetching attempts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}