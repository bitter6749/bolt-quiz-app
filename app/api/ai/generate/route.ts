import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkMonthlyLimit, recordUsage } from '@/lib/usage'
import { generateQuizFromPrompt } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check monthly limit
    const canGenerate = await checkMonthlyLimit(session.user.id)
    if (!canGenerate) {
      return NextResponse.json(
        { error: 'Monthly generation limit reached (10 per month)' },
        { status: 429 }
      )
    }

    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Generate quiz using Gemini
    const quizData = await generateQuizFromPrompt(prompt)

    // Record usage
    await recordUsage(session.user.id, 'GENERATE_QUIZ', prompt, 0.01)

    return NextResponse.json(quizData)
  } catch (error) {
    console.error('Error generating quiz:', error)
    return NextResponse.json(
      { error: 'Failed to generate quiz. Please try again.' },
      { status: 500 }
    )
  }
}