import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AlbumDetailPage from '../AlbumDetailPage'

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
  },
}))

vi.mock('yet-another-react-lightbox', () => ({
  default: ({ open }: { open: boolean }) => open ? <div data-testid="lightbox">Lightbox</div> : null,
}))

vi.mock('@/components/gallery/PhotoUploader', () => ({
  default: ({ onUploaded }: { onUploaded: () => void }) => (
    <div data-testid="photo-uploader">
      <button onClick={onUploaded}>Upload Done</button>
    </div>
  ),
}))

import { api } from '@/lib/api'
const mockedApi = api as { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> }

function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

function mockApiForAlbum() {
  mockedApi.get.mockImplementation((url: string) => {
    if (String(url).includes('photos')) return Promise.resolve({ data: mockPhotos })
    return Promise.resolve({ data: mockAlbum })
  })
}

function renderAlbumDetail(albumId = '1') {
  return render(
    <QueryClientProvider client={makeClient()}>
      <MemoryRouter initialEntries={[`/area-pessoal/albuns/${albumId}`]}>
        <Routes>
          <Route path="/area-pessoal/albuns/:id" element={<AlbumDetailPage />} />
          <Route path="/area-pessoal/albuns" element={<div>Album List</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const mockAlbum = {
  id: 1,
  user_id: 1,
  name: 'Viagem ao Sul',
  type: 'viagem' as const,
  cover_photo_id: null,
  photos_count: 2,
}

const mockPhotos = {
  data: [
    { id: 1, album_id: 1, path: 'photos/a.jpg', thumbnail_path: null, caption: 'Praia', taken_at: null, width: 800, height: 600 },
    { id: 2, album_id: 1, path: 'photos/b.jpg', thumbnail_path: null, caption: 'Campo', taken_at: null, width: 800, height: 600 },
  ],
  current_page: 1,
  last_page: 1,
  total: 2,
}

describe('AlbumDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows album name after loading', async () => {
    mockApiForAlbum()
    renderAlbumDetail()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Viagem ao Sul' })).toBeInTheDocument()
    })
  })

  it('shows breadcrumb with albums link', async () => {
    mockApiForAlbum()
    renderAlbumDetail()

    await waitFor(() => {
      expect(screen.getByText('Álbuns')).toBeInTheDocument()
    })
  })

  it('shows photos after loading', async () => {
    mockApiForAlbum()
    renderAlbumDetail()

    await waitFor(() => {
      const imgs = screen.getAllByRole('img')
      expect(imgs).toHaveLength(2)
    })
  })

  it('shows photo caption', async () => {
    mockApiForAlbum()
    renderAlbumDetail()

    await waitFor(() => {
      expect(screen.getByText('Praia')).toBeInTheDocument()
    })
  })

  it('shows empty state when no photos', async () => {
    mockedApi.get.mockImplementation((url: string) => {
      if (String(url).includes('photos'))
        return Promise.resolve({ data: { data: [], current_page: 1, last_page: 1, total: 0 } })
      return Promise.resolve({ data: mockAlbum })
    })

    renderAlbumDetail()

    await waitFor(() => {
      expect(screen.getByText('Nenhuma foto ainda')).toBeInTheDocument()
    })
  })

  it('shows add photos button', async () => {
    mockApiForAlbum()
    renderAlbumDetail()

    await waitFor(() => {
      expect(screen.getByText('+ Adicionar Fotos')).toBeInTheDocument()
    })
  })

  it('shows uploader when clicking + Adicionar Fotos', async () => {
    mockApiForAlbum()
    renderAlbumDetail()

    await waitFor(() => expect(screen.getByText('+ Adicionar Fotos')).toBeInTheDocument())

    fireEvent.click(screen.getByText('+ Adicionar Fotos'))

    expect(screen.getByTestId('photo-uploader')).toBeInTheDocument()
  })

  it('hides uploader when clicking Cancelar', async () => {
    mockApiForAlbum()
    renderAlbumDetail()

    await waitFor(() => expect(screen.getByText('+ Adicionar Fotos')).toBeInTheDocument())

    fireEvent.click(screen.getByText('+ Adicionar Fotos'))
    expect(screen.getByTestId('photo-uploader')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Cancelar'))
    expect(screen.queryByTestId('photo-uploader')).not.toBeInTheDocument()
  })

  it('shows photo total count', async () => {
    mockApiForAlbum()
    renderAlbumDetail()

    await waitFor(() => {
      expect(screen.getByText('2 fotos')).toBeInTheDocument()
    })
  })
})
