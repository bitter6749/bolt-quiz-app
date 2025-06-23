import { prisma } from './prisma'

export async function checkMonthlyLimit(userId: string): Promise<boolean> {
  const currentMonth = new Date().toISOString().slice(0, 7)
  
  const usage = await prisma.monthlyUsage.findUnique({
    where: { 
      userId_monthYear: { 
        userId, 
        monthYear: currentMonth 
      } 
    }
  })
  
  const MONTHLY_LIMIT = 10
  return (usage?.totalPrompts || 0) < MONTHLY_LIMIT
}

export async function getCurrentUsage(userId: string): Promise<{ used: number; limit: number }> {
  const currentMonth = new Date().toISOString().slice(0, 7)
  
  const usage = await prisma.monthlyUsage.findUnique({
    where: { 
      userId_monthYear: { 
        userId, 
        monthYear: currentMonth 
      } 
    }
  })
  
  return {
    used: usage?.totalPrompts || 0,
    limit: 10,
  }
}

export async function recordUsage(
  userId: string, 
  action: string, 
  promptText?: string,
  costEstimate?: number
) {
  const currentMonth = new Date().toISOString().slice(0, 7)
  
  // Create usage log
  await prisma.usageLog.create({
    data: { 
      userId, 
      action, 
      promptText, 
      costEstimate,
      monthYear: currentMonth 
    }
  })
  
  // Update monthly usage
  await prisma.monthlyUsage.upsert({
    where: { 
      userId_monthYear: { 
        userId, 
        monthYear: currentMonth 
      } 
    },
    update: { 
      totalPrompts: { increment: 1 },
      totalCost: { increment: costEstimate || 0 }
    },
    create: { 
      userId, 
      monthYear: currentMonth, 
      totalPrompts: 1,
      totalCost: costEstimate || 0
    }
  })
}