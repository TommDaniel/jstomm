import { render, screen, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AuthProvider, useAuth } from '../AuthContext'

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
  setAuthToken: vi.fn(),
}))

import { api, setAuthToken } from '@/lib/api'

const mockedApi = api as { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> }
const mockedSetAuthToken = setAuthToken as ReturnType<typeof vi.fn>

function TestConsumer() {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div>loading</div>
  return <div>{user ? `logged in as ${user.name}` : 'logged out'}</div>
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('starts in loading state', () => {
    mockedApi.get.mockReturnValue(new Promise(() => {})) // never resolves
    localStorage.setItem('auth_token', 'test-token')

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    expect(screen.getByText('loading')).toBeInTheDocument()
  })

  it('shows logged out when no token in localStorage', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('logged out')).toBeInTheDocument()
    })
    expect(mockedApi.get).not.toHaveBeenCalled()
  })

  it('fetches user when token exists in localStorage', async () => {
    localStorage.setItem('auth_token', 'valid-token')
    mockedApi.get.mockResolvedValue({ data: { id: 1, name: 'Ana', email: 'ana@test.com', role: 'user' } })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('logged in as Ana')).toBeInTheDocument()
    })
    expect(mockedApi.get).toHaveBeenCalledWith('/user')
  })

  it('clears token and shows logged out when fetch fails', async () => {
    localStorage.setItem('auth_token', 'expired-token')
    mockedApi.get.mockRejectedValue(new Error('401 Unauthorized'))

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('logged out')).toBeInTheDocument()
    })
    expect(mockedSetAuthToken).toHaveBeenCalledWith(null)
  })

  it('login sets user and token', async () => {
    const mockUser = { id: 1, name: 'Ana', email: 'ana@test.com', role: 'user' }
    mockedApi.post.mockResolvedValue({ data: { token: 'new-token', user: mockUser } })

    function LoginButton() {
      const { login, user } = useAuth()
      return (
        <div>
          {user ? `Hello ${user.name}` : 'Not logged in'}
          <button onClick={() => login('ana@test.com', 'pass')}>Login</button>
        </div>
      )
    }

    render(
      <AuthProvider>
        <LoginButton />
      </AuthProvider>
    )

    await waitFor(() => expect(screen.getByText('Not logged in')).toBeInTheDocument())

    await act(async () => {
      screen.getByText('Login').click()
    })

    await waitFor(() => {
      expect(screen.getByText('Hello Ana')).toBeInTheDocument()
    })
    expect(mockedApi.post).toHaveBeenCalledWith('/login', { email: 'ana@test.com', password: 'pass' })
    expect(mockedSetAuthToken).toHaveBeenCalledWith('new-token')
  })

  it('logout clears user and token', async () => {
    const mockUser = { id: 1, name: 'Ana', email: 'ana@test.com', role: 'user' }
    mockedApi.get.mockResolvedValue({ data: mockUser })
    mockedApi.post.mockResolvedValue({})
    localStorage.setItem('auth_token', 'valid-token')

    function LogoutButton() {
      const { logout, user } = useAuth()
      return (
        <div>
          {user ? `Hello ${user.name}` : 'Logged out'}
          <button onClick={logout}>Logout</button>
        </div>
      )
    }

    render(
      <AuthProvider>
        <LogoutButton />
      </AuthProvider>
    )

    await waitFor(() => expect(screen.getByText('Hello Ana')).toBeInTheDocument())

    await act(async () => {
      screen.getByText('Logout').click()
    })

    await waitFor(() => {
      expect(screen.getByText('Logged out')).toBeInTheDocument()
    })
    expect(mockedSetAuthToken).toHaveBeenCalledWith(null)
  })
})

describe('useAuth', () => {
  it('throws when used outside AuthProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    function BadConsumer() {
      useAuth()
      return null
    }

    expect(() => render(<BadConsumer />)).toThrow('useAuth must be used within AuthProvider')
    consoleError.mockRestore()
  })
})
