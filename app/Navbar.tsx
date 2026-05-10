'use client'
import { useInterviewStore } from '@/store/useInterviewStore'

export default function Navbar() {
  const totalTokens = useInterviewStore((s) => s.totalTokens)

  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-white/50 border-b border-white/40">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white text-md font-extrabold tracking-tight">
            IQ
          </span>
          <span className="text-md font-bold text-gray-800">InterviewAI</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white/60 border border-white/50 rounded-full px-3 py-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
          <span>{totalTokens.toLocaleString()} tokens used</span>
        </div>
      </div>
    </header>
  )
}
