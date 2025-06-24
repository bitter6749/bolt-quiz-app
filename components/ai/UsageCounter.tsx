'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Zap } from 'lucide-react'

interface UsageData {
  used: number
  limit: number
}

export function UsageCounter() {
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsage()
  }, [])

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/user/usage')
      if (response.ok) {
        const data = await response.json()
        setUsage(data)
      }
    } catch (error) {
      console.error('Error fetching usage:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-16 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    )
  }

  if (!usage) return null

  const percentage = (usage.used / usage.limit) * 100
  const remaining = usage.limit - usage.used

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Zap className="h-4 w-4" />
          月間AI使用量
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>使用済み: {usage.used}/{usage.limit}</span>
            <span className={remaining === 0 ? 'text-destructive font-medium' : 'text-muted-foreground'}>
              残り {remaining}回
            </span>
          </div>
          <Progress 
            value={percentage} 
            className="h-2"
          />
          {remaining === 0 && (
            <p className="text-xs text-destructive">
              月間制限に達しました。来月にリセットされます。
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}