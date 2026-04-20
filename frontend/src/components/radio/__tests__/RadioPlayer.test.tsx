import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import RadioPlayer from '../RadioPlayer'
import type { Radio } from '@/types/radio'

vi.mock('howler', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Howl: vi.fn().mockImplementation(function (this: any) {
    this.play = vi.fn()
    this.pause = vi.fn()
    this.stop = vi.fn()
    this.unload = vi.fn()
    this.volume = vi.fn()
  }),
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const mockRadios: Radio[] = [
  { id: 1, user_id: 1, name: 'Rádio Gaúcha', stream_url: 'https://stream.example.com/1', logo_url: null, genre: 'gaúcha', is_favorite: false, order: 0 },
  { id: 2, user_id: 1, name: 'Band FM', stream_url: 'https://stream.example.com/2', logo_url: null, genre: 'pop', is_favorite: true, order: 1 },
]

describe('RadioPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the first radio name', () => {
    render(<RadioPlayer radios={mockRadios} />)

    expect(screen.getByText('Rádio Gaúcha')).toBeInTheDocument()
  })

  it('renders genre when provided', () => {
    render(<RadioPlayer radios={mockRadios} />)

    expect(screen.getByText(/gaúcha/)).toBeInTheDocument()
  })

  it('shows play button initially', () => {
    render(<RadioPlayer radios={mockRadios} />)

    expect(screen.getByLabelText('Tocar')).toBeInTheDocument()
  })

  it('shows next button when there are multiple radios', () => {
    render(<RadioPlayer radios={mockRadios} />)

    expect(screen.getByLabelText('Próxima rádio')).toBeInTheDocument()
  })

  it('does not show next button with single radio', () => {
    render(<RadioPlayer radios={[mockRadios[0]]} />)

    expect(screen.queryByLabelText('Próxima rádio')).not.toBeInTheDocument()
  })

  it('returns null when radios array is empty', () => {
    const { container } = render(<RadioPlayer radios={[]} />)

    expect(container.firstChild).toBeNull()
  })

  it('has volume slider', () => {
    render(<RadioPlayer radios={mockRadios} />)

    expect(screen.getByLabelText('Volume')).toBeInTheDocument()
  })

  it('shows station selector dots for multiple radios', () => {
    render(<RadioPlayer radios={mockRadios} />)

    expect(screen.getByLabelText('Rádio 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Rádio 2')).toBeInTheDocument()
  })

  it('clicking play button starts loading (calls Howl)', async () => {
    const { Howl } = await import('howler')
    render(<RadioPlayer radios={mockRadios} />)

    fireEvent.click(screen.getByLabelText('Tocar'))

    expect(Howl).toHaveBeenCalledWith(
      expect.objectContaining({
        src: ['https://stream.example.com/1'],
        html5: true,
      })
    )
  })

  it('clicking next switches to second radio', () => {
    render(<RadioPlayer radios={mockRadios} />)

    fireEvent.click(screen.getByLabelText('Próxima rádio'))

    expect(screen.getByText('Band FM')).toBeInTheDocument()
  })

  it('clicking station dot switches to that radio', () => {
    render(<RadioPlayer radios={mockRadios} />)

    fireEvent.click(screen.getByLabelText('Rádio 2'))

    expect(screen.getByText('Band FM')).toBeInTheDocument()
  })

  it('volume slider has correct initial value', () => {
    render(<RadioPlayer radios={mockRadios} />)

    const slider = screen.getByLabelText('Volume') as HTMLInputElement
    expect(slider.value).toBe('0.8')
  })
})
