import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import RadiosPage from '../RadiosPage'

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
  },
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/components/radio/RadioPlayer', () => ({
  default: ({ radios }: { radios: unknown[] }) => (
    <div data-testid="radio-player">Player ({radios.length} radios)</div>
  ),
}))

import { api } from '@/lib/api'
const mockedApi = api as {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
  put: ReturnType<typeof vi.fn>
}

function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

function renderRadiosPage() {
  return render(
    <QueryClientProvider client={makeClient()}>
      <MemoryRouter>
        <RadiosPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const mockRadios = [
  { id: 1, user_id: 1, name: 'Rádio Gaúcha', stream_url: 'https://stream.example.com/1', logo_url: null, genre: 'gaúcha', is_favorite: false, order: 0 },
  { id: 2, user_id: 1, name: 'Band FM', stream_url: 'https://stream.example.com/2', logo_url: null, genre: 'pop', is_favorite: true, order: 1 },
]

describe('RadiosPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows page heading', () => {
    mockedApi.get.mockResolvedValue({ data: [] })
    renderRadiosPage()

    expect(screen.getByText('Minhas Rádios')).toBeInTheDocument()
  })

  it('shows empty state when no radios', async () => {
    mockedApi.get.mockResolvedValue({ data: [] })
    renderRadiosPage()

    await waitFor(() => {
      expect(screen.getByText('Nenhuma rádio ainda')).toBeInTheDocument()
    })
  })

  it('shows radios list after loading', async () => {
    mockedApi.get.mockResolvedValue({ data: mockRadios })
    renderRadiosPage()

    await waitFor(() => {
      expect(screen.getByText('Rádio Gaúcha')).toBeInTheDocument()
      expect(screen.getByText('Band FM')).toBeInTheDocument()
    })
  })

  it('shows radio genre', async () => {
    mockedApi.get.mockResolvedValue({ data: mockRadios })
    renderRadiosPage()

    await waitFor(() => {
      expect(screen.getByText('gaúcha')).toBeInTheDocument()
    })
  })

  it('shows RadioPlayer when there are radios', async () => {
    mockedApi.get.mockResolvedValue({ data: mockRadios })
    renderRadiosPage()

    await waitFor(() => {
      expect(screen.getByTestId('radio-player')).toBeInTheDocument()
    })
  })

  it('does not show RadioPlayer when there are no radios', async () => {
    mockedApi.get.mockResolvedValue({ data: [] })
    renderRadiosPage()

    await waitFor(() => {
      expect(screen.queryByTestId('radio-player')).not.toBeInTheDocument()
    })
  })

  it('shows + Adicionar button', () => {
    mockedApi.get.mockResolvedValue({ data: [] })
    renderRadiosPage()

    expect(screen.getByText('+ Adicionar')).toBeInTheDocument()
  })

  it('shows add radio panel when clicking + Adicionar', () => {
    mockedApi.get.mockResolvedValue({ data: [] })
    renderRadiosPage()

    fireEvent.click(screen.getByText('+ Adicionar'))

    expect(screen.getByText('Buscar Rádios')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nome da rádio')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('URL do stream (https://...)')).toBeInTheDocument()
  })

  it('hides add panel when clicking Fechar', () => {
    mockedApi.get.mockResolvedValue({ data: [] })
    renderRadiosPage()

    fireEvent.click(screen.getByText('+ Adicionar'))
    expect(screen.getByText('Buscar Rádios')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Fechar'))
    expect(screen.queryByText('Buscar Rádios')).not.toBeInTheDocument()
  })

  it('shows favorite button for each radio', async () => {
    mockedApi.get.mockResolvedValue({ data: mockRadios })
    renderRadiosPage()

    await waitFor(() => {
      const favButtons = screen.getAllByLabelText(/favorito/i)
      expect(favButtons).toHaveLength(2)
    })
  })

  it('shows delete button for each radio', async () => {
    mockedApi.get.mockResolvedValue({ data: mockRadios })
    renderRadiosPage()

    await waitFor(() => {
      const deleteButtons = screen.getAllByLabelText('Remover rádio')
      expect(deleteButtons).toHaveLength(2)
    })
  })

  it('calls delete API when clicking delete button', async () => {
    mockedApi.get.mockResolvedValue({ data: mockRadios })
    mockedApi.delete.mockResolvedValue({})
    renderRadiosPage()

    await waitFor(() => {
      expect(screen.getAllByLabelText('Remover rádio')).toHaveLength(2)
    })

    fireEvent.click(screen.getAllByLabelText('Remover rádio')[0])

    await waitFor(() => {
      expect(mockedApi.delete).toHaveBeenCalledWith('/radios/1')
    })
  })

  it('calls favorite toggle API when clicking favorite button', async () => {
    mockedApi.get.mockResolvedValue({ data: mockRadios })
    mockedApi.put.mockResolvedValue({})
    renderRadiosPage()

    await waitFor(() => {
      expect(screen.getAllByLabelText(/favorito/i)).toHaveLength(2)
    })

    fireEvent.click(screen.getAllByLabelText(/favorito/i)[0])

    await waitFor(() => {
      expect(mockedApi.put).toHaveBeenCalledWith('/radios/1/favorite', {})
    })
  })

  it('can manually add a radio', async () => {
    mockedApi.get.mockResolvedValue({ data: [] })
    mockedApi.post.mockResolvedValue({ data: mockRadios[0] })
    renderRadiosPage()

    fireEvent.click(screen.getByText('+ Adicionar'))

    fireEvent.change(screen.getByPlaceholderText('Nome da rádio'), { target: { value: 'Minha Rádio' } })
    fireEvent.change(screen.getByPlaceholderText('URL do stream (https://...)'), {
      target: { value: 'https://stream.example.com/minha' },
    })

    fireEvent.click(screen.getByText('Adicionar'))

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith('/radios', {
        name: 'Minha Rádio',
        stream_url: 'https://stream.example.com/minha',
      })
    })
  })
})
