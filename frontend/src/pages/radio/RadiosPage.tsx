import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Radio, RadioBrowserResult } from '@/types/radio'
import RadioPlayer from '@/components/radio/RadioPlayer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function RadiosPage() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<RadioBrowserResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [manualName, setManualName] = useState('')
  const [manualUrl, setManualUrl] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  const { data: radios } = useQuery<Radio[]>({
    queryKey: ['radios'],
    queryFn: () => api.get<Radio[]>('/radios').then((r) => r.data),
    initialData: [],
  })

  const addMutation = useMutation({
    mutationFn: (data: { name: string; stream_url: string; genre?: string }) =>
      api.post<Radio>('/radios', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radios'] })
      setManualName('')
      setManualUrl('')
      setShowAdd(false)
      setSearchResults([])
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/radios/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['radios'] }),
  })

  const favoriteMutation = useMutation({
    mutationFn: (id: number) => api.put(`/radios/${id}/favorite`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['radios'] }),
  })

  async function searchRadios() {
    if (!searchTerm.trim()) return
    setSearching(true)

    try {
      const res = await fetch(
        `https://de1.api.radio-browser.info/json/stations/search?name=${encodeURIComponent(searchTerm)}&limit=10&order=votes&reverse=true`,
      )
      const data = (await res.json()) as RadioBrowserResult[]
      setSearchResults(data)
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 pb-32">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl text-dourado-vintage">Minhas Rádios</h1>
        <Button onClick={() => setShowAdd((v) => !v)}>
          {showAdd ? 'Fechar' : '+ Adicionar'}
        </Button>
      </div>

      {/* Add radio section */}
      {showAdd && (
        <motion.div
          className="card-vintage mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="font-serif text-xl text-dourado-vintage mb-4">Buscar Rádios</p>

          {/* Search radio-browser */}
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Buscar por nome (ex: Santo Ângelo)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchRadios()}
              className="h-12"
            />
            <Button onClick={searchRadios} disabled={searching} size="sm">
              {searching ? '...' : 'Buscar'}
            </Button>
          </div>

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="flex flex-col gap-2 mb-4">
              {searchResults.map((station) => (
                <div
                  key={station.stationuuid}
                  className="flex items-center justify-between p-3 bg-verde-floresta/40 rounded-xl"
                >
                  <div>
                    <p className="font-sans text-sm text-creme-papel">{station.name}</p>
                    <p className="font-script text-xs text-madeira-clara">{station.country}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() =>
                      addMutation.mutate({
                        name: station.name,
                        stream_url: station.url_resolved || station.url,
                        genre: station.tags?.split(',')[0],
                      })
                    }
                  >
                    + Adicionar
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Manual entry */}
          <div className="border-t border-madeira-clara/20 pt-4">
            <p className="font-sans text-sm text-creme-papel/50 mb-3">Ou adicione manualmente:</p>
            <div className="flex flex-col gap-3">
              <Input
                placeholder="Nome da rádio"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                className="h-12"
              />
              <Input
                placeholder="URL do stream (https://...)"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                className="h-12"
              />
              <Button
                onClick={() => addMutation.mutate({ name: manualName, stream_url: manualUrl })}
                disabled={!manualName || !manualUrl}
              >
                Adicionar
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Radio list */}
      <div className="flex flex-col gap-3">
        {(radios ?? []).map((radio, i) => (
          <motion.button
            key={radio.id}
            type="button"
            onClick={() => setCurrentIndex(i)}
            className={`flex items-center gap-4 card-vintage p-4 text-left w-full transition-all active:scale-[0.99] ${
              i === currentIndex
                ? 'border-dourado-vintage/60 bg-dourado-vintage/5'
                : 'hover:border-madeira-clara/40'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                i === currentIndex ? 'bg-dourado-vintage/20' : 'bg-verde-musgo'
              }`}
            >
              📻
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-base text-creme-papel truncate">{radio.name}</p>
              {radio.genre && (
                <p className="font-script text-xs text-madeira-clara">{radio.genre}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation()
                  favoriteMutation.mutate(radio.id)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    e.stopPropagation()
                    favoriteMutation.mutate(radio.id)
                  }
                }}
                className={`text-xl min-w-[44px] min-h-[44px] flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
                  radio.is_favorite ? 'opacity-100' : 'opacity-30 hover:opacity-60'
                }`}
                aria-label={radio.is_favorite ? 'Remover favorito' : 'Marcar como favorito'}
              >
                ⭐
              </span>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation()
                  deleteMutation.mutate(radio.id)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    e.stopPropagation()
                    deleteMutation.mutate(radio.id)
                  }
                }}
                className="text-red-400/50 hover:text-red-400 text-lg min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Remover rádio"
              >
                ✕
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      {(radios ?? []).length === 0 && !showAdd && (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">📻</p>
          <p className="font-sans text-creme-papel/50 mb-4">Nenhuma rádio ainda</p>
          <Button onClick={() => setShowAdd(true)}>Adicionar Rádio</Button>
        </div>
      )}

      {/* Persistent player */}
      {(radios ?? []).length > 0 && (
        <RadioPlayer
          radios={radios ?? []}
          currentIndex={Math.min(currentIndex, (radios ?? []).length - 1)}
          onIndexChange={setCurrentIndex}
        />
      )}
    </div>
  )
}
