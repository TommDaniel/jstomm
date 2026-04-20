import { useState } from 'react'
import HeroSection from '@/components/sections/HeroSection'
import EasterEgg from '@/components/sections/EasterEgg'
import BiografiaSection from '@/components/sections/BiografiaSection'

export default function LandingPage() {
  const [easterEggActive, setEasterEggActive] = useState(false)

  return (
    <main className="bg-verde-floresta text-creme-papel">
      <EasterEgg active={easterEggActive} onComplete={() => setEasterEggActive(false)} />

      <HeroSection onEasterEgg={() => setEasterEggActive(true)} />
      <BiografiaSection />
    </main>
  )
}
