import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Apartment, Booking } from '@/types/rental'
import { Button } from '@/components/ui/button'
import ApartmentForm from '@/components/rental/ApartmentForm'
import BookingForm from '@/components/rental/BookingForm'
import PaymentForm from '@/components/rental/PaymentForm'

export default function ApartamentoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [addPaymentTo, setAddPaymentTo] = useState<number | null>(null)
  const [editBookingId, setEditBookingId] = useState<number | null>(null)
  const [editingApartment, setEditingApartment] = useState(false)

  const { data: apartment } = useQuery<Apartment>({
    queryKey: ['apartment', id],
    queryFn: () => api.get<Apartment>(`/apartments/${id}`).then((r) => r.data),
    enabled: !!id,
  })

  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ['apartment-bookings', id],
    queryFn: () => api.get<Booking[]>(`/apartments/${id}/bookings`).then((r) => r.data),
    enabled: !!id,
  })

  const deleteBookingMutation = useMutation({
    mutationFn: (bookingId: number) => api.delete(`/bookings/${bookingId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apartment-bookings', id] }),
  })

  const deletePaymentMutation = useMutation({
    mutationFn: (paymentId: number) => api.delete(`/payments/${paymentId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apartment-bookings', id] }),
  })

  const syncMutation = useMutation({
    mutationFn: () => api.post(`/apartments/${id}/sync-airbnb`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apartment-bookings', id] }),
  })

  if (!apartment) {
    return <div className="px-6 py-10 text-creme-papel/50">Carregando…</div>
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 pb-16">
      <Link
        to="/area-pessoal/locacoes"
        className="font-sans text-sm text-creme-papel/40 hover:text-creme-papel/70 mb-4 inline-block"
      >
        ← Todas as locações
      </Link>

      <div className="mb-8">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <h1 className="font-serif text-3xl text-dourado-vintage">{apartment.name}</h1>
            {apartment.address && (
              <p className="font-script text-madeira-clara text-sm mt-1">{apartment.address}</p>
            )}
            {apartment.notes && (
              <p className="font-sans text-sm text-creme-papel/60 mt-2">{apartment.notes}</p>
            )}
          </div>
          <button
            onClick={() => setEditingApartment((v) => !v)}
            className="text-dourado-vintage/60 hover:text-dourado-vintage text-xl mt-1"
            aria-label="Editar apartamento"
            title="Editar"
          >
            ✏️
          </button>
        </div>

        {editingApartment && (
          <div className="mt-4">
            <ApartmentForm
              apartment={apartment}
              onCancel={() => setEditingApartment(false)}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['apartment', id] })
                queryClient.invalidateQueries({ queryKey: ['apartments'] })
                setEditingApartment(false)
              }}
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Button onClick={() => setShowBookingForm((v) => !v)}>
          {showBookingForm ? 'Fechar' : '+ Nova locação'}
        </Button>
        {apartment.airbnb_ical_url && (
          <Button
            variant="secondary"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
          >
            {syncMutation.isPending ? 'Sincronizando…' : '🔄 Sincronizar Airbnb'}
          </Button>
        )}
      </div>

      {showBookingForm && (
        <BookingForm
          apartmentId={Number(id)}
          onCancel={() => setShowBookingForm(false)}
          onSuccess={() => {
            setShowBookingForm(false)
            queryClient.invalidateQueries({ queryKey: ['apartment-bookings', id] })
          }}
        />
      )}

      <div className="flex flex-col gap-4">
        {bookings.map((b, i) => {
          const isBlock = b.tenant_name === 'Bloqueado (calendário)'
          const reservationUrl = extractUrl(b.notes)
          return (
          <motion.div
            key={b.id}
            className={`card-vintage p-4 ${isBlock ? 'opacity-70 border-creme-papel/10' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-serif text-lg text-creme-papel flex items-center gap-2">
                  {isBlock && <span aria-hidden="true">🔒</span>}
                  {b.tenant_name}
                </p>
                <p className="font-sans text-xs text-creme-papel/60">
                  {formatDate(b.check_in)} → {b.check_out ? formatDate(b.check_out) : 'em aberto'}
                  {' · '}
                  <span className="uppercase">{b.rental_type}</span>
                  {' · '}
                  {b.platform === 'airbnb' ? 'Airbnb' : 'Direto'}
                  {b.price_per_period && ` · R$ ${parseFloat(b.price_per_period).toFixed(2)}`}
                </p>
                {b.tenant_contact && (
                  <p className="font-script text-xs text-madeira-clara mt-1">
                    {b.tenant_contact}
                  </p>
                )}
                {reservationUrl && (
                  <a
                    href={reservationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-xs font-sans text-dourado-vintage hover:underline"
                  >
                    🔗 Abrir reserva no Airbnb
                  </a>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditBookingId(editBookingId === b.id ? null : b.id)}
                  className="text-dourado-vintage/60 hover:text-dourado-vintage text-lg min-w-[36px] min-h-[36px] flex items-center justify-center"
                  aria-label="Editar locação"
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  onClick={() => {
                    if (confirm('Excluir essa locação?')) deleteBookingMutation.mutate(b.id)
                  }}
                  className="text-red-400/50 hover:text-red-400 text-lg min-w-[36px] min-h-[36px] flex items-center justify-center"
                  aria-label="Excluir locação"
                >
                  ✕
                </button>
              </div>
            </div>

            {editBookingId === b.id && (
              <div className="mt-3">
                <BookingForm
                  apartmentId={Number(id)}
                  booking={b}
                  onCancel={() => setEditBookingId(null)}
                  onSuccess={() => {
                    setEditBookingId(null)
                    queryClient.invalidateQueries({ queryKey: ['apartment-bookings', id] })
                  }}
                />
              </div>
            )}

            <div className="border-t border-madeira-clara/20 mt-3 pt-3">
              <div className="flex justify-between items-center mb-2">
                <p className="font-sans text-xs text-creme-papel/50 uppercase tracking-wider">
                  Pagamentos
                </p>
                <button
                  onClick={() => setAddPaymentTo(addPaymentTo === b.id ? null : b.id)}
                  className="text-xs font-sans text-dourado-vintage hover:underline"
                >
                  {addPaymentTo === b.id ? 'Cancelar' : '+ Pagamento'}
                </button>
              </div>

              {addPaymentTo === b.id && (
                <PaymentForm
                  bookingId={b.id}
                  onSuccess={() => {
                    setAddPaymentTo(null)
                    queryClient.invalidateQueries({ queryKey: ['apartment-bookings', id] })
                  }}
                />
              )}

              {(b.payments?.length ?? 0) === 0 ? (
                <p className="font-sans text-xs text-creme-papel/40 italic">Nenhum pagamento.</p>
              ) : (
                <ul className="space-y-1">
                  {b.payments!.map((p) => (
                    <li
                      key={p.id}
                      className="flex justify-between items-center text-sm font-sans text-creme-papel/80"
                    >
                      <span>
                        R$ {parseFloat(p.amount).toFixed(2)}{' '}
                        <span className="text-creme-papel/40">em {formatDate(p.paid_at)}</span>
                        {p.period_label && (
                          <span className="text-madeira-clara font-script ml-2">
                            {p.period_label}
                          </span>
                        )}
                      </span>
                      <button
                        onClick={() => {
                          if (confirm('Excluir esse pagamento?'))
                            deletePaymentMutation.mutate(p.id)
                        }}
                        className="text-red-400/40 hover:text-red-400 text-sm"
                        aria-label="Excluir pagamento"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
          )
        })}

        {bookings.length === 0 && !showBookingForm && (
          <div className="text-center py-12 card-vintage">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-sans text-creme-papel/50 mb-3">Nenhuma locação cadastrada</p>
            <Button onClick={() => setShowBookingForm(true)}>Cadastrar primeira</Button>
          </div>
        )}
      </div>
    </div>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`
}

function extractUrl(text: string | null): string | null {
  if (!text) return null
  const match = text.match(/(https?:\/\/\S+)/)
  return match ? match[1] : null
}
