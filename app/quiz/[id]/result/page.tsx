'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Trophy, RotateCcw, Home, CheckCircle, XCircle } from 'lucide-react'
import { useQuizStore } from '@/store/quiz'

interface PageProps {
  params: { id: string }
}

export default function ResultPage({ params }: PageProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { currentQuiz, answers, resetQuiz } = useQuizStore()
  
  const score = parseInt(searchParams.get('score') || '0')
  const total = parseInt(searchParams.get('total') || '0')
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0

  useEffect(() => {
    // Clear quiz state when leaving results
    return () => {
      resetQuiz()
    }
  }, [resetQuiz])

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (percentage: number) => {
    if (percentage >= 90) return { label: 'Excellent!', variant: 'default' as const }
    if (percentage >= 80) return { label: 'Great!', variant: 'secondary' as const }
    if (percentage >= 70) return { label: 'Good', variant: 'secondary' as const }
    if (percentage >= 60) return { label: 'Fair', variant: 'outline' as const }
    return { label: 'Need Improvement', variant: 'destructive' as const }
  }

  const scoreBadge = getScoreBadge(percentage)

  const handleRetake = () => {
    resetQuiz()
    router.push(`/quiz/${params.id}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Results Card */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Trophy className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
            <CardDescription>Here are your results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className={`text-4xl font-bold ${getScoreColor(percentage)}`}>
                {score}/{total}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Your Score</span>
                  <span>{percentage}%</span>
                </div>
                <Progress value={percentage} className="h-3" />
              </div>
              <Badge variant={scoreBadge.variant} className="text-sm">
                {scoreBadge.label}
              </Badge>
            </div>

            {/* Answer Breakdown */}
            {currentQuiz && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Answer Breakdown</h3>
                <div className="space-y-2">
                  {currentQuiz.questions.map((question, index) => {
                    const userAnswer = answers[question.id]
                    const isCorrect = userAnswer === question.correct_answer
                    
                    return (
                      <div key={question.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <span className="text-sm">Question {index + 1}</span>
                        <div className="flex items-center gap-2">
                          {isCorrect ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className={`text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button onClick={handleRetake} variant="outline" className="flex-1">
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake Quiz
              </Button>
              <Button asChild className="flex-1">
                <Link href="/dashboard">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}