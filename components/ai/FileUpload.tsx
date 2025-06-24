'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileText, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

interface FileUploadProps {
  onGenerate: (quizData: any) => void
  disabled?: boolean
}

export function FileUpload({ onGenerate, disabled }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const pdfFile = acceptedFiles[0]
    if (pdfFile && pdfFile.type === 'application/pdf') {
      setFile(pdfFile)
      toast.success('PDFファイルが選択されました')
    } else {
      toast.error('PDFファイルを選択してください')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: disabled || isGenerating
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      toast.error('PDFファイルを選択してください')
      return
    }

    setIsGenerating(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (prompt.trim()) {
        formData.append('prompt', prompt)
      }

      const response = await fetch('/api/ai/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'PDFからのクイズ生成に失敗しました')
      }

      const quizData = await response.json()
      onGenerate(quizData)
      setFile(null)
      setPrompt('')
      toast.success('PDFからクイズが正常に生成されました！')
    } catch (error) {
      console.error('Error generating quiz from PDF:', error)
      toast.error(error instanceof Error ? error.message : 'PDFからのクイズ生成に失敗しました')
    } finally {
      setIsGenerating(false)
    }
  }

  const removeFile = () => {
    setFile(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          PDFからクイズ生成
        </CardTitle>
        <CardDescription>
          PDFドキュメントをアップロードし、オプションで焦点を当てる内容を指定してください
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!file ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5'
              } ${disabled || isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              {isDragActive ? (
                <p>PDFファイルをここにドロップしてください...</p>
              ) : (
                <div>
                  <p className="text-sm font-medium">クリックしてアップロードまたはドラッグ&ドロップ</p>
                  <p className="text-xs text-muted-foreground">PDFファイルのみ</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">{file.name}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeFile}
                disabled={isGenerating}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <Textarea
            placeholder="オプション：焦点を当てる内容を指定してください（例：「重要な概念と定義に焦点を当てる」）"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={2}
            disabled={disabled || isGenerating}
          />
          
          <Button 
            type="submit" 
            disabled={disabled || isGenerating || !file}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                PDF処理中...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                PDFからクイズ生成
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}