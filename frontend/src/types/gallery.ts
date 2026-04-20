export interface Photo {
  id: number
  album_id: number
  path: string
  thumbnail_path: string | null
  caption: string | null
  taken_at: string | null
  width: number
  height: number
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
