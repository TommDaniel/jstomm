export type PhotoCategory =
  | 'familia'
  | 'viagem'
  | 'evento'
  | 'retrato'
  | 'escritorio'
  | 'paisagem'
  | 'documento'
  | 'outros'

export const PHOTO_CATEGORIES: { value: PhotoCategory; label: string; emoji: string }[] = [
  { value: 'familia', label: 'Família', emoji: '👨‍👩‍👧' },
  { value: 'viagem', label: 'Viagem', emoji: '✈️' },
  { value: 'evento', label: 'Evento', emoji: '🎉' },
  { value: 'retrato', label: 'Retrato', emoji: '🧑' },
  { value: 'escritorio', label: 'Escritório', emoji: '💼' },
  { value: 'paisagem', label: 'Paisagem', emoji: '🏞️' },
  { value: 'documento', label: 'Documento', emoji: '📄' },
  { value: 'outros', label: 'Outros', emoji: '📸' },
]

export interface Photo {
  id: number
  album_id: number
  path: string
  thumbnail_path: string | null
  caption: string | null
  taken_at: string | null
  width: number
  height: number
  category: PhotoCategory | null
  category_confidence: number | null
  classified_at: string | null
  phash: string | null
}

export interface Album {
  id: number
  user_id: number
  name: string
  type: 'periodo' | 'viagem' | 'momento'
  cover_photo_id: number | null
  photos_count?: number
}

export interface PaginatedPhotos {
  data: Photo[]
  current_page: number
  last_page: number
  total: number
}
