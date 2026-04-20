import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

export default function AreaPessoalPage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-verde-floresta">
      {/* Header */}
      <header className="border-b border-madeira-clara/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <p className="font-script text-dourado-vintage text-lg">Olá,</p>
            <h1 className="font-serif text-2xl text-creme-papel">{user?.name}</h1>
          </div>
          <Button variant="ghost" onClick={() => logout()}>
            Sair
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          className="grid md:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Albums card */}
          <div className="card-vintage p-8 text-center cursor-pointer hover:border-dourado-vintage/40 transition-colors">
            <div className="text-5xl mb-4">📷</div>
            <h2 className="font-serif text-2xl text-dourado-vintage mb-2">Meus Álbuns</h2>
            <p className="font-sans text-creme-papel/60">
              Organize e visualize suas fotos em álbuns de viagens, família e momentos especiais.
            </p>
          </div>

          {/* Radio card */}
          <div className="card-vintage p-8 text-center cursor-pointer hover:border-dourado-vintage/40 transition-colors">
            <div className="text-5xl mb-4">📻</div>
            <h2 className="font-serif text-2xl text-dourado-vintage mb-2">Minhas Rádios</h2>
            <p className="font-sans text-creme-papel/60">
              Ouça suas rádios favoritas enquanto navega pelas suas memórias.
            </p>
          </div>
        </motion.div>

        <motion.p
          className="text-center font-script text-madeira-clara text-xl mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Galeria e player de rádio em breve ✨
        </motion.p>
      </main>
    </div>
  )
}
