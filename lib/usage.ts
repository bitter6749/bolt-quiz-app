import { monthlyUsageDb, usageLogDb } from './db'

export async function checkMonthlyLimit(userId: string): Promise<boolean> {
  const currentMonth = new Date().toISOString().slice(0, 7)
  
  const usage = await monthlyUsageDb.findUnique({
    userId,
    monthYear: currentMonth
  })
  
  const MONTHLY_LIMIT = 10
  return (usage?.totalPrompts || 0) < MONTHLY_LIMIT
}

export async function getCurrentUsage(userId: string): Promise<{ used: number; limit: number }> {
  const currentMonth = new Date().toISOString().slice(0, 7)
  
  const usage = await monthlyUsageDb.findUnique({
    userId,
    monthYear: currentMonth
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
  await usageLogDb.create({ 
    userId, 
    action, 
    promptText, 
    costEstimate,
    monthYear: currentMonth 
  })
  
  // Update monthly usage
  await monthlyUsageDb.upsert(
    { 
      userId, 
      monthYear: currentMonth 
    },
    { 
      totalPrompts: (await monthlyUsageDb.findUnique({ userId, monthYear: currentMonth }))?.totalPrompts + 1 || 1,
      totalCost: ((await monthlyUsageDb.findUnique({ userId, monthYear: currentMonth }))?.totalCost || 0) + (costEstimate || 0)
    },
    { 
      userId, 
      monthYear: currentMonth, 
      totalPrompts: 1,
      totalCost: costEstimate || 0
    }
  )
}