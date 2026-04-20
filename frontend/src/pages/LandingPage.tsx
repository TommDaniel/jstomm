import { useState } from 'react'
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
    </main>
  )
}
