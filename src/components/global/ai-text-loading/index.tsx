'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface AITextLoadingProps {
  text?: string
  className?: string
  showDots?: boolean
}

const thinkingPhrases = [
  'Analyzing your request...',
  'Understanding the automation flow...',
  'Configuring triggers...',
  'Setting up keywords...',
  'Preparing AI responses...',
  'Building your automation...',
  'Almost there...',
]

const AITextLoading = ({ text, className, showDots = true }: AITextLoadingProps) => {
  const [currentPhrase, setCurrentPhrase] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  const phraseToShow = text || thinkingPhrases[currentPhrase]

  useEffect(() => {
    if (!text) {
      const interval = setInterval(() => {
        setCurrentPhrase((prev) => (prev + 1) % thinkingPhrases.length)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [text])

  useEffect(() => {
    setDisplayText('')
    setIsTyping(true)
    let index = 0
    
    const typeInterval = setInterval(() => {
      if (index < phraseToShow.length) {
        setDisplayText(phraseToShow.slice(0, index + 1))
        index++
      } else {
        setIsTyping(false)
        clearInterval(typeInterval)
      }
    }, 30)

    return () => clearInterval(typeInterval)
  }, [phraseToShow])

  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      {/* AI Badge */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3352CC] to-[#5577FF] flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <motion.div
            className="absolute -inset-1 rounded-lg bg-gradient-to-br from-[#3352CC] to-[#5577FF] opacity-30"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <span className="text-sm font-medium text-[#3352CC]">Thinking mode</span>
      </div>

      {/* Main Text */}
      <div className="text-center">
        <AnimatePresence mode="wait">
          <motion.h2
            key={phraseToShow}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-2xl md:text-3xl font-semibold text-white"
          >
            {displayText}
            {isTyping && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-0.5 h-6 bg-[#3352CC] ml-1"
              />
            )}
          </motion.h2>
        </AnimatePresence>
      </div>

      {/* Loading Dots */}
      {showDots && (
        <div className="flex items-center gap-2 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-[#3352CC]"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default AITextLoading