import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { to: '/area-pessoal/albuns', label: 'Álbuns', icon: '📷' },
  { to: '/area-pessoal/radios', label: 'Rádios', icon: '📻' },
  { to: '/area-pessoal/locacoes', label: 'Locações', icon: '🏠' },
]

export default function AreaPessoalPage() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const isRoot = location.pathname === '/area-pessoal'

  return (
    <div className="min-h-screen bg-verde-floresta flex flex-col">
      {/* Header */}
      <header className="border-b border-madeira-clara/10 px-6 py-4 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div>
              <p className="font-script text-dourado-vintage text-base leading-none">
                Olá,
              </p>
              <h1 className="font-serif text-xl text-creme-papel leading-tight">
                {user?.name?.split(' ')[0]}
              </h1>
            </div>

            {/* Nav */}
            <nav className="hidden sm:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-4 py-2 rounded-lg font-sans text-base transition-all min-h-[44px] flex items-center gap-2 ${
                    location.pathname.startsWith(item.to)
                      ? 'bg-dourado-vintage/20 text-dourado-vintage'
                      : 'text-creme-papel/60 hover:text-creme-papel/80'
                  }`}
                >
                  {item.icon} {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/" className="font-sans text-sm text-creme-papel/40 hover:text-creme-papel/70 transition-colors hidden sm:block">
              ← Site principal
            </Link>
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <nav className="sm:hidden flex border-b border-madeira-clara/10">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex-1 py-3 font-sans text-sm text-center transition-all flex items-center justify-center gap-1.5 ${
              location.pathname.startsWith(item.to)
                ? 'text-dourado-vintage border-b-2 border-dourado-vintage'
                : 'text-creme-papel/50'
            }`}
          >
            {item.icon} {item.label}
          </Link>
        ))}
      </nav>

      {/* Content */}
      <main className="flex-1">
        {isRoot ? (
          <motion.div
            className="max-w-5xl mx-auto px-6 py-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="font-script text-dourado-vintage text-3xl mb-2">Bem-vinda!</p>
            <p className="font-sans text-creme-papel/60 mb-10">Escolha o que deseja fazer</p>
            <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="card-vintage p-8 text-center hover:border-dourado-vintage/40 transition-all cursor-pointer block"
                >
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <h2 className="font-serif text-2xl text-dourado-vintage">
                    {item.label}
                  </h2>
                </Link>
              ))}
            </div>
          </motion.div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  )
}
