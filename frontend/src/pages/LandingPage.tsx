import { useState } from 'react'
import { Link } from 'react-router-dom'
import HeroSection from '@/components/sections/HeroSection'
import EasterEgg from '@/components/sections/EasterEgg'
import BiografiaSection from '@/components/sections/BiografiaSection'
import MapaViagensSection from '@/components/sections/MapaViagensSection'
import EscritorioSection from '@/components/sections/EscritorioSection'
import TimelineSection from '@/components/sections/TimelineSection'

export default function LandingPage() {
  const [easterEggActive, setEasterEggActive] = useState(false)

  return (
    <main className="bg-verde-floresta text-creme-papel">
      <EasterEgg active={easterEggActive} onComplete={() => setEasterEggActive(false)} />

      <HeroSection onEasterEgg={() => setEasterEggActive(true)} />
      <BiografiaSection />
      <MapaViagensSection />
      <EscritorioSection />
      <TimelineSection />

      <footer className="border-t border-madeira-clara/10 py-8 px-6 text-center">
        <Link
          to="/login"
          className="font-script text-dourado-vintage/60 hover:text-dourado-vintage text-lg transition-colors"
        >
          Entrar
        </Link>
      </footer>
    </main>
  )
}
