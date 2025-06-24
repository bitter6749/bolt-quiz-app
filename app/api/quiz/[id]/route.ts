import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { quizSetDb, userDb } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const quizSet = await quizSetDb.findUnique({ id: params.id })

    if (!quizSet) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    // Get user info
    const user = await userDb.findUnique({ id: quizSet.createdBy })

    // Parse questions JSON
    const questionsData = JSON.parse(quizSet.questions)

    return NextResponse.json({
      ...quizSet,
      questions: questionsData,
      user: user ? { name: user.name, email: user.email } : null
    })
  } catch (error) {
    console.error('Error fetching quiz:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const quizSet = await quizSetDb.findUnique({ id: params.id })

    if (!quizSet) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    if (quizSet.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await quizSetDb.delete({ id: params.id })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting quiz:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}