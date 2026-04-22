import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GoldenParticles from './GoldenParticles'

const HERO_PHOTOS = [
  '/photos/historia/70-anos-festa.png',
  '/photos/historia/casamento-1978.png',
  '/photos/hero/01-egito.jpg',
  '/photos/hero/02-budapeste.jpg',
  '/photos/hero/04-lisboa.jpg',
  '/photos/hero/05-serra-gaucha.jpg',
  '/photos/hero/06-elegante.jpg',
]

const TITLE_WORDS = ['Parabéns', 'pelos', '70', 'anos,', 'Vó', 'Jacinta!']

const kenBurnsVariants = [
  { initial: { scale: 1.15, x: '5%', y: '2%' }, animate: { scale: 1, x: '0%', y: '0%' } },
  { initial: { scale: 1, x: '0%', y: '0%' }, animate: { scale: 1.12, x: '-3%', y: '3%' } },
  { initial: { scale: 1.1, x: '-4%', y: '-2%' }, animate: { scale: 1, x: '2%', y: '2%' } },
  { initial: { scale: 1, x: '3%', y: '3%' }, animate: { scale: 1.15, x: '-2%', y: '-2%' } },
  { initial: { scale: 1.08, x: '2%', y: '-3%' }, animate: { scale: 1, x: '-2%', y: '1%' } },
  { initial: { scale: 1, x: '-2%', y: '1%' }, animate: { scale: 1.1, x: '3%', y: '-2%' } },
]

// Easter egg click counter (shared state via module)
let easterEggClicks = 0
let easterEggTimer: ReturnType<typeof setTimeout> | null = null

interface HeroSectionProps {
  onEasterEgg?: () => void
}

export default function HeroSection({ onEasterEgg }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [titleVisible, setTitleVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setTitleVisible(true), 300)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_PHOTOS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handlePhotoClick = useCallback(() => {
    easterEggClicks++
    if (easterEggTimer) clearTimeout(easterEggTimer)
    easterEggTimer = setTimeout(() => {
      easterEggClicks = 0
    }, 3000)

    if (easterEggClicks >= 5) {
      easterEggClicks = 0
      onEasterEgg?.()
    }
  }, [onEasterEgg])

  const kb = kenBurnsVariants[currentIndex % kenBurnsVariants.length]

  return (
    <section className="relative min-h-screen overflow-hidden bg-preto-quente flex flex-col">
      {/* Background photo with Ken Burns */}
      <AnimatePresence mode="crossfade">
        <motion.div
          key={currentIndex}
          className="absolute inset-0 cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          onClick={handlePhotoClick}
          role="img"
          aria-label="Foto da Vó Jacinta"
        >
          <motion.img
            src={HERO_PHOTOS[currentIndex]}
            alt=""
            className="w-full h-full object-cover"
            initial={kb.initial}
            animate={kb.animate}
            transition={{ duration: 5.5, ease: 'linear' }}
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-preto-quente/60 via-preto-quente/30 to-verde-floresta/90" />
        </motion.div>
      </AnimatePresence>

      {/* Golden particles */}
      <GoldenParticles />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center flex-1 px-6 text-center">
        {/* Subtitle */}
        <motion.p
          className="font-script text-dourado-vintage text-2xl md:text-3xl mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Uma homenagem com muito amor
        </motion.p>

        {/* Main title — staggered word reveal */}
        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-creme-papel leading-tight mb-8 max-w-4xl">
          {TITLE_WORDS.map((word, i) => (
            <motion.span
              key={i}
              className="inline-block mr-[0.25em]"
              initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
              animate={titleVisible ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
              transition={{
                delay: 0.5 + i * 0.12,
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {word === '70' ? (
                <span className="text-dourado-vintage">{word}</span>
              ) : (
                word
              )}
            </motion.span>
          ))}
        </h1>

        {/* Date */}
        <motion.p
          className="font-sans text-creme-papel/60 text-base md:text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          15 de Abril de 1956 — 15 de Abril de 2026
        </motion.p>
      </div>

      {/* Photo indicators */}
      <div className="relative z-20 flex justify-center gap-2 pb-8">
        {HERO_PHOTOS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1 rounded-full transition-all duration-500 ${
              i === currentIndex ? 'w-8 bg-dourado-vintage' : 'w-2 bg-creme-papel/30'
            }`}
            aria-label={`Foto ${i + 1}`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.8, repeat: Infinity, repeatType: 'reverse', repeatDelay: 1 }}
        aria-hidden="true"
      >
        <div className="w-6 h-10 border-2 border-creme-papel/40 rounded-full flex justify-center pt-2">
          <motion.div
            className="w-1.5 h-1.5 bg-dourado-vintage rounded-full"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  )
}
