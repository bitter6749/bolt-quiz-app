'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

interface PromptFormProps {
  onGenerate: (quizData: any) => void
  disabled?: boolean
}

export function PromptForm({ onGenerate, disabled }: PromptFormProps) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!prompt.trim()) {
      toast.error('プロンプトを入力してください')
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'クイズの生成に失敗しました')
      }

      const quizData = await response.json()
      onGenerate(quizData)
      setPrompt('')
      toast.success('クイズが正常に生成されました！')
    } catch (error) {
      console.error('Error generating quiz:', error)
      toast.error(error instanceof Error ? error.message : 'クイズの生成に失敗しました')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AIクイズ生成
        </CardTitle>
        <CardDescription>
          クイズを作成したいトピックや科目について説明してください
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="例：高校生向けの光合成に関するクイズを作成してください、または開発者向けのReact hooksに関する問題を生成してください..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            disabled={disabled || isGenerating}
          />
          <Button 
            type="submit" 
            disabled={disabled || isGenerating || !prompt.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                クイズ生成中...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                クイズ生成
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}