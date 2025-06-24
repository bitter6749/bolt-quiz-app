import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { quizAttemptDb } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { answers, score, totalQuestions } = await request.json()

    const attempt = await quizAttemptDb.create({
      userId: session.user.id,
      quizSetId: params.id,
      answers: JSON.stringify(answers),
      score,
      totalQuestions,
    })

    return NextResponse.json(attempt)
  } catch (error) {
    console.error('Error saving quiz attempt:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}