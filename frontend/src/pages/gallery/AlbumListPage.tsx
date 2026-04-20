import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Album } from '@/types/gallery'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const TYPE_LABELS = { periodo: 'Período', viagem: 'Viagem', momento: 'Momento' }
const TYPE_ICONS = { periodo: '📅', viagem: '✈️', momento: '💛' }

const FILTER_OPTIONS: Array<{ value: '' | Album['type']; label: string }> = [
  { value: '', label: 'Todos' },
  { value: 'periodo', label: 'Período' },
  { value: 'viagem', label: 'Viagem' },
  { value: 'momento', label: 'Momento' },
]

export default function AlbumListPage() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<'' | Album['type']>('')
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<Album['type']>('momento')

  const { data: albums, isLoading } = useQuery<Album[]>({
    queryKey: ['albums'],
    queryFn: () => api.get<Album[]>('/albums').then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: () => api.post<Album>('/albums', { name: newName, type: newType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] })
      setCreating(false)
      setNewName('')
    },
  })

  const filtered = filter ? albums?.filter((a) => a.type === filter) : albums

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl text-dourado-vintage">Meus Álbuns</h1>
          <p className="font-sans text-creme-papel/50 text-base">
            {albums?.length ?? 0} álbuns
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>+ Novo Álbum</Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-4 py-2 rounded-full font-sans text-sm transition-all min-h-[44px] ${
              filter === opt.value
                ? 'bg-dourado-vintage text-preto-quente'
                : 'border border-madeira-clara/30 text-creme-papel/60 hover:border-dourado-vintage/50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Create form */}
      {creating && (
        <motion.div
          className="card-vintage mb-6"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <p className="font-serif text-xl text-dourado-vintage mb-4">Novo Álbum</p>
          <div className="flex flex-col gap-4">
            <Input
              placeholder="Nome do álbum"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="text-lg h-14"
            />
            <div className="flex gap-2">
              {(['periodo', 'viagem', 'momento'] as Album['type'][]).map((t) => (
                <button
                  key={t}
                  onClick={() => setNewType(t)}
                  className={`flex-1 py-3 rounded-xl font-sans text-sm transition-all min-h-[48px] ${
                    newType === t
                      ? 'bg-dourado-vintage text-preto-quente'
                      : 'border border-madeira-clara/30 text-creme-papel/60'
                  }`}
                >
                  {TYPE_ICONS[t]} {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => createMutation.mutate()}
                disabled={!newName || createMutation.isPending}
              >
                Criar
              </Button>
              <Button variant="ghost" onClick={() => setCreating(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Album grid */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-dourado-vintage border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered?.map((album, i) => (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/area-pessoal/albuns/${album.id}`}
                className="block card-vintage hover:border-dourado-vintage/40 transition-all p-5"
              >
                <div className="aspect-[4/3] rounded-xl bg-verde-musgo/40 flex items-center justify-center mb-4 text-4xl">
                  {TYPE_ICONS[album.type]}
                </div>
                <h3 className="font-serif text-lg text-creme-papel">{album.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-sans text-xs text-creme-papel/40">
                    {TYPE_LABELS[album.type]}
                  </span>
                  <span className="font-script text-sm text-madeira-clara">
                    {album.photos_count ?? 0} fotos
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {!isLoading && filtered?.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">📂</p>
          <p className="font-sans text-creme-papel/50">Nenhum álbum ainda</p>
        </div>
      )}
    </div>
  )
}
