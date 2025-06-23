import { create } from 'zustand'
import { QuizQuestion } from '@/lib/gemini'

interface QuizState {
  currentQuiz: {
    id: string
    title: string
    description: string
    questions: QuizQuestion[]
  } | null
  currentQuestionIndex: number
  answers: Record<number, string | number>
  timeStarted: Date | null
  
  // Actions
  setQuiz: (quiz: QuizState['currentQuiz']) => void
  setCurrentQuestion: (index: number) => void
  setAnswer: (questionId: number, answer: string | number) => void
  resetQuiz: () => void
  startTimer: () => void
}

export const useQuizStore = create<QuizState>((set) => ({
  currentQuiz: null,
  currentQuestionIndex: 0,
  answers: {},
  timeStarted: null,
  
  setQuiz: (quiz) => set({ currentQuiz: quiz, currentQuestionIndex: 0, answers: {}, timeStarted: null }),
  setCurrentQuestion: (index) => set({ currentQuestionIndex: index }),
  setAnswer: (questionId, answer) => 
    set((state) => ({ 
      answers: { ...state.answers, [questionId]: answer } 
    })),
  resetQuiz: () => set({ 
    currentQuiz: null, 
    currentQuestionIndex: 0, 
    answers: {}, 
    timeStarted: null 
  }),
  startTimer: () => set({ timeStarted: new Date() }),
}))