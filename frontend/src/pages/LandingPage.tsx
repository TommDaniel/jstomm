import { useState } from 'react'
import HeroSection from '@/components/sections/HeroSection'
import EasterEgg from '@/components/sections/EasterEgg'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  const [easterEggActive, setEasterEggActive] = useState(false)

  return (
    <main className="min-h-screen bg-verde-floresta text-creme-papel">
      <EasterEgg active={easterEggActive} onComplete={() => setEasterEggActive(false)} />

      <HeroSection onEasterEgg={() => setEasterEggActive(true)} />

      {/* Design system showcase — temporary, will be replaced by real sections */}
      <section className="py-20 px-6 bg-verde-musgo/20">
        <div className="max-w-5xl mx-auto">
          <h2 className="section-title text-center mb-4">Nossa história</h2>
          <p className="section-subtitle text-center mb-12">Em construção...</p>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Biografia</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-sans text-creme-papel/70 text-base">
                  70 anos de uma vida extraordinária em Santo Ângelo, RS.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Viagens</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-sans text-creme-papel/70 text-base">
                  Do Rio Grande do Sul ao Egito, Jerusalém e Europa.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Família</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-sans text-creme-papel/70 text-base">
                  3 filhos, 10 netos e uma família que cresce com amor.
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-8">
            <Button size="lg">Explorar</Button>
          </div>
        </div>
      </section>
    </main>
  )
}
