import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const quizSets = await prisma.quizSet.findMany({
      where: { createdBy: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { attempts: true }
        }
      }
    })

    return NextResponse.json(quizSets)
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

    const quizSet = await prisma.quizSet.create({
      data: {
        title,
        description,
        questions: JSON.stringify(questions),
        createdBy: session.user.id,
      },
    })

    return NextResponse.json(quizSet)
  } catch (error) {
    console.error('Error creating quiz:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}