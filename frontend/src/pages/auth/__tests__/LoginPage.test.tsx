import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import LoginPage from '../LoginPage'

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

import { useAuth } from '@/contexts/AuthContext'
const mockedUseAuth = useAuth as ReturnType<typeof vi.fn>

function renderLoginPage(initialEntry = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/area-pessoal" element={<div>Área Pessoal</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  const mockLogin = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseAuth.mockReturnValue({ login: mockLogin })
  })

  it('renders login form with email and password fields', () => {
    renderLoginPage()

    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('renders heading text', () => {
    renderLoginPage()

    expect(screen.getByText('Área Pessoal')).toBeInTheDocument()
    expect(screen.getByText('Bem-vinda, Vó!')).toBeInTheDocument()
  })

  it('renders back to home link', () => {
    renderLoginPage()

    expect(screen.getByText(/Voltar à página principal/)).toBeInTheDocument()
  })

  it('updates email and password fields on input', () => {
    renderLoginPage()

    const emailInput = screen.getByLabelText('E-mail') as HTMLInputElement
    const passwordInput = screen.getByLabelText('Senha') as HTMLInputElement

    fireEvent.change(emailInput, { target: { value: 'ana@test.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    expect(emailInput.value).toBe('ana@test.com')
    expect(passwordInput.value).toBe('password123')
  })

  it('calls login with email and password on submit', async () => {
    mockLogin.mockResolvedValue(undefined)
    renderLoginPage()

    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'ana@test.com' } })
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('ana@test.com', 'password123')
    })
  })

  it('navigates to /area-pessoal on successful login', async () => {
    mockLogin.mockResolvedValue(undefined)
    renderLoginPage()

    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'ana@test.com' } })
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'pass' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByText('Área Pessoal')).toBeInTheDocument()
    })
  })

  it('shows loading state while submitting', async () => {
    let resolve: () => void
    mockLogin.mockReturnValue(new Promise<void>((r) => { resolve = r }))
    renderLoginPage()

    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'ana@test.com' } })
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'pass' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Entrando...' })).toBeDisabled()
    })

    resolve!()
  })

  it('shows error message on failed login', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'))
    renderLoginPage()

    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'ana@test.com' } })
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByText('Email ou senha incorretos. Tente novamente.')).toBeInTheDocument()
    })
  })

  it('clears error message on new submit attempt', async () => {
    mockLogin.mockRejectedValueOnce(new Error('fail')).mockResolvedValue(undefined)
    renderLoginPage()

    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'ana@test.com' } })
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByText('Email ou senha incorretos. Tente novamente.')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.queryByText('Email ou senha incorretos. Tente novamente.')).not.toBeInTheDocument()
    })
  })

  it('button is re-enabled after failed login', async () => {
    mockLogin.mockRejectedValue(new Error('fail'))
    renderLoginPage()

    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'ana@test.com' } })
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Entrar' })).not.toBeDisabled()
    })
  })
})
