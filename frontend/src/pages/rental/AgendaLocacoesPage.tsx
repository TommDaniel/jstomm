import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Apartment, Booking } from '@/types/rental'
import { Button } from '@/components/ui/button'

const DAY_WIDTH_PX = 28 // largura de cada dia no grid
const ROW_HEIGHT_PX = 56
const MONTHS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
]

function startOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
}

function addMonths(d: Date, n: number): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1))
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

function parseIsoDate(iso: string): Date {
  // DB manda "2026-04-21T00:00:00.000000Z" ou "2026-04-21"
  const s = iso.slice(0, 10)
  const [y, m, d] = s.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

function fmt(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function AgendaLocacoesPage() {
  // Range: 3 meses visíveis (mês atual + 2 seguintes), navegável
  const [anchorMonth, setAnchorMonth] = useState(() => startOfMonth(new Date()))

  const rangeStart = anchorMonth
  const rangeEnd = addMonths(anchorMonth, 3) // exclusivo
  const totalDays = daysBetween(rangeStart, rangeEnd)

  const { data: apartments = [], isLoading } = useQuery<Apartment[]>({
    queryKey: ['agenda', fmt(rangeStart), fmt(rangeEnd)],
    queryFn: () =>
      api
        .get<Apartment[]>('/agenda', {
          params: { from: fmt(rangeStart), to: fmt(addMonths(rangeEnd, 0)) },
        })
        .then((r) => r.data),
  })

  const today = useMemo(() => {
    const now = new Date()
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  }, [])

  // Header: lista de dias com divisores de mês
  const dayHeaders = useMemo(() => {
    const out: { date: Date; isFirst: boolean }[] = []
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(rangeStart.getTime() + i * 86400000)
      out.push({ date: d, isFirst: d.getUTCDate() === 1 })
    }
    return out
  }, [rangeStart, totalDays])

  return (
    <div className="max-w-[95vw] mx-auto px-4 py-10 pb-16">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Link
          to="/area-pessoal/locacoes"
          className="font-sans text-sm text-creme-papel/40 hover:text-creme-papel/70"
        >
          ← Lista
        </Link>
        <h1 className="font-serif text-3xl text-dourado-vintage flex-1">Agenda</h1>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setAnchorMonth(addMonths(anchorMonth, -1))}>
            ← Mês
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setAnchorMonth(startOfMonth(new Date()))}>
            Hoje
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setAnchorMonth(addMonths(anchorMonth, 1))}>
            Mês →
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-5 mb-4 text-xs font-sans text-creme-papel/60">
        <LegendSwatch color="#C9A961" label="Airbnb" />
        <LegendSwatch color="#7C9374" label="Direto" />
        <span className="ml-auto text-creme-papel/40">
          {MONTHS[rangeStart.getUTCMonth()]} → {MONTHS[addMonths(rangeEnd, -1).getUTCMonth()]}{' '}
          {addMonths(rangeEnd, -1).getUTCFullYear()}
        </span>
      </div>

      {isLoading && <p className="font-sans text-creme-papel/50">Carregando…</p>}

      {!isLoading && apartments.length === 0 && (
        <div className="text-center py-16 card-vintage">
          <p className="text-4xl mb-3">🏠</p>
          <p className="font-sans text-creme-papel/50">
            Cadastre apartamentos primeiro pra ver a agenda.
          </p>
        </div>
      )}

      {!isLoading && apartments.length > 0 && (
        <div className="card-vintage p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `200px repeat(${totalDays}, ${DAY_WIDTH_PX}px)`,
              }}
              className="relative"
            >
              {/* Header — vazio sobre os nomes dos aptos */}
              <div className="sticky left-0 z-20 bg-verde-floresta border-r border-madeira-clara/20 border-b border-madeira-clara/10 px-3 py-2 font-script text-dourado-vintage text-sm">
                Apartamento
              </div>

              {/* Header — dias */}
              {dayHeaders.map((h, i) => (
                <div
                  key={i}
                  className={`border-b border-madeira-clara/10 px-1 py-1 text-center text-[10px] font-sans ${
                    h.isFirst ? 'border-l border-l-dourado-vintage/40' : ''
                  } ${
                    h.date.getTime() === today.getTime()
                      ? 'bg-dourado-vintage/20 text-dourado-vintage font-bold'
                      : 'text-creme-papel/50'
                  }`}
                >
                  {h.isFirst && (
                    <div className="text-dourado-vintage font-serif text-[11px] leading-none mb-0.5">
                      {MONTHS[h.date.getUTCMonth()]}
                    </div>
                  )}
                  {h.date.getUTCDate()}
                </div>
              ))}

              {/* Linhas dos apartamentos */}
              {apartments.map((apt, rowIdx) => (
                <AgendaRow
                  key={apt.id}
                  apt={apt}
                  rangeStart={rangeStart}
                  totalDays={totalDays}
                  rowIdx={rowIdx}
                  today={today}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface RowProps {
  apt: Apartment
  rangeStart: Date
  totalDays: number
  rowIdx: number
  today: Date
}

function AgendaRow({ apt, rangeStart, totalDays, rowIdx, today }: RowProps) {
  return (
    <>
      {/* Nome do apto — coluna fixa */}
      <Link
        to={`/area-pessoal/locacoes/${apt.id}`}
        className="sticky left-0 z-10 bg-verde-floresta border-r border-madeira-clara/20 border-b border-madeira-clara/10 px-3 py-2 font-sans text-sm text-creme-papel hover:text-dourado-vintage transition-colors truncate"
        style={{ gridColumn: 1, gridRow: rowIdx + 2, height: ROW_HEIGHT_PX }}
      >
        <div className="flex items-center h-full">
          <span className="truncate">{apt.name}</span>
        </div>
      </Link>

      {/* Cells do row — background + divisores */}
      {Array.from({ length: totalDays }).map((_, i) => {
        const cellDate = new Date(rangeStart.getTime() + i * 86400000)
        const isFirst = cellDate.getUTCDate() === 1
        const isToday = cellDate.getTime() === today.getTime()
        return (
          <div
            key={i}
            className={`border-b border-madeira-clara/10 ${isFirst ? 'border-l border-l-dourado-vintage/40' : ''} ${
              isToday ? 'bg-dourado-vintage/10' : ''
            }`}
            style={{ gridColumn: i + 2, gridRow: rowIdx + 2 }}
          />
        )
      })}

      {/* Barras das bookings — posicionadas absolutamente */}
      {(apt.bookings ?? []).map((b) => (
        <BookingBar
          key={b.id}
          booking={b}
          rangeStart={rangeStart}
          totalDays={totalDays}
          rowIdx={rowIdx}
        />
      ))}
    </>
  )
}

function BookingBar({
  booking,
  rangeStart,
  totalDays,
  rowIdx,
}: {
  booking: Booking
  rangeStart: Date
  totalDays: number
  rowIdx: number
}) {
  const checkIn = parseIsoDate(booking.check_in)
  const checkOut = booking.check_out
    ? parseIsoDate(booking.check_out)
    : new Date(rangeStart.getTime() + totalDays * 86400000)

  const startOffset = Math.max(0, daysBetween(rangeStart, checkIn))
  const endOffset = Math.min(totalDays, daysBetween(rangeStart, checkOut) + 1)
  const span = endOffset - startOffset

  if (span <= 0) return null

  const color = booking.platform === 'airbnb' ? '#C9A961' : '#7C9374'
  const label = booking.tenant_name

  return (
    <motion.div
      className="relative cursor-pointer group"
      style={{
        gridColumn: `${startOffset + 2} / span ${span}`,
        gridRow: rowIdx + 2,
        alignSelf: 'center',
        marginInline: 2,
        height: ROW_HEIGHT_PX - 18,
      }}
      initial={{ opacity: 0, scaleX: 0.8 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.3 }}
      title={`${label} (${booking.check_in.slice(0, 10)} → ${booking.check_out?.slice(0, 10) ?? 'em aberto'})`}
    >
      <div
        className="h-full rounded-md px-2 flex items-center text-xs font-sans truncate shadow-sm hover:shadow-md transition-shadow"
        style={{
          background: color,
          color: '#1F3A2E',
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </motion.div>
  )
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block w-3 h-3 rounded-sm"
        style={{ background: color }}
      />
      {label}
    </span>
  )
}
