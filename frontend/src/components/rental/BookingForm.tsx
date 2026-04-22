import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Booking, Platform, RentalType } from '@/types/rental'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  apartmentId: number
  onSuccess: () => void
  onCancel: () => void
  booking?: Booking
}

const RENTAL_TYPES: { value: RentalType; label: string }[] = [
  { value: 'diaria', label: 'Diária' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'mensal', label: 'Mensal' },
  { value: 'anual', label: 'Anual' },
]

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'direto', label: 'Direto' },
  { value: 'airbnb', label: 'Airbnb' },
]

export default function BookingForm({ apartmentId, onSuccess, onCancel, booking }: Props) {
  const isEdit = !!booking
  const [form, setForm] = useState({
    tenant_name: booking?.tenant_name ?? '',
    tenant_contact: booking?.tenant_contact ?? '',
    check_in: booking?.check_in?.slice(0, 10) ?? '',
    check_out: booking?.check_out?.slice(0, 10) ?? '',
    rental_type: (booking?.rental_type ?? 'mensal') as RentalType,
    platform: (booking?.platform ?? 'direto') as Platform,
    price_per_period: booking?.price_per_period
      ? String(parseFloat(booking.price_per_period))
      : '',
    notes: booking?.notes ?? '',
  })

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        check_out: form.check_out || null,
        price_per_period: form.price_per_period ? Number(form.price_per_period) : null,
        tenant_contact: form.tenant_contact || null,
        notes: form.notes || null,
      }
      return isEdit
        ? api.put<Booking>(`/bookings/${booking!.id}`, payload)
        : api.post<Booking>(`/apartments/${apartmentId}/bookings`, payload)
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
        {isEdit ? 'Editar Locação' : 'Nova Locação'}
      </p>
      <div className="flex flex-col gap-3">
        <Input
          placeholder="Nome do inquilino"
          value={form.tenant_name}
          onChange={(e) => setForm({ ...form, tenant_name: e.target.value })}
          className="h-12"
        />
        <Input
          placeholder="Telefone / email (opcional)"
          value={form.tenant_contact}
          onChange={(e) => setForm({ ...form, tenant_contact: e.target.value })}
          className="h-12"
        />

        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs font-sans text-creme-papel/60">
            Entrada
            <Input
              type="date"
              value={form.check_in}
              onChange={(e) => setForm({ ...form, check_in: e.target.value })}
              className="h-12 mt-1"
            />
          </label>
          <label className="text-xs font-sans text-creme-papel/60">
            Saída (opcional)
            <Input
              type="date"
              value={form.check_out}
              onChange={(e) => setForm({ ...form, check_out: e.target.value })}
              className="h-12 mt-1"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SelectGroup
            label="Tipo"
            value={form.rental_type}
            onChange={(v) => setForm({ ...form, rental_type: v as RentalType })}
            options={RENTAL_TYPES}
          />
          <SelectGroup
            label="Plataforma"
            value={form.platform}
            onChange={(v) => setForm({ ...form, platform: v as Platform })}
            options={PLATFORMS}
          />
        </div>

        <Input
          placeholder="Valor do período (R$, opcional)"
          type="number"
          step="0.01"
          value={form.price_per_period}
          onChange={(e) => setForm({ ...form, price_per_period: e.target.value })}
          className="h-12"
        />

        <textarea
          placeholder="Notas (opcional)"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="flex w-full rounded-lg border border-madeira-clara/30 bg-verde-musgo/30 px-3 py-2 text-sm text-creme-papel placeholder:text-creme-papel/40 focus:outline-none focus:ring-2 focus:ring-dourado-vintage/60 min-h-[60px]"
        />

        <div className="flex gap-2">
          <Button
            onClick={() => mutation.mutate()}
            disabled={!form.tenant_name || !form.check_in || mutation.isPending}
            className="flex-1"
          >
            {mutation.isPending
              ? 'Salvando…'
              : isEdit
                ? 'Salvar alterações'
                : 'Adicionar locação'}
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

interface SelectProps<T extends string> {
  label: string
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}

function SelectGroup<T extends string>({ label, value, onChange, options }: SelectProps<T>) {
  return (
    <div>
      <p className="text-xs font-sans text-creme-papel/60 mb-1">{label}</p>
      <div className="flex gap-1 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3 py-2 rounded-lg text-xs font-sans transition-all ${
              value === opt.value
                ? 'bg-dourado-vintage/20 text-dourado-vintage border border-dourado-vintage/40'
                : 'bg-verde-musgo/30 text-creme-papel/60 border border-madeira-clara/20 hover:border-madeira-clara/40'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
