import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await login(email, password)
      navigate('/area-pessoal')
    } catch {
      setError('Email ou senha incorretos. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-verde-floresta flex items-center justify-center px-6">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div className="text-center mb-10">
          <p className="font-script text-dourado-vintage text-3xl mb-2">Bem-vinda, Vó!</p>
          <h1 className="font-serif text-4xl text-creme-papel">Área Pessoal</h1>
          <p className="font-sans text-creme-papel/50 mt-2 text-base">
            Entre para acessar suas fotos e rádios favoritas
          </p>
        </div>

        {/* Form */}
        <div className="card-vintage">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label
                htmlFor="email"
                className="block font-sans text-base text-creme-papel/80 mb-2"
              >
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jacinta@vo70anos.com.br"
                autoComplete="email"
                required
                className="text-lg h-14"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block font-sans text-base text-creme-papel/80 mb-2"
              >
                Senha
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="text-lg h-14"
              />
            </div>

            {error && (
              <motion.p
                className="font-sans text-red-400 text-base text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.p>
            )}

            <Button type="submit" size="lg" disabled={loading} className="mt-2 text-lg h-14">
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>

        <div className="text-center mt-6">
          <a
            href="/"
            className="font-sans text-creme-papel/40 text-sm hover:text-creme-papel/70 transition-colors"
          >
            ← Voltar à página principal
          </a>
        </div>
      </motion.div>
    </div>
  )
}
