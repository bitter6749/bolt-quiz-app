'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'
import { QuizQuestion } from '@/lib/gemini'
import { useQuizStore } from '@/store/quiz'
import { toast } from 'sonner'

interface QuizPlayerProps {
  quiz: {
    id: string
    title: string
    description: string
    questions: QuizQuestion[]
  }
}

export function QuizPlayer({ quiz }: QuizPlayerProps) {
  const router = useRouter()
  const { 
    currentQuestionIndex, 
    answers, 
    setQuiz, 
    setCurrentQuestion, 
    setAnswer,
    startTimer
  } = useQuizStore()

  const [currentAnswer, setCurrentAnswer] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setQuiz(quiz)
    startTimer()
  }, [quiz, setQuiz, startTimer])

  useEffect(() => {
    // Load existing answer when question changes
    const existingAnswer = answers[currentQuestion.id]
    setCurrentAnswer(existingAnswer?.toString() || '')
  }, [currentQuestionIndex, answers])

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1
  const hasAnswer = currentAnswer.trim() !== ''

  const handleAnswerChange = (value: string) => {
    setCurrentAnswer(value)
  }

  const saveCurrentAnswer = () => {
    if (hasAnswer) {
      const answerValue = currentQuestion.type === 'multiple_choice' 
        ? parseInt(currentAnswer) 
        : currentAnswer.trim()
      setAnswer(currentQuestion.id, answerValue)
    }
  }

  const handleNext = () => {
    saveCurrentAnswer()
    if (isLastQuestion) {
      handleSubmit()
    } else {
      setCurrentQuestion(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    saveCurrentAnswer()
    setCurrentQuestion(currentQuestionIndex - 1)
  }

  const calculateScore = () => {
    let correct = 0
    quiz.questions.forEach((question) => {
      const userAnswer = answers[question.id]
      if (userAnswer !== undefined) {
        if (question.type === 'multiple_choice') {
          if (userAnswer === question.correct_answer) correct++
        } else {
          // For text questions, do a simple comparison (case-insensitive)
          const correctAnswer = question.correct_answer.toString().toLowerCase().trim()
          const userAnswerStr = userAnswer.toString().toLowerCase().trim()
          if (userAnswerStr === correctAnswer) correct++
        }
      }
    })
    return correct
  }

  const handleSubmit = async () => {
    saveCurrentAnswer()
    setIsSubmitting(true)

    try {
      const score = calculateScore()
      
      const response = await fetch(`/api/quiz/${quiz.id}/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          score,
          totalQuestions: quiz.questions.length,
        }),
      })

      if (response.ok) {
        router.push(`/quiz/${quiz.id}/result?score=${score}&total=${quiz.questions.length}`)
      } else {
        throw new Error('クイズの提出に失敗しました')
      }
    } catch (error) {
      console.error('Error submitting quiz:', error)
      toast.error('クイズの提出に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!currentQuestion) {
    return <div>読み込み中...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>問題 {currentQuestionIndex + 1} / {quiz.questions.length}</span>
          <span>{Math.round(progress)}% 完了</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              {currentQuestion.type === 'multiple_choice' ? '選択問題' : '記述問題'}
            </Badge>
            {answers[currentQuestion.id] !== undefined && (
              <Badge variant="secondary">
                <CheckCircle className="h-3 w-3 mr-1" />
                回答済み
              </Badge>
            )}
          </div>
          <CardTitle className="text-xl leading-relaxed">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentQuestion.type === 'multiple_choice' ? (
            <RadioGroup
              value={currentAnswer}
              onValueChange={handleAnswerChange}
            >
              {currentQuestion.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label 
                    htmlFor={`option-${index}`} 
                    className="flex-1 cursor-pointer py-2"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <Textarea
              placeholder="ここに回答を入力してください..."
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              rows={4}
            />
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              前へ
            </Button>

            <Button
              onClick={handleNext}
              disabled={!hasAnswer || isSubmitting}
            >
              {isLastQuestion ? (
                isSubmitting ? '提出中...' : 'クイズ提出'
              ) : (
                <>
                  次へ
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}