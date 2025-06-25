import { supabase, createServerSupabaseClient } from './supabase'

export interface User {
  id: string
  email: string
  name?: string
  image?: string
  role: 'USER' | 'ADMIN'
  created_at: string
  updated_at: string
}

export interface QuizSet {
  id: string
  title: string
  description?: string
  questions: any // JSON data
  created_by: string
  created_at: string
  updated_at: string
}

export interface QuizAttempt {
  id: string
  user_id: string
  quiz_set_id: string
  answers: any // JSON data
  score: number
  total_questions: number
  completed_at: string
}

export interface MonthlyUsage {
  id: string
  user_id: string
  month_year: string
  total_prompts: number
  total_cost: number
  last_updated: string
}

export interface UsageLog {
  id: string
  user_id: string
  action: string
  prompt_text?: string
  cost_estimate?: number
  created_at: string
  month_year: string
}

// User operations
export const userDb = {
  async findUnique(where: { id?: string; email?: string }): Promise<User | null> {
    const client = createServerSupabaseClient()
    let query = client.from('users').select('*')
    
    if (where.id) {
      query = query.eq('id', where.id)
    } else if (where.email) {
      query = query.eq('email', where.email)
    }
    
    const { data, error } = await query.single()
    if (error) return null
    return data
  },

  async create(data: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const client = createServerSupabaseClient()
    const { data: user, error } = await client
      .from('users')
      .insert([data])
      .select()
      .single()
    
    if (error) throw error
    return user
  },

  async update(id: string, data: Partial<Omit<User, 'id' | 'created_at'>>): Promise<User | null> {
    const client = createServerSupabaseClient()
    const { data: user, error } = await client
      .from('users')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) return null
    return user
  }
}

// QuizSet operations
export const quizSetDb = {
  async findMany(where?: { createdBy?: string }): Promise<QuizSet[]> {
    const client = createServerSupabaseClient()
    let query = client.from('quiz_sets').select('*').order('created_at', { ascending: false })
    
    if (where?.createdBy) {
      query = query.eq('created_by', where.createdBy)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async findUnique(where: { id: string }): Promise<QuizSet | null> {
    const client = createServerSupabaseClient()
    const { data, error } = await client
      .from('quiz_sets')
      .select('*')
      .eq('id', where.id)
      .single()
    
    if (error) return null
    return data
  },

  async create(data: Omit<QuizSet, 'id' | 'created_at' | 'updated_at'>): Promise<QuizSet> {
    const client = createServerSupabaseClient()
    const { data: quizSet, error } = await client
      .from('quiz_sets')
      .insert([data])
      .select()
      .single()
    
    if (error) throw error
    return quizSet
  },

  async delete(where: { id: string }): Promise<void> {
    const client = createServerSupabaseClient()
    const { error } = await client
      .from('quiz_sets')
      .delete()
      .eq('id', where.id)
    
    if (error) throw error
  }
}

// QuizAttempt operations
export const quizAttemptDb = {
  async create(data: Omit<QuizAttempt, 'id' | 'completed_at'>): Promise<QuizAttempt> {
    const client = createServerSupabaseClient()
    const { data: attempt, error } = await client
      .from('quiz_attempts')
      .insert([{ ...data, completed_at: new Date().toISOString() }])
      .select()
      .single()
    
    if (error) throw error
    return attempt
  },

  async count(where: { quizSetId: string }): Promise<number> {
    const client = createServerSupabaseClient()
    const { count, error } = await client
      .from('quiz_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('quiz_set_id', where.quizSetId)
    
    if (error) throw error
    return count || 0
  },

  async findMany(where: { userId: string }): Promise<(QuizAttempt & { quiz_set: QuizSet })[]> {
    const client = createServerSupabaseClient()
    const { data, error } = await client
      .from('quiz_attempts')
      .select(`
        *,
        quiz_set:quiz_sets(*)
      `)
      .eq('user_id', where.userId)
      .order('completed_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }
}

// MonthlyUsage operations
export const monthlyUsageDb = {
  async findUnique(where: { userId: string; monthYear: string }): Promise<MonthlyUsage | null> {
    const client = createServerSupabaseClient()
    const { data, error } = await client
      .from('monthly_usage')
      .select('*')
      .eq('user_id', where.userId)
      .eq('month_year', where.monthYear)
      .single()
    
    if (error) return null
    return data
  },

  async create(data: Omit<MonthlyUsage, 'id' | 'last_updated'>): Promise<MonthlyUsage> {
    const client = createServerSupabaseClient()
    const { data: usage, error } = await client
      .from('monthly_usage')
      .insert([{ ...data, last_updated: new Date().toISOString() }])
      .select()
      .single()
    
    if (error) throw error
    return usage
  },

  async upsert(where: { userId: string; monthYear: string }, update: Partial<MonthlyUsage>, create: Omit<MonthlyUsage, 'id' | 'last_updated'>): Promise<MonthlyUsage> {
    const client = createServerSupabaseClient()
    const { data: usage, error } = await client
      .from('monthly_usage')
      .upsert([{
        user_id: where.userId,
        month_year: where.monthYear,
        ...update,
        ...create,
        last_updated: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) throw error
    return usage
  }
}

// UsageLog operations
export const usageLogDb = {
  async create(data: Omit<UsageLog, 'id' | 'created_at'>): Promise<UsageLog> {
    const client = createServerSupabaseClient()
    const { data: log, error } = await client
      .from('usage_logs')
      .insert([{ ...data, created_at: new Date().toISOString() }])
      .select()
      .single()
    
    if (error) throw error
    return log
  }
}