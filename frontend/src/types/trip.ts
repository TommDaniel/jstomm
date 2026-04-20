export interface TripPoint {
  id: number
  trip_id: number
  name: string
  latitude: number
  longitude: number
  order: number
  km_from_previous: number
  arrival_date: string | null
  description: string | null
  photo_id: number | null
  is_car_route: boolean
  is_hub: boolean
}

export interface Trip {
  id: number
  name: string
  year: number | null
  description: string | null
  total_km: number
  category: 'rs' | 'brasil' | 'internacional'
  points?: TripPoint[]
}
