'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Sparkles, Upload, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p>読み込み中...</p>
        </div>
      </div>
    )
  }

  if (session) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 mb-16">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-primary/10">
              <GraduationCap className="h-12 w-12 text-primary" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              <span className="text-primary">AI生成クイズ</span>で
              スマートに学習
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              あらゆるトピックやPDFドキュメントをインタラクティブなクイズに変換。
              学生、教育者、専門家に最適です。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/login">始める</Link>
            </Button>
            <Button variant="outline" size="lg">
              詳細を見る
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <Sparkles className="h-10 w-10 text-primary mb-2" />
              <CardTitle>AI駆動生成</CardTitle>
              <CardDescription>
                高度なAIを使用して、あらゆるトピックからクイズを作成。学習したい内容を説明するだけです。
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Upload className="h-10 w-10 text-primary mb-2" />
              <CardTitle>PDFからクイズ</CardTitle>
              <CardDescription>
                任意のPDFドキュメントをアップロードして、関連するクイズ問題を自動生成します。
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>進捗追跡</CardTitle>
              <CardDescription>
                詳細な分析とパフォーマンス追跡で学習の進捗を監視します。
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">始める準備はできましたか？</h2>
          <p className="text-muted-foreground">
            Googleでサインインして、最初のAI生成クイズの作成を開始しましょう。
          </p>
          <Button asChild size="lg">
            <Link href="/login">サインイン</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}