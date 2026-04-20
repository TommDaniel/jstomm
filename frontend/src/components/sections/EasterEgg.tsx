import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface EasterEggProps {
  active: boolean
  onComplete: () => void
}

const EMOJIS = ['❤️', '🌸', '⭐', '✨', '🌺', '💛', '🌼']

interface FloatingEmoji {
  id: number
  x: number
  emoji: string
  delay: number
  size: number
}

function generateEmojis(): FloatingEmoji[] {
  return Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    emoji: EMOJIS[i % EMOJIS.length],
    delay: Math.random() * 0.6,
    size: Math.random() * 24 + 20,
  }))
}

export default function EasterEgg({ active, onComplete }: EasterEggProps) {
  const emojis = useRef(generateEmojis())

  useEffect(() => {
    if (active) {
      emojis.current = generateEmojis()
      const timer = setTimeout(onComplete, 3500)
      return () => clearTimeout(timer)
    }
  }, [active, onComplete])

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
          {emojis.current.map((emoji) => (
            <motion.div
              key={emoji.id}
              className="absolute bottom-0 select-none"
              style={{ left: `${emoji.x}%`, fontSize: emoji.size }}
              initial={{ y: '100vh', opacity: 0, rotate: 0 }}
              animate={{
                y: '-110vh',
                opacity: [0, 1, 1, 0],
                rotate: [0, 20, -15, 10],
              }}
              transition={{
                duration: 2.5,
                delay: emoji.delay,
                ease: 'easeOut',
              }}
            >
              {emoji.emoji}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}
