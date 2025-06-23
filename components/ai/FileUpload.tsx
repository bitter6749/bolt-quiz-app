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
      toast.success('PDF file selected')
    } else {
      toast.error('Please select a PDF file')
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
      toast.error('Please select a PDF file')
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
        throw new Error(errorData.error || 'Failed to generate quiz from PDF')
      }

      const quizData = await response.json()
      onGenerate(quizData)
      setFile(null)
      setPrompt('')
      toast.success('Quiz generated from PDF successfully!')
    } catch (error) {
      console.error('Error generating quiz from PDF:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate quiz from PDF')
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
          Generate from PDF
        </CardTitle>
        <CardDescription>
          Upload a PDF document and optionally specify what to focus on
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
                <p>Drop the PDF file here...</p>
              ) : (
                <div>
                  <p className="text-sm font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">PDF files only</p>
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
            placeholder="Optional: Specify what aspects to focus on (e.g., 'Focus on key concepts and definitions')"
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
                Processing PDF...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Generate from PDF
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}