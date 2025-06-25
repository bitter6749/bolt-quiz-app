import { monthlyUsageDb, usageLogDb } from './db'

export async function checkMonthlyLimit(userId: string): Promise<boolean> {
  const currentMonth = new Date().toISOString().slice(0, 7)
  
  const usage = await monthlyUsageDb.findUnique({
    userId,
    monthYear: currentMonth
  })
  
  const MONTHLY_LIMIT = 10
  return (usage?.total_prompts || 0) < MONTHLY_LIMIT
}

export async function getCurrentUsage(userId: string): Promise<{ used: number; limit: number }> {
  const currentMonth = new Date().toISOString().slice(0, 7)
  
  const usage = await monthlyUsageDb.findUnique({
    userId,
    monthYear: currentMonth
  })
  
  return {
    used: usage?.total_prompts || 0,
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
    user_id: userId, 
    action, 
    prompt_text: promptText, 
    cost_estimate: costEstimate,
    month_year: currentMonth 
  })
  
  // Update monthly usage
  const existingUsage = await monthlyUsageDb.findUnique({ 
    userId, 
    monthYear: currentMonth 
  })
  
  await monthlyUsageDb.upsert(
    { 
      userId, 
      monthYear: currentMonth 
    },
    { 
      total_prompts: (existingUsage?.total_prompts || 0) + 1,
      total_cost: (existingUsage?.total_cost || 0) + (costEstimate || 0)
    },
    { 
      user_id: userId, 
      month_year: currentMonth, 
      total_prompts: 1,
      total_cost: costEstimate || 0
    }
  )
}