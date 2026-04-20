export interface Radio {
  id: number
  user_id: number
  name: string
  stream_url: string
  logo_url: string | null
  genre: string | null
  is_favorite: boolean
  order: number
}

export interface RadioBrowserResult {
  stationuuid: string
  name: string
  url: string
  url_resolved: string
  favicon: string
  tags: string
  country: string
  language: string
}
