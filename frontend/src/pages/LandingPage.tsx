import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-verde-floresta text-creme-papel">
      {/* Hero placeholder */}
      <section className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-3xl mx-auto">
          <p className="section-subtitle font-script text-2xl mb-4">
            Uma homenagem especial
          </p>
          <h1 className="section-title text-5xl md:text-7xl mb-6">
            70 Anos da Vó Jacinta
          </h1>
          <p className="font-sans text-creme-papel/70 text-lg mb-8 leading-relaxed">
            Celebrando a trajetória de Jacinta Maria Jung Tomm —<br className="hidden md:block" />
            contadora pioneira, viajante apaixonada, matriarca amorosa.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg">Explorar a história</Button>
            <Button variant="secondary" size="lg">Ver viagens</Button>
          </div>
        </div>
      </section>

      {/* Design system showcase */}
      <section className="py-20 px-6 bg-verde-musgo/20">
        <div className="max-w-5xl mx-auto">
          <h2 className="section-title text-center mb-4">Nossa paleta</h2>
          <p className="section-subtitle text-center mb-12">Design com alma gaúcha</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { name: 'Verde Floresta', hex: '#1F3A2E', cls: 'bg-verde-floresta' },
              { name: 'Verde Musgo', hex: '#3D5A4A', cls: 'bg-verde-musgo' },
              { name: 'Dourado Vintage', hex: '#C9A961', cls: 'bg-dourado-vintage' },
              { name: 'Madeira Clara', hex: '#C4A57B', cls: 'bg-madeira-clara' },
              { name: 'Madeira Escura', hex: '#5C3D2E', cls: 'bg-madeira-escura' },
              { name: 'Creme Papel', hex: '#F5EFE6', cls: 'bg-creme-papel' },
              { name: 'Preto Quente', hex: '#1A1510', cls: 'bg-preto-quente' },
            ].map((color) => (
              <div key={color.name} className="flex flex-col items-center gap-2">
                <div className={`w-full aspect-square rounded-xl ${color.cls} border border-white/10`} />
                <span className="font-sans text-sm text-creme-papel/70 text-center">{color.name}</span>
                <span className="font-script text-xs text-madeira-clara">{color.hex}</span>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Tipografia Playfair</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-sans text-creme-papel/70 text-base">
                  Inter para o corpo do texto — legível e moderno.
                </p>
                <p className="font-script text-madeira-clara text-lg mt-2">
                  Caveat para detalhes especiais
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Componentes</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button>Botão principal</Button>
                <Button variant="secondary">Botão secundário</Button>
                <Button variant="ghost">Botão ghost</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Acessibilidade</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-sans text-creme-papel/70 text-base leading-relaxed">
                  Fonte base 18px · Alto contraste · Botões mínimos 48×48px · Navegação por teclado
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
