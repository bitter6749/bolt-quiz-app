import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkMonthlyLimit, recordUsage } from '@/lib/usage'
import { generateQuizFromPDF } from '@/lib/gemini'
import { extractTextFromPDF } from '@/lib/pdf'

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

    const formData = await request.formData()
    const file = formData.get('file') as File
    const customPrompt = formData.get('prompt') as string

    if (!file) {
      return NextResponse.json({ error: 'PDF file is required' }, { status: 400 })
    }

    // Convert file to buffer and extract text
    const buffer = Buffer.from(await file.arrayBuffer())
    const pdfText = await extractTextFromPDF(buffer)

    if (!pdfText.trim()) {
      return NextResponse.json({ error: 'Could not extract text from PDF' }, { status: 400 })
    }

    // Generate quiz from PDF content
    const quizData = await generateQuizFromPDF(pdfText, customPrompt)

    // Record usage
    await recordUsage(session.user.id, 'UPLOAD_PDF', `PDF: ${file.name}${customPrompt ? ` | Prompt: ${customPrompt}` : ''}`, 0.02)

    return NextResponse.json(quizData)
  } catch (error) {
    console.error('Error processing PDF:', error)
    return NextResponse.json(
      { error: 'Failed to process PDF. Please try again.' },
      { status: 500 }
    )
  }
}