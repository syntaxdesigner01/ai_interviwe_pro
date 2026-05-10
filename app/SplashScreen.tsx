'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SplashScreen() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 5000)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-linear-to-bl from-sky-100 to-indigo-300"
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col items-center gap-6"
          >
            <div className="flex items-center gap-2.5">
              <motion.span
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white text-md font-extrabold tracking-tight"
              >
                IQ
              </motion.span>
              <span className="text-md font-bold text-gray-800">InterviewAI</span>
            </div>

            <div className="w-32 h-0.5 rounded-full bg-indigo-100 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ animation: 'splash-fill 5s linear forwards' }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
