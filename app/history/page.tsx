'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Trophy, Target } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface QuizAttempt {
  id: string
  score: number
  totalQuestions: number
  completedAt: string
  quizSet: {
    title: string
    description: string
  }
}

export default function HistoryPage() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // This would be implemented with a proper API endpoint
    // For now, showing the structure
    setLoading(false)
  }, [])

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">クイズ履歴</h1>
          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded" />
                    <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">クイズ履歴</h1>
          <p className="text-muted-foreground">過去のクイズ挑戦と進捗を確認</p>
        </div>

        {attempts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">まだクイズに挑戦していません。</p>
              <p className="text-sm text-muted-foreground mt-1">
                最初のクイズに挑戦して、ここで進捗を確認しましょう！
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {attempts.map((attempt) => {
              const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100)
              
              return (
                <Card key={attempt.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{attempt.quizSet.title}</CardTitle>
                        {attempt.quizSet.description && (
                          <CardDescription>{attempt.quizSet.description}</CardDescription>
                        )}
                      </div>
                      <Badge className={getScoreColor(percentage)}>
                        {attempt.score}/{attempt.totalQuestions} ({percentage}%)
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDistanceToNow(new Date(attempt.completedAt), { addSuffix: true, locale: ja })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {attempt.totalQuestions}問
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}