import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { quizSetDb, quizAttemptDb } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const quizSets = await quizSetDb.findMany({ createdBy: session.user.id })
    const attempts = await quizAttemptDb.findMany({ userId: session.user.id })

    const totalQuizzes = quizSets.length
    const totalAttempts = attempts.length
    const averageScore = attempts.length > 0 
      ? Math.round(attempts.reduce((sum, attempt) => sum + (attempt.score / attempt.total_questions * 100), 0) / attempts.length)
      : 0

    return NextResponse.json({
      totalQuizzes,
      totalAttempts,
      averageScore
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}