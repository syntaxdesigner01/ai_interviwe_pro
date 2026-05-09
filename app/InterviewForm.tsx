'use client'
import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInterviewStore } from '@/store/useInterviewStore'
import { JOB_TITLES } from '@/lib/jobTitles'

const dropdownVariants = {
  initial: { opacity: 0, y: -6, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -6, scale: 0.97 },
} as const

const dropdownTransition = {
  duration: 0.15,
  ease: 'easeOut' as const,
  staggerChildren: 0.045,
}

const itemVariants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
} as const

const itemTransition = { duration: 0.18, ease: 'easeOut' as const }

export default function InterviewForm() {
  const { jobTitle, loading, error, setJobTitle, fetchQuestions, reset, questions } =
    useInterviewStore()

  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const isValidTitle = useMemo(
    () => JOB_TITLES.some((t) => t.toLowerCase() === jobTitle.trim().toLowerCase()),
    [jobTitle]
  )

  const filteredSuggestions = useMemo(() => {
    const q = jobTitle.trim().toLowerCase()
    if (q.length < 2) return []
    const tier1 = JOB_TITLES.filter((t) => t.toLowerCase().startsWith(q)).sort()
    const tier2 = JOB_TITLES.filter(
      (t) => !t.toLowerCase().startsWith(q) && t.toLowerCase().includes(q)
    ).sort()
    return [...tier1, ...tier2].slice(0, 6)
  }, [jobTitle])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelectSuggestion(title: string) {
    setJobTitle(title)
    setShowSuggestions(false)
    setHighlightedIndex(-1)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions || filteredSuggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((i) => Math.min(i + 1, filteredSuggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault()
      handleSelectSuggestion(filteredSuggestions[highlightedIndex])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setHighlightedIndex(-1)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setJobTitle(e.target.value)
    setHighlightedIndex(-1)
    setShowSuggestions(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSuggestions(false)
    if (!isValidTitle) return
    fetchQuestions()
  }

  return (
    <div className="mt-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label htmlFor="jobTitle" className="text-sm font-medium text-gray-700">
          Job Title
        </label>

        <div ref={wrapperRef} className="relative">
          <input
            id="jobTitle"
            type="text"
            value={jobTitle}
            onChange={handleChange}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Customer Success Manager"
            maxLength={100}
            disabled={loading}
            autoComplete="off"
            className="w-full border text-black border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
          />
          <AnimatePresence>
            {isValidTitle && (
              <motion.span
                key="checkmark"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.15 }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none"
                aria-hidden
              >
                ✓
              </motion.span>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showSuggestions && filteredSuggestions.length > 0 && (
              <motion.ul
                key="suggestions"
                variants={dropdownVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={dropdownTransition}
                className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[220px] overflow-y-auto hide-scrollbar"
              >
                {filteredSuggestions.map((title, i) => (
                  <motion.li
                    key={title}
                    variants={itemVariants}
                    transition={itemTransition}
                    onMouseDown={() => handleSelectSuggestion(title)}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                      i === highlightedIndex
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {title}
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !isValidTitle}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </span>
            ) : (
              'Generate Questions'
            )}
          </button>
          {(questions.length > 0 || error) && (
            <button
              type="button"
              onClick={reset}
              className="px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="mt-4 bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3 text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
