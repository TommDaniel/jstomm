import { useState, useRef, useEffect, useCallback } from 'react'
import { Howl } from 'howler'
import { motion, AnimatePresence } from 'framer-motion'
import type { Radio } from '@/types/radio'

interface RadioPlayerProps {
  radios: Radio[]
  currentIndex: number
  onIndexChange: (idx: number) => void
}

const BARS_COUNT = 12

export default function RadioPlayer({ radios, currentIndex, onIndexChange }: RadioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [isLoading, setIsLoading] = useState(false)
  const [bars, setBars] = useState<number[]>(Array(BARS_COUNT).fill(4))
  const howlRef = useRef<Howl | null>(null)
  const animFrameRef = useRef<number>(0)
  const barsAnimRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const current = radios[currentIndex]

  // Animate bars when playing
  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        setBars(Array.from({ length: BARS_COUNT }, () => Math.floor(Math.random() * 28) + 4))
        barsAnimRef.current = setTimeout(animate, 120)
      }
      animate()
    } else {
      if (barsAnimRef.current) clearTimeout(barsAnimRef.current)
      setBars(Array(BARS_COUNT).fill(4))
    }
    return () => {
      if (barsAnimRef.current) clearTimeout(barsAnimRef.current)
    }
  }, [isPlaying])

  const loadAndPlay = useCallback(
    (radio: Radio) => {
      if (howlRef.current) {
        howlRef.current.unload()
        howlRef.current = null
      }

      setIsLoading(true)
      setIsPlaying(false)

      const howl = new Howl({
        src: [radio.stream_url],
        html5: true,
        volume,
        format: ['mp3', 'aac'],
        onplay: () => {
          setIsLoading(false)
          setIsPlaying(true)
        },
        onloaderror: () => {
          setIsLoading(false)
          setIsPlaying(false)
        },
        onstop: () => setIsPlaying(false),
      })

      howlRef.current = howl
      howl.play()
    },
    [volume],
  )

  function togglePlay() {
    if (!current) return

    if (isPlaying) {
      howlRef.current?.pause()
      setIsPlaying(false)
    } else if (howlRef.current) {
      howlRef.current.play()
    } else {
      loadAndPlay(current)
    }
  }

  function next() {
    onIndexChange((currentIndex + 1) % radios.length)
  }

  function handleVolumeChange(v: number) {
    setVolume(v)
    howlRef.current?.volume(v)
  }

  useEffect(() => {
    const animFrame = animFrameRef.current
    return () => {
      howlRef.current?.unload()
      cancelAnimationFrame(animFrame)
    }
  }, [])

  // Auto-play when the parent switches the selected radio.
  const prevIndexRef = useRef(currentIndex)
  useEffect(() => {
    if (prevIndexRef.current !== currentIndex && current) {
      loadAndPlay(current)
    }
    prevIndexRef.current = currentIndex
  }, [currentIndex, current, loadAndPlay])

  if (!current) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-preto-quente/95 backdrop-blur-md border-t border-madeira-clara/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Station info */}
        <div className="flex-1 min-w-0">
          <p className="font-serif text-base text-creme-papel truncate">{current.name}</p>
          <p className="font-sans text-xs text-creme-papel/40 truncate">
            {current.genre ?? 'Rádio'} {isLoading && '• Conectando...'}
          </p>
        </div>

        {/* Audio visualizer */}
        <div className="hidden sm:flex items-end gap-0.5 h-8" aria-hidden="true">
          <AnimatePresence>
            {bars.map((h, i) => (
              <motion.div
                key={i}
                className="w-1 bg-dourado-vintage rounded-sm"
                animate={{ height: isPlaying ? h : 4 }}
                transition={{ duration: 0.12, ease: 'linear' }}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-dourado-vintage text-preto-quente flex items-center justify-center text-xl transition-all hover:bg-madeira-clara active:scale-95"
            aria-label={isPlaying ? 'Pausar' : 'Tocar'}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-preto-quente border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              '⏸'
            ) : (
              '▶'
            )}
          </button>

          {/* Next */}
          {radios.length > 1 && (
            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-madeira-clara/30 text-creme-papel/60 flex items-center justify-center hover:text-creme-papel hover:border-madeira-clara/60 transition-all active:scale-95"
              aria-label="Próxima rádio"
            >
              ⏭
            </button>
          )}

          {/* Volume */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm" aria-hidden="true">🔊</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-20 accent-dourado-vintage h-1"
              aria-label="Volume"
            />
          </div>
        </div>

        {/* Station selector dots */}
        {radios.length > 1 && (
          <div className="hidden md:flex gap-1">
            {radios.map((_, i) => (
              <button
                key={i}
                onClick={() => onIndexChange(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentIndex ? 'bg-dourado-vintage' : 'bg-creme-papel/20 hover:bg-creme-papel/40'
                }`}
                aria-label={`Rádio ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
