import fs from 'fs/promises'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DB_PATH, 'users.json')
const QUIZ_SETS_FILE = path.join(DB_PATH, 'quiz-sets.json')
const QUIZ_ATTEMPTS_FILE = path.join(DB_PATH, 'quiz-attempts.json')
const USAGE_LOGS_FILE = path.join(DB_PATH, 'usage-logs.json')
const MONTHLY_USAGE_FILE = path.join(DB_PATH, 'monthly-usage.json')
const ACCOUNTS_FILE = path.join(DB_PATH, 'accounts.json')
const SESSIONS_FILE = path.join(DB_PATH, 'sessions.json')

export interface User {
  id: string
  email: string
  name?: string
  image?: string
  role: 'USER' | 'ADMIN'
  createdAt: string
  updatedAt: string
}

export interface Account {
  id: string
  userId: string
  type: string
  provider: string
  providerAccountId: string
  refresh_token?: string
  access_token?: string
  expires_at?: number
  token_type?: string
  scope?: string
  id_token?: string
  session_state?: string
}

export interface Session {
  id: string
  sessionToken: string
  userId: string
  expires: string
}

export interface QuizSet {
  id: string
  title: string
  description?: string
  questions: string // JSON string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface QuizAttempt {
  id: string
  userId: string
  quizSetId: string
  answers: string // JSON string
  score: number
  totalQuestions: number
  completedAt: string
}

export interface UsageLog {
  id: string
  userId: string
  action: string
  promptText?: string
  costEstimate?: number
  createdAt: string
  monthYear: string
}

export interface MonthlyUsage {
  id: string
  userId: string
  monthYear: string
  totalPrompts: number
  totalCost: number
  lastUpdated: string
}

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DB_PATH)
  } catch {
    await fs.mkdir(DB_PATH, { recursive: true })
  }
}

