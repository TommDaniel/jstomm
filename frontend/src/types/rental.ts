export type RentalType = 'diaria' | 'semanal' | 'mensal' | 'anual'
export type Platform = 'direto' | 'airbnb'

export interface Apartment {
  id: number
  user_id: number
  name: string
  address: string | null
  airbnb_ical_url: string | null
  notes: string | null
  bookings_count?: number
  bookings?: Booking[]
  created_at?: string
  updated_at?: string
}

export interface Booking {
  id: number
  apartment_id: number
  tenant_name: string
  tenant_contact: string | null
  check_in: string
  check_out: string | null
  rental_type: RentalType
  platform: Platform
  price_per_period: string | null
  external_uid: string | null
  notes: string | null
  payments?: Payment[]
  created_at?: string
  updated_at?: string
}

export interface Payment {
  id: number
  booking_id: number
  amount: string
  paid_at: string
  period_label: string | null
  created_at?: string
  updated_at?: string
}
