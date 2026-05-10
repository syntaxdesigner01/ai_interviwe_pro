'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
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

function SkeletonCard({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-white/70 backdrop-blur-md border border-white/60 rounded-xl px-5 py-4 shadow-sm flex gap-4"
    >
      <div className="shrink-0 w-7 h-7 rounded-full bg-indigo-100/80 animate-pulse" />
      <div className="flex-1 min-w-0 space-y-3 pt-0.5">
        <div className="h-4 w-20 rounded-full bg-gray-200/90 animate-pulse" />
        <div className="h-3.5 w-full rounded bg-gray-200/90 animate-pulse" />
        <div className="h-3.5 w-5/6 rounded bg-gray-200/90 animate-pulse" />
        <div className="h-3.5 w-4/6 rounded bg-gray-200/80 animate-pulse" />
      </div>
    </motion.div>
  )
}

function filenameFromLanguage(lang: string | undefined): string {
  const map: Record<string, string> = {
    javascript: 'solution.js',
    typescript: 'solution.ts',
    python: 'solution.py',
    sql: 'solution.sql',
    java: 'Solution.java',
    csharp: 'Solution.cs',
    cpp: 'solution.cpp',
    go: 'solution.go',
    rust: 'solution.rs',
    ruby: 'solution.rb',
  }
  return map[lang?.toLowerCase() ?? ''] ?? 'solution.txt'
}

function CodeBlock({
  code,
  language,
  copied,
  onCopy,
}: {
  code: string
  language: string | undefined
  copied: boolean
  onCopy: () => void
}) {
  return (
    <div className="mt-3 rounded-lg overflow-hidden border border-[#3c3c3c] text-left">
      {/* Title bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#2d2d2d]">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-xs text-[#858585] font-mono">{filenameFromLanguage(language)}</span>
        </div>
        <button
          onClick={onCopy}
          title="Copy code"
          className="flex items-center gap-1 text-xs text-[#858585] hover:text-[#d4d4d4] transition-colors px-1.5 py-0.5 rounded hover:bg-[#3c3c3c]"
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-green-400">Copied</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code area */}
      <div className="max-h-48 overflow-auto hide-scrollbar">
        <SyntaxHighlighter
          language={language ?? 'text'}
          style={vscDarkPlus}
          showLineNumbers
          wrapLines
          customStyle={{
            margin: 0,
            borderRadius: 0,
            fontSize: '0.75rem',
            lineHeight: '1.6',
            background: '#1e1e1e',
            padding: '12px 0',
          }}
          lineNumberStyle={{
            color: '#858585',
            minWidth: '2.5em',
            paddingRight: '1em',
            userSelect: 'none',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="mt-16 flex flex-col items-center gap-3 text-center select-none"
    >
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="110" height="118" viewBox="0 0 110 118" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M82 76 Q100 64 95 50 Q91 40 82 46" stroke="#d97706" strokeWidth="8" fill="none" strokeLinecap="round"/>
          <ellipse cx="55" cy="84" rx="28" ry="21" fill="#fbbf24"/>
          <ellipse cx="37" cy="41" rx="10" ry="15" fill="#d97706" transform="rotate(-12 37 41)"/>
          <ellipse cx="73" cy="41" rx="10" ry="15" fill="#d97706" transform="rotate(12 73 41)"/>
          <circle cx="55" cy="50" r="21" fill="#fbbf24"/>
          <circle cx="48" cy="47" r="3" fill="#1f2937"/>
          <circle cx="62" cy="47" r="3" fill="#1f2937"/>
          <circle cx="49.2" cy="45.8" r="1.1" fill="white"/>
          <circle cx="63.2" cy="45.8" r="1.1" fill="white"/>
          <ellipse cx="55" cy="55" rx="5" ry="3.5" fill="#92400e"/>
          <path d="M50 59.5 Q55 64.5 60 59.5" stroke="#92400e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <ellipse cx="40" cy="102" rx="10" ry="6.5" fill="#fbbf24"/>
          <ellipse cx="70" cy="102" rx="10" ry="6.5" fill="#fbbf24"/>
          <rect x="18" y="107" width="28" height="5" rx="2.5" fill="#d97706"/>
          <circle cx="18" cy="109.5" r="5" fill="#d97706"/>
          <circle cx="46" cy="109.5" r="5" fill="#d97706"/>
        </svg>
      </motion.div>
      <p className="text-sm font-medium text-gray-600">Waiting to fetch your questions...</p>
      <p className="text-xs text-gray-400">Enter a job title above to get started</p>
    </motion.div>
  )
}

export default function QuestionsList() {
  const { questions, loading, jobTitle, questionPage } = useInterviewStore()
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null)

  async function handleCopyQuestion(text: string, index: number) {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 1500)
  }

  async function handleCopyCode(code: string, index: number) {
    await navigator.clipboard.writeText(code)
    setCopiedCodeIndex(index)
    setTimeout(() => setCopiedCodeIndex(null), 1500)
  }

  if (loading) {
    return (
      <div className="mt-8 flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <SkeletonCard key={i} delay={i * 0.1} />
        ))}
      </div>
    )
  }

  if (questions.length === 0) {
    return <EmptyState />
  }

  return (
    <AnimatePresence mode="wait">
      {questions.length > 0 && (
        <motion.div
          key={`${jobTitle}-${questionPage}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-8"
        >
          {/* <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-base font-semibold text-gray-700 mb-4">
              Interview Questions for <span className="text-blue-600">{jobTitle}</span>
            </h2>
          </motion.div> */}

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
                whileHover={{ y: -3, boxShadow: '0 8px 28px rgba(99,102,241,0.18)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="group bg-white/70 backdrop-blur-md border border-white/60 rounded-xl px-5 py-4 shadow-sm flex gap-4 cursor-default"
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
                  <p className="text-sm text-gray-500 leading-7">{q.question}</p>

                  {q.code && (
                    <CodeBlock
                      code={q.code}
                      language={q.language}
                      copied={copiedCodeIndex === index}
                      onCopy={() => handleCopyCode(q.code!, index)}
                    />
                  )}
                </div>

                <button
                  onClick={() => handleCopyQuestion(q.question, index)}
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
