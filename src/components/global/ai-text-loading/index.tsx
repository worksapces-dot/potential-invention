'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface AITextLoadingProps {
  text?: string
  className?: string
  variant?: 'default' | 'minimal' | 'dots'
}

const thinkingPhrases = [
  'Analyzing your request',
  'Understanding the flow',
  'Configuring triggers',
  'Setting up keywords',
  'Building automation',
  'Almost ready',
]

const AITextLoading = ({ text, className, variant = 'default' }: AITextLoadingProps) => {
  const [currentPhrase, setCurrentPhrase] = useState(0)
  const [displayText, setDisplayText] = useState('')

  const phraseToShow = text || thinkingPhrases[currentPhrase]

  useEffect(() => {
    if (!text) {
      const interval = setInterval(() => {
        setCurrentPhrase((prev) => (prev + 1) % thinkingPhrases.length)
      }, 2500)
      return () => clearInterval(interval)
    }
  }, [text])

  useEffect(() => {
    setDisplayText('')
    let index = 0
    
    const typeInterval = setInterval(() => {
      if (index < phraseToShow.length) {
        setDisplayText(phraseToShow.slice(0, index + 1))
        index++
      } else {
        clearInterval(typeInterval)
      }
    }, 25)

    return () => clearInterval(typeInterval)
  }, [phraseToShow])

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-purple-400"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
    )
  }

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-4 h-4"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
        </motion.div>
        <span className="text-sm text-white/60">{displayText}</span>
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-0.5 h-4 bg-purple-400"
        />
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-6', className)}>
      {/* Animated Logo */}
      <div className="relative">
        <motion.div
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center"
          animate={{ 
            boxShadow: [
              '0 0 20px rgba(139, 92, 246, 0.3)',
              '0 0 40px rgba(139, 92, 246, 0.5)',
              '0 0 20px rgba(139, 92, 246, 0.3)',
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="h-8 w-8 text-white" />
          </motion.div>
        </motion.div>
        
        {/* Orbiting dots */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-purple-400"
            style={{ top: '50%', left: '50%' }}
            animate={{
              x: [0, 40, 0, -40, 0],
              y: [-40, 0, 40, 0, -40],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 1,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Text */}
      <div className="text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={phraseToShow}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-1"
          >
            <span className="text-lg font-medium text-white">{displayText}</span>
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block w-0.5 h-5 bg-purple-400 ml-0.5"
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {thinkingPhrases.map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors duration-300",
                i === currentPhrase ? "bg-purple-400" : "bg-white/20"
              )}
              animate={i === currentPhrase ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.5 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default AITextLoading