'use client'
import { create } from 'zustand'
import axios from 'axios'
import { JOB_TITLES } from '@/lib/jobTitles'

type Question = { topic: string; question: string }

type InterviewStore = {
  jobTitle: string
  questions: Question[]
  loading: boolean
  error: string | null
  setJobTitle: (title: string) => void
  fetchQuestions: () => Promise<void>
  reset: () => void
}

export const useInterviewStore = create<InterviewStore>((set, get) => ({
  jobTitle: '',
  questions: [],
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
    set({ loading: true, error: null, questions: [] })
    try {
      const { data } = await axios.post('/api/questions', { jobTitle })
      set({ questions: data.questions, loading: false })
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ?? 'Failed to generate questions. Please try again.'
      set({ error: msg, loading: false })
    }
  },
  reset: () => set({ jobTitle: '', questions: [], loading: false, error: null }),
}))
