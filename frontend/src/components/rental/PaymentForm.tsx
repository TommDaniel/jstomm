import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  bookingId: number
  onSuccess: () => void
}

export default function PaymentForm({ bookingId, onSuccess }: Props) {
  const [form, setForm] = useState({
    amount: '',
    paid_at: new Date().toISOString().slice(0, 10),
    period_label: '',
  })

  const mutation = useMutation({
    mutationFn: () =>
      api.post(`/bookings/${bookingId}/payments`, {
        amount: Number(form.amount),
        paid_at: form.paid_at,
        period_label: form.period_label || null,
      }),
    onSuccess,
  })

  return (
    <div className="flex flex-col gap-2 mb-3 p-3 bg-verde-musgo/20 rounded-lg">
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          step="0.01"
          placeholder="Valor R$"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="h-10"
        />
        <Input
          type="date"
          value={form.paid_at}
          onChange={(e) => setForm({ ...form, paid_at: e.target.value })}
          className="h-10"
        />
      </div>
      <Input
        placeholder="Referência (ex: Abril/2026)"
        value={form.period_label}
        onChange={(e) => setForm({ ...form, period_label: e.target.value })}
        className="h-10"
      />
      <Button
        onClick={() => mutation.mutate()}
        disabled={!form.amount || !form.paid_at || mutation.isPending}
        size="sm"
      >
        {mutation.isPending ? 'Salvando…' : 'Registrar pagamento'}
      </Button>
    </div>
  )
}
