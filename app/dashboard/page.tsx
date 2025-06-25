'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PromptForm } from '@/components/ai/PromptForm'
import { FileUpload } from '@/components/ai/FileUpload'
import { UsageCounter } from '@/components/ai/UsageCounter'
import { QuizList } from '@/components/quiz/QuizList'
import { Sparkles, Upload, Plus, Download } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function Dashboard() {
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null)
  const router = useRouter()

  const handleQuizGenerated = (quizData: any) => {
    setGeneratedQuiz(quizData)
    setIsGenerateDialogOpen(false)
  }

  const handleSaveQuiz = async () => {
    if (!generatedQuiz) return

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: generatedQuiz.title,
          description: generatedQuiz.description,
          questions: generatedQuiz.questions,
        }),
      })

      if (response.ok) {
        const savedQuiz = await response.json()
        toast.success('クイズが正常に保存されました！')
        setGeneratedQuiz(null)
        router.push(`/quiz/${savedQuiz.id}`)
      } else {
        throw new Error('クイズの保存に失敗しました')
      }
    } catch (error) {
      console.error('Error saving quiz:', error)
      toast.error('クイズの保存に失敗しました')
    }
  }

  const handleExportQuiz = () => {
    if (!generatedQuiz) return

    const dataStr = JSON.stringify(generatedQuiz, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `${generatedQuiz.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    toast.success('クイズが正常にエクスポートされました！')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">ダッシュボード</h1>
            <p className="text-muted-foreground">AI生成クイズの作成と管理</p>
          </div>
          
          <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                クイズ生成
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>新しいクイズを生成</DialogTitle>
                <DialogDescription>
                  クイズの作成方法を選択してください
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="prompt" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="prompt">
                    <Sparkles className="mr-2 h-4 w-4" />
                    プロンプトから
                  </TabsTrigger>
                  <TabsTrigger value="pdf">
                    <Upload className="mr-2 h-4 w-4" />
                    PDFから
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="prompt">
                  <PromptForm onGenerate={handleQuizGenerated} />
                </TabsContent>
                
                <TabsContent value="pdf">
                  <FileUpload onGenerate={handleQuizGenerated} />
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>

        {/* Usage Counter */}
        <UsageCounter />

        {/* Generated Quiz Preview */}
        {generatedQuiz && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{generatedQuiz.title}</CardTitle>
                  <CardDescription>{generatedQuiz.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportQuiz}>
                    <Download className="mr-2 h-4 w-4" />
                    JSON出力
                  </Button>
                  <Button onClick={handleSaveQuiz}>
                    保存してクイズ開始
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {generatedQuiz.questions.length}問の問題を生成しました。
                このクイズを保存して開始するか、JSONファイルとしてエクスポートできます。
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quizzes */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">あなたのクイズ</h2>
          <QuizList />
        </div>
      </div>
    </div>
  )
}