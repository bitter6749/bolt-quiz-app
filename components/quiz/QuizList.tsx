'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Trash2, Calendar, Users } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface Quiz {
  id: string
  title: string
  description: string
  createdAt: string
  _count: {
    attempts: number
  }
}

export function QuizList() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('/api/quiz')
      if (response.ok) {
        const data = await response.json()
        setQuizzes(data)
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error)
      toast.error('クイズの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('このクイズを削除してもよろしいですか？')) return

    try {
      const response = await fetch(`/api/quiz/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setQuizzes(quizzes.filter(quiz => quiz.id !== id))
        toast.success('クイズが正常に削除されました')
      } else {
        throw new Error('クイズの削除に失敗しました')
      }
    } catch (error) {
      console.error('Error deleting quiz:', error)
      toast.error('クイズの削除に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                <div className="h-8 bg-muted animate-pulse rounded mt-4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (quizzes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">まだクイズが作成されていません。</p>
          <p className="text-sm text-muted-foreground mt-1">
            AI生成機能を使って最初のクイズを作成しましょう！
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {quizzes.map((quiz) => (
        <Card key={quiz.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="space-y-1 flex-1">
                <CardTitle className="text-lg leading-tight">
                  {quiz.title}
                </CardTitle>
                {quiz.description && (
                  <CardDescription className="line-clamp-2">
                    {quiz.description}
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDistanceToNow(new Date(quiz.createdAt), { addSuffix: true, locale: ja })}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {quiz._count.attempts}回挑戦
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button asChild size="sm" className="flex-1">
                <Link href={`/quiz/${quiz.id}`}>
                  <Play className="h-3 w-3 mr-1" />
                  クイズ開始
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(quiz.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}