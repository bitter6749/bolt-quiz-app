import { NextRequest, NextResponse } from 'next/server'
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
    
    // Add attempt counts
    const quizSetsWithCounts = await Promise.all(
      quizSets.map(async (quiz) => ({
        ...quiz,
        _count: {
          attempts: await quizAttemptDb.count({ quizSetId: quiz.id })
        }
      }))
    )

    return NextResponse.json(quizSetsWithCounts)
  } catch (error) {
    console.error('Error fetching quizzes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, questions } = await request.json()

    const quizSet = await quizSetDb.create({
      title,
      description,
      questions: JSON.stringify(questions),
      createdBy: session.user.id,
    })

    return NextResponse.json(quizSet)
  } catch (error) {
    console.error('Error creating quiz:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}