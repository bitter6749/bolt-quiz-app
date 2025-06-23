import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const quizSet = await prisma.quizSet.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    })

    if (!quizSet) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    // Parse questions JSON
    const questionsData = JSON.parse(quizSet.questions)

    return NextResponse.json({
      ...quizSet,
      questions: questionsData,
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

    const quizSet = await prisma.quizSet.findUnique({
      where: { id: params.id }
    })

    if (!quizSet) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    if (quizSet.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.quizSet.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting quiz:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}