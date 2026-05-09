'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInterviewStore } from '@/store/useInterviewStore'

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
}

function topicBadgeClass(topic: string | undefined): string {
  const t = (topic ?? '').toLowerCase()
  if (t.includes('coding') || t.includes('problem solving') || t.includes('debugging') || t.includes('code'))
    return 'bg-blue-100 text-blue-700'
  if (t.includes('system design') || t.includes('architecture'))
    return 'bg-purple-100 text-purple-700'
  if (t.includes('behavioral') || t.includes('communication') || t.includes('leadership') || t.includes('teamwork') || t.includes('collaboration'))
    return 'bg-green-100 text-green-700'
  if (t.includes('technical') || t.includes('algorithm') || t.includes('data structure'))
    return 'bg-indigo-100 text-indigo-700'
  return 'bg-gray-100 text-gray-600'
}

export default function QuestionsList() {
  const { questions, loading, jobTitle } = useInterviewStore()
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  async function handleCopy(text: string, index: number) {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 1500)
  }

  if (loading) {
    return (
      <div className="mt-8 text-center text-sm text-gray-500">
        <span className="inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2 align-middle" />
        Generating questions for <span className="font-medium text-gray-700">{jobTitle}</span>...
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      {questions.length > 0 && (
        <motion.div
          key={jobTitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-8"
        >
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-base font-semibold text-gray-700 mb-4">
              Interview Questions for <span className="text-blue-600">{jobTitle}</span>
            </h2>
          </motion.div>

          <motion.ol
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-3"
          >
            {questions.map((q, index) => (
              <motion.li
                key={index}
                layout
                variants={cardVariants}
                whileInView="visible"
                initial="hidden"
                viewport={{ once: true, margin: '-40px' }}
                whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="group bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm flex gap-4 cursor-default"
              >
                <span className="shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center">
                  {index + 1}
                </span>

                <div className="flex-1 min-w-0">
                  {q.topic && (
                    <span
                      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${topicBadgeClass(q.topic)}`}
                    >
                      {q.topic}
                    </span>
                  )}
                  <p className="text-sm text-gray-800 leading-relaxed">{q.question}</p>
                </div>

                <button
                  onClick={() => handleCopy(q.question, index)}
                  title="Copy question"
                  className="shrink-0 self-start mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                >
                  {copiedIndex === index ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                  )}
                </button>
              </motion.li>
            ))}
          </motion.ol>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
