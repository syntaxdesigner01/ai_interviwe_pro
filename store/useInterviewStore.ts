'use client'
import { create } from 'zustand'
import axios from 'axios'
import { JOB_TITLES } from '@/lib/jobTitles'

type Question = { topic: string; question: string; code?: string; language?: string }

type InterviewStore = {
  jobTitle: string
  allQuestions: Question[]
  questions: Question[]
  questionPage: number
  loading: boolean
  error: string | null
  setJobTitle: (title: string) => void
  fetchQuestions: () => Promise<void>
  regenerate: () => Promise<void>
  reset: () => void
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const useInterviewStore = create<InterviewStore>((set, get) => ({
  jobTitle: '',
  allQuestions: [],
  questions: [],
  questionPage: 0,
  loading: false,
  error: null,
  setJobTitle: (title) => set({ jobTitle: title }),
  fetchQuestions: async () => {
    const { jobTitle } = get()
    const trimmed = jobTitle.trim()
    const isAbbreviation = /^[A-Z]{2,5}$/.test(trimmed)
    if (!trimmed) {
      set({ error: 'Job title cannot be empty.' })
      return
    }
    if (!/[a-zA-Z]{2,}/.test(trimmed)) {
      set({ error: 'Please enter a valid job title.' })
      return
    }
    if (!isAbbreviation && trimmed.length < 4) {
      set({ error: 'Please enter a valid job title (at least 4 characters).' })
      return
    }
    if (trimmed.length > 100) {
      set({ error: 'Job title must be 100 characters or less.' })
      return
    }
    const isKnown = JOB_TITLES.some((t) => t.toLowerCase() === trimmed.toLowerCase())
    if (!isKnown) {
      set({ error: 'Please select a valid job title from the list.' })
      return
    }
    set({ loading: true, error: null, questions: [], allQuestions: [], questionPage: 0 })
    try {
      const { data } = await axios.post('/api/questions', { jobTitle })
      const shuffled = shuffle<Question>(data.questions)
      set({
        allQuestions: shuffled,
        questions: shuffled.slice(0, 3),
        questionPage: 0,
        loading: false,
      })
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ?? 'Failed to generate questions. Please try again.'
      set({ error: msg, loading: false })
    }
  },
  regenerate: async () => {
    const { allQuestions, questionPage } = get()
    const totalPages = Math.floor(allQuestions.length / 3)
    const nextPage = questionPage + 1

    if (nextPage < totalPages) {
      set({
        questionPage: nextPage,
        questions: allQuestions.slice(nextPage * 3, nextPage * 3 + 3),
      })
    } else {
      await get().fetchQuestions()
    }
  },
  reset: () =>
    set({ jobTitle: '', allQuestions: [], questions: [], questionPage: 0, loading: false, error: null }),
}))
