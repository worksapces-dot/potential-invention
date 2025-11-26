'use client'

import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect } from 'react'

type Props = {
  from?: number
  to?: number
  duration?: number
  className?: string
}

export const CountingNumber = ({
  from = 0,
  to = 0,
  duration = 0.6,
  className,
}: Props) => {
  const count = useMotionValue(from)
  const rounded = useTransform(count, (latest) => Math.round(latest).toString())

  useEffect(() => {
    const controls = animate(count, to, {
      duration,
      ease: 'easeOut',
    })

    return controls.stop
  }, [count, to, duration])

  return (
    <motion.span className={className}>
      <motion.span>{rounded}</motion.span>
    </motion.span>
  )
}


