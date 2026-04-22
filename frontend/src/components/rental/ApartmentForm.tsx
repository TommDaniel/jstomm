import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Apartment } from '@/types/rental'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  apartment?: Apartment
  onSuccess: () => void
  onCancel: () => void
}

export default function ApartmentForm({ apartment, onSuccess, onCancel }: Props) {
  const isEdit = !!apartment
  const [form, setForm] = useState({
    name: apartment?.name ?? '',
    address: apartment?.address ?? '',
    airbnb_ical_url: apartment?.airbnb_ical_url ?? '',
    notes: apartment?.notes ?? '',
  })

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name,
        address: form.address || null,
        airbnb_ical_url: form.airbnb_ical_url || null,
        notes: form.notes || null,
      }
      return isEdit
        ? api.put<Apartment>(`/apartments/${apartment!.id}`, payload)
        : api.post<Apartment>('/apartments', payload)
    },
    onSuccess,
  })

  return (
    <motion.div
      className="card-vintage mb-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p className="font-serif text-xl text-dourado-vintage mb-4">
        {isEdit ? 'Editar Apartamento' : 'Novo Apartamento'}
      </p>
      <div className="flex flex-col gap-3">
        <Input
          placeholder="Nome (ex: Kitnet 201)"
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

        <div className="flex gap-2">
          <Button
            onClick={() => mutation.mutate()}
            disabled={!form.name || mutation.isPending}
            className="flex-1"
          >
            {mutation.isPending
              ? 'Salvando…'
              : isEdit
                ? 'Salvar alterações'
                : 'Adicionar'}
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
