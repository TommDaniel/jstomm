import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Apartment } from '@/types/rental'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ApartamentosPage() {
  const queryClient = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', address: '', airbnb_ical_url: '', notes: '' })

  const { data: apartments = [] } = useQuery<Apartment[]>({
    queryKey: ['apartments'],
    queryFn: () => api.get<Apartment[]>('/apartments').then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post<Apartment>('/apartments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apartments'] })
      setForm({ name: '', address: '', airbnb_ical_url: '', notes: '' })
      setShowAdd(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/apartments/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apartments'] }),
  })

  const syncMutation = useMutation({
    mutationFn: (id: number) => api.post(`/apartments/${id}/sync-airbnb`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apartments'] }),
  })

  function currentTenant(apt: Apartment): string | null {
    if (!apt.bookings || apt.bookings.length === 0) return null
    const b = apt.bookings[0]
    return `${b.tenant_name} · até ${b.check_out ? formatDate(b.check_out) : 'sem data'}`
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 pb-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl text-dourado-vintage">Minhas Locações</h1>
        <Button onClick={() => setShowAdd((v) => !v)}>{showAdd ? 'Fechar' : '+ Apartamento'}</Button>
      </div>

      {showAdd && (
        <motion.div className="card-vintage mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="font-serif text-xl text-dourado-vintage mb-4">Novo Apartamento</p>
          <div className="flex flex-col gap-3">
            <Input
              placeholder="Nome (ex: Apto Centro 201)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-12"
            />
            <Input
              placeholder="Endereço (opcional)"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="h-12"
            />
            <Input
              placeholder="URL iCal do Airbnb (opcional)"
              value={form.airbnb_ical_url}
              onChange={(e) => setForm({ ...form, airbnb_ical_url: e.target.value })}
              className="h-12"
            />
            <textarea
              placeholder="Notas (opcional)"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="flex w-full rounded-lg border border-madeira-clara/30 bg-verde-musgo/30 px-3 py-2 text-sm text-creme-papel placeholder:text-creme-papel/40 focus:outline-none focus:ring-2 focus:ring-dourado-vintage/60 min-h-[80px]"
            />
            <Button
              onClick={() => createMutation.mutate(form)}
              disabled={!form.name || createMutation.isPending}
            >
              {createMutation.isPending ? 'Salvando...' : 'Adicionar'}
            </Button>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col gap-3">
        {apartments.map((apt, i) => (
          <motion.div
            key={apt.id}
            className="card-vintage p-4 flex items-center gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={`/area-pessoal/locacoes/${apt.id}`}
              className="flex items-center gap-4 flex-1 min-w-0"
            >
              <div className="w-10 h-10 rounded-full bg-verde-musgo flex items-center justify-center flex-shrink-0">
                🏠
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-base text-creme-papel truncate">{apt.name}</p>
                {apt.address && (
                  <p className="font-script text-xs text-madeira-clara truncate">{apt.address}</p>
                )}
                <p className="font-sans text-xs text-creme-papel/50 mt-1 truncate">
                  {currentTenant(apt) ?? 'Livre'} · {apt.bookings_count ?? 0} reserva(s)
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-1">
              {apt.airbnb_ical_url && (
                <button
                  onClick={() => syncMutation.mutate(apt.id)}
                  disabled={syncMutation.isPending}
                  className="text-xs px-2 py-2 text-creme-papel/60 hover:text-dourado-vintage transition-colors"
                  aria-label="Sincronizar Airbnb"
                >
                  🔄
                </button>
              )}
              <button
                onClick={() => {
                  if (confirm(`Excluir ${apt.name}?`)) deleteMutation.mutate(apt.id)
                }}
                className="text-red-400/50 hover:text-red-400 text-lg min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
                aria-label="Remover"
              >
                ✕
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {apartments.length === 0 && !showAdd && (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🏠</p>
          <p className="font-sans text-creme-papel/50 mb-4">Nenhum apartamento cadastrado</p>
          <Button onClick={() => setShowAdd(true)}>Cadastrar primeiro</Button>
        </div>
      )}
    </div>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}
