'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Trophy, RotateCcw, Home, CheckCircle, XCircle, BookOpen } from 'lucide-react'
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
    if (percentage >= 90) return { label: '素晴らしい！', variant: 'default' as const }
    if (percentage >= 80) return { label: '良い！', variant: 'secondary' as const }
    if (percentage >= 70) return { label: '普通', variant: 'secondary' as const }
    if (percentage >= 60) return { label: '合格', variant: 'outline' as const }
    return { label: '要改善', variant: 'destructive' as const }
  }

  const scoreBadge = getScoreBadge(percentage)

  const handleRetake = () => {
    resetQuiz()
    router.push(`/quiz/${params.id}`)
  }

  const getAnswerDisplay = (question: any, userAnswer: any) => {
    if (question.type === 'multiple_choice') {
      return question.options?.[userAnswer] || '未回答'
    }
    return userAnswer?.toString() || '未回答'
  }

  const getCorrectAnswerDisplay = (question: any) => {
    if (question.type === 'multiple_choice') {
      return question.options?.[question.correct_answer] || '不明'
    }
    return question.correct_answer?.toString() || '不明'
  }

  const isAnswerCorrect = (question: any, userAnswer: any) => {
    if (userAnswer === undefined || userAnswer === null) return false
    
    if (question.type === 'multiple_choice') {
      return userAnswer === question.correct_answer
    } else {
      const correctAnswer = question.correct_answer.toString().toLowerCase().trim()
      const userAnswerStr = userAnswer.toString().toLowerCase().trim()
      return userAnswerStr === correctAnswer
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Results Summary Card */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Trophy className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">クイズ完了！</CardTitle>
            <CardDescription>あなたの結果</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className={`text-4xl font-bold ${getScoreColor(percentage)}`}>
                {score}/{total}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>スコア</span>
                  <span>{percentage}%</span>
                </div>
                <Progress value={percentage} className="h-3" />
              </div>
              <Badge variant={scoreBadge.variant} className="text-sm">
                {scoreBadge.label}
              </Badge>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleRetake} variant="outline" className="flex-1">
                <RotateCcw className="mr-2 h-4 w-4" />
                再挑戦
              </Button>
              <Button asChild className="flex-1">
                <Link href="/dashboard">
                  <Home className="mr-2 h-4 w-4" />
                  ダッシュボード
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Answer Review */}
        {currentQuiz && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                解答詳細
              </CardTitle>
              <CardDescription>
                各問題の詳細な解答と解説
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentQuiz.questions.map((question, index) => {
                const userAnswer = answers[question.id]
                const isCorrect = isAnswerCorrect(question, userAnswer)
                
                return (
                  <div key={question.id} className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold">
                        問題 {index + 1}
                      </h3>
                      <Badge variant={isCorrect ? 'default' : 'destructive'}>
                        {isCorrect ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            正解
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            不正解
                          </>
                        )}
                      </Badge>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="font-medium mb-3">{question.question}</p>
                      
                      <div className="grid gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">あなたの回答:</span>
                          <span className={isCorrect ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                            {getAnswerDisplay(question, userAnswer)}
                          </span>
                        </div>
                        
                        {!isCorrect && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">正解:</span>
                            <span className="text-green-600 font-medium">
                              {getCorrectAnswerDisplay(question)}
                            </span>
                          </div>
                        )}
                        
                        {question.explanation && (
                          <div className="pt-2 border-t border-border/50">
                            <span className="text-muted-foreground text-xs">解説:</span>
                            <p className="mt-1 text-sm leading-relaxed">
                              {question.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {index < currentQuiz.questions.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}