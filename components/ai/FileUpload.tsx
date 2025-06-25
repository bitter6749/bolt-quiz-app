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
  const [isGenerating, setIsGenerating] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const jsonFile = acceptedFiles[0]
    if (jsonFile && jsonFile.type === 'application/json') {
      setFile(jsonFile)
      toast.success('JSONファイルが選択されました')
    } else {
      toast.error('JSONファイルを選択してください')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    },
    multiple: false,
    disabled: disabled || isGenerating
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      toast.error('JSONファイルを選択してください')
      return
    }

    setIsGenerating(true)

    try {
      const text = await file.text()
      const quizData = JSON.parse(text)
      
      // Validate quiz structure
      if (!quizData.title || !quizData.questions || !Array.isArray(quizData.questions)) {
        throw new Error('無効なクイズデータ形式です')
      }

      onGenerate(quizData)
      setFile(null)
      toast.success('JSONからクイズが正常に読み込まれました！')
    } catch (error) {
      console.error('Error loading quiz from JSON:', error)
      toast.error(error instanceof Error ? error.message : 'JSONからのクイズ読み込みに失敗しました')
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
          JSONからクイズ読み込み
        </CardTitle>
        <CardDescription>
          クイズデータが含まれたJSONファイルをアップロードしてください
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
                <p>JSONファイルをここにドロップしてください...</p>
              ) : (
                <div>
                  <p className="text-sm font-medium">クリックしてアップロードまたはドラッグ&ドロップ</p>
                  <p className="text-xs text-muted-foreground">JSONファイルのみ</p>
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
          
          <Button 
            type="submit" 
            disabled={disabled || isGenerating || !file}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                JSON処理中...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                JSONからクイズ読み込み
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}