import { notFound } from 'next/navigation'
import { quizSetDb } from '@/lib/db'
import { QuizPlayer } from '@/components/quiz/QuizPlayer'

interface PageProps {
  params: { id: string }
}

export default async function QuizPage({ params }: PageProps) {
  const quiz = await quizSetDb.findUnique({ id: params.id })

  if (!quiz) {
    notFound()
  }

  const questions = JSON.parse(quiz.questions)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{quiz.title}</h1>
        {quiz.description && (
          <p className="text-muted-foreground mt-2">{quiz.description}</p>
        )}
      </div>
      
      <QuizPlayer 
        quiz={{
          id: quiz.id,
          title: quiz.title,
          description: quiz.description || '',
          questions
        }} 
      />
    </div>
  )
}