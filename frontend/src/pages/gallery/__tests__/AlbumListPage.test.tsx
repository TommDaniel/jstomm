import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AlbumListPage from '../AlbumListPage'

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

import { api } from '@/lib/api'
const mockedApi = api as { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> }

function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

function renderAlbumList() {
  return render(
    <QueryClientProvider client={makeClient()}>
      <MemoryRouter>
        <AlbumListPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const mockAlbums = [
  { id: 1, user_id: 1, name: 'Viagem ao Sul', type: 'viagem' as const, cover_photo_id: null, photos_count: 5 },
  { id: 2, user_id: 1, name: 'Aniversário', type: 'momento' as const, cover_photo_id: null, photos_count: 3 },
  { id: 3, user_id: 1, name: 'Anos 80', type: 'periodo' as const, cover_photo_id: null, photos_count: 10 },
]

describe('AlbumListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows page heading', async () => {
    mockedApi.get.mockResolvedValue({ data: [] })
    renderAlbumList()

    expect(screen.getByText('Meus Álbuns')).toBeInTheDocument()
  })

  it('shows loading spinner initially', () => {
    mockedApi.get.mockReturnValue(new Promise(() => {}))
    renderAlbumList()

    // Loading spinner should be visible
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('shows albums after loading', async () => {
    mockedApi.get.mockResolvedValue({ data: mockAlbums })
    renderAlbumList()

    await waitFor(() => {
      expect(screen.getByText('Viagem ao Sul')).toBeInTheDocument()
      expect(screen.getByText('Aniversário')).toBeInTheDocument()
      expect(screen.getByText('Anos 80')).toBeInTheDocument()
    })
  })

  it('shows album count', async () => {
    mockedApi.get.mockResolvedValue({ data: mockAlbums })
    renderAlbumList()

    await waitFor(() => {
      expect(screen.getByText('3 álbuns')).toBeInTheDocument()
    })
  })

  it('shows empty state when no albums', async () => {
    mockedApi.get.mockResolvedValue({ data: [] })
    renderAlbumList()

    await waitFor(() => {
      expect(screen.getByText('Nenhum álbum ainda')).toBeInTheDocument()
    })
  })

  it('shows + Novo Álbum button', async () => {
    mockedApi.get.mockResolvedValue({ data: [] })
    renderAlbumList()

    expect(screen.getByText('+ Novo Álbum')).toBeInTheDocument()
  })

  it('shows create form when clicking + Novo Álbum', async () => {
    mockedApi.get.mockResolvedValue({ data: [] })
    renderAlbumList()

    fireEvent.click(screen.getByText('+ Novo Álbum'))

    expect(screen.getByText('Novo Álbum')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nome do álbum')).toBeInTheDocument()
  })

  it('hides create form when clicking Cancelar', async () => {
    mockedApi.get.mockResolvedValue({ data: [] })
    renderAlbumList()

    fireEvent.click(screen.getByText('+ Novo Álbum'))
    expect(screen.getByText('Novo Álbum')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Cancelar'))
    expect(screen.queryByText('Novo Álbum')).not.toBeInTheDocument()
  })

  it('filter buttons are rendered', async () => {
    mockedApi.get.mockResolvedValue({ data: [] })
    renderAlbumList()

    expect(screen.getByText('Todos')).toBeInTheDocument()
    expect(screen.getByText('Período')).toBeInTheDocument()
    expect(screen.getByText('Viagem')).toBeInTheDocument()
    expect(screen.getByText('Momento')).toBeInTheDocument()
  })

  it('filters albums by type', async () => {
    mockedApi.get.mockResolvedValue({ data: mockAlbums })
    renderAlbumList()

    await waitFor(() => {
      expect(screen.getByText('Viagem ao Sul')).toBeInTheDocument()
    })

    // Filter to show only 'viagem' — use button in filter bar (not album type label)
    const filterButtons = screen.getAllByText('Viagem')
    fireEvent.click(filterButtons[0]) // first match is the filter button

    expect(screen.getByText('Viagem ao Sul')).toBeInTheDocument()
    expect(screen.queryByText('Aniversário')).not.toBeInTheDocument()
    expect(screen.queryByText('Anos 80')).not.toBeInTheDocument()
  })

  it('shows photo count per album', async () => {
    mockedApi.get.mockResolvedValue({ data: mockAlbums })
    renderAlbumList()

    await waitFor(() => {
      expect(screen.getByText('5 fotos')).toBeInTheDocument()
    })
  })

  it('creates album and closes form on success', async () => {
    mockedApi.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValue({ data: [mockAlbums[0]] })
    mockedApi.post.mockResolvedValue({ data: mockAlbums[0] })

    renderAlbumList()

    await waitFor(() => expect(screen.getByText('+ Novo Álbum')).toBeInTheDocument())

    fireEvent.click(screen.getByText('+ Novo Álbum'))
    fireEvent.change(screen.getByPlaceholderText('Nome do álbum'), { target: { value: 'Meu Álbum' } })
    fireEvent.click(screen.getByText('Criar'))

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith('/albums', expect.objectContaining({ name: 'Meu Álbum' }))
    })
  })
})