// Generic file operations
async function readJsonFile<T>(filePath: string): Promise<T[]> {
  try {
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function writeJsonFile<T>(filePath: string, data: T[]): Promise<void> {
  await ensureDataDir()
  await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// User operations
export const userDb = {
  async findUnique(where: { id?: string; email?: string }): Promise<User | null> {
    const users = await readJsonFile<User>(USERS_FILE)
    return users.find(user => 
      (where.id && user.id === where.id) || 
      (where.email && user.email === where.email)
    ) || null
  },

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const users = await readJsonFile<User>(USERS_FILE)
    const newUser: User = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    users.push(newUser)
    await writeJsonFile(USERS_FILE, users)
    return newUser
  },

  async update(id: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
    const users = await readJsonFile<User>(USERS_FILE)
    const index = users.findIndex(user => user.id === id)
    if (index === -1) return null
    
    users[index] = {
      ...users[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    await writeJsonFile(USERS_FILE, users)
    return users[index]
  }
}

// Account operations
export const accountDb = {
  async create(data: Omit<Account, 'id'>): Promise<Account> {
    const accounts = await readJsonFile<Account>(ACCOUNTS_FILE)
    const newAccount: Account = {
      ...data,
      id: generateId(),
    }
    accounts.push(newAccount)
    await writeJsonFile(ACCOUNTS_FILE, accounts)
    return newAccount
  },

  async findFirst(where: { userId: string; provider: string }): Promise<Account | null> {
    const accounts = await readJsonFile<Account>(ACCOUNTS_FILE)
    return accounts.find(account => 
      account.userId === where.userId && account.provider === where.provider
    ) || null
  }
}

// Session operations
export const sessionDb = {
  async create(data: Omit<Session, 'id'>): Promise<Session> {
    const sessions = await readJsonFile<Session>(SESSIONS_FILE)
    const newSession: Session = {
      ...data,
      id: generateId(),
    }
    sessions.push(newSession)
    await writeJsonFile(SESSIONS_FILE, sessions)
    return newSession
  },

  async findUnique(where: { sessionToken: string }): Promise<Session | null> {
    const sessions = await readJsonFile<Session>(SESSIONS_FILE)
    return sessions.find(session => session.sessionToken === where.sessionToken) || null
  },

  async update(sessionToken: string, data: Partial<Session>): Promise<Session | null> {
    const sessions = await readJsonFile<Session>(SESSIONS_FILE)
    const index = sessions.findIndex(session => session.sessionToken === sessionToken)
    if (index === -1) return null
    
    sessions[index] = { ...sessions[index], ...data }
    await writeJsonFile(SESSIONS_FILE, sessions)
    return sessions[index]
  },

  async delete(where: { sessionToken: string }): Promise<void> {
    const sessions = await readJsonFile<Session>(SESSIONS_FILE)
    const filtered = sessions.filter(session => session.sessionToken !== where.sessionToken)
    await writeJsonFile(SESSIONS_FILE, filtered)
  }
}

// QuizSet operations
export const quizSetDb = {
  async findMany(where?: { createdBy?: string }): Promise<QuizSet[]> {
    const quizSets = await readJsonFile<QuizSet>(QUIZ_SETS_FILE)
    if (where?.createdBy) {
      return quizSets.filter(quiz => quiz.createdBy === where.createdBy)
    }
    return quizSets
  },

  async findUnique(where: { id: string }): Promise<QuizSet | null> {
    const quizSets = await readJsonFile<QuizSet>(QUIZ_SETS_FILE)
    return quizSets.find(quiz => quiz.id === where.id) || null
  },

  async create(data: Omit<QuizSet, 'id' | 'createdAt' | 'updatedAt'>): Promise<QuizSet> {
    const quizSets = await readJsonFile<QuizSet>(QUIZ_SETS_FILE)
    const newQuizSet: QuizSet = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    quizSets.push(newQuizSet)
    await writeJsonFile(QUIZ_SETS_FILE, quizSets)
    return newQuizSet
  },

  async delete(where: { id: string }): Promise<void> {
    const quizSets = await readJsonFile<QuizSet>(QUIZ_SETS_FILE)
    const filtered = quizSets.filter(quiz => quiz.id !== where.id)
    await writeJsonFile(QUIZ_SETS_FILE, filtered)
  }
}

// QuizAttempt operations
export const quizAttemptDb = {
  async create(data: Omit<QuizAttempt, 'id' | 'completedAt'>): Promise<QuizAttempt> {
    const attempts = await readJsonFile<QuizAttempt>(QUIZ_ATTEMPTS_FILE)
    const newAttempt: QuizAttempt = {
      ...data,
      id: generateId(),
      completedAt: new Date().toISOString(),
    }
    attempts.push(newAttempt)
    await writeJsonFile(QUIZ_ATTEMPTS_FILE, attempts)
    return newAttempt
  },

  async count(where: { quizSetId: string }): Promise<number> {
    const attempts = await readJsonFile<QuizAttempt>(QUIZ_ATTEMPTS_FILE)
    return attempts.filter(attempt => attempt.quizSetId === where.quizSetId).length
  }
}

// MonthlyUsage operations
export const monthlyUsageDb = {
  async findUnique(where: { userId: string; monthYear: string }): Promise<MonthlyUsage | null> {
    const usage = await readJsonFile<MonthlyUsage>(MONTHLY_USAGE_FILE)
    return usage.find(u => u.userId === where.userId && u.monthYear === where.monthYear) || null
  },

  async create(data: Omit<MonthlyUsage, 'id' | 'lastUpdated'>): Promise<MonthlyUsage> {
    const usage = await readJsonFile<MonthlyUsage>(MONTHLY_USAGE_FILE)
    const newUsage: MonthlyUsage = {
      ...data,
      id: generateId(),
      lastUpdated: new Date().toISOString(),
    }
    usage.push(newUsage)
    await writeJsonFile(MONTHLY_USAGE_FILE, usage)
    return newUsage
  },

  async upsert(where: { userId: string; monthYear: string }, update: Partial<MonthlyUsage>, create: Omit<MonthlyUsage, 'id' | 'lastUpdated'>): Promise<MonthlyUsage> {
    const usage = await readJsonFile<MonthlyUsage>(MONTHLY_USAGE_FILE)
    const index = usage.findIndex(u => u.userId === where.userId && u.monthYear === where.monthYear)
    
    if (index !== -1) {
      usage[index] = {
        ...usage[index],
        ...update,
        lastUpdated: new Date().toISOString(),
      }
      await writeJsonFile(MONTHLY_USAGE_FILE, usage)
      return usage[index]
    } else {
      const newUsage: MonthlyUsage = {
        ...create,
        id: generateId(),
        lastUpdated: new Date().toISOString(),
      }
      usage.push(newUsage)
      await writeJsonFile(MONTHLY_USAGE_FILE, usage)
      return newUsage
    }
  }
}

// UsageLog operations
export const usageLogDb = {
  async create(data: Omit<UsageLog, 'id' | 'createdAt'>): Promise<UsageLog> {
    const logs = await readJsonFile<UsageLog>(USAGE_LOGS_FILE)
    const newLog: UsageLog = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    logs.push(newLog)
    await writeJsonFile(USAGE_LOGS_FILE, logs)
    return newLog
  }
}