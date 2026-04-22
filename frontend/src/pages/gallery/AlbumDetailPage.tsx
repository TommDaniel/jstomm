import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { api } from '@/lib/api'
import type { Album, PaginatedPhotos, Photo, PhotoCategory } from '@/types/gallery'
import { PHOTO_CATEGORIES } from '@/types/gallery'
import PhotoUploader from '@/components/gallery/PhotoUploader'
import { Button } from '@/components/ui/button'

export default function AlbumDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [lightboxIndex, setLightboxIndex] = useState(-1)
  const [showUploader, setShowUploader] = useState(false)
  const [filterCategory, setFilterCategory] = useState<PhotoCategory | null>(null)
  const [editingPhotoId, setEditingPhotoId] = useState<number | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const { data: album } = useQuery<Album>({
    queryKey: ['album', id],
    queryFn: () => api.get<Album>(`/albums/${id}`).then((r) => r.data),
  })

  const { data: photoPages } = useQuery<PaginatedPhotos>({
    queryKey: ['album-photos', id, page, filterCategory],
    queryFn: () => {
      const qs = new URLSearchParams({ page: String(page) })
      if (filterCategory) qs.set('category', filterCategory)
      return api.get<PaginatedPhotos>(`/albums/${id}/photos?${qs.toString()}`).then((r) => r.data)
    },
    enabled: !!id,
  })

  const categoryMutation = useMutation({
    mutationFn: ({ photoId, category }: { photoId: number; category: PhotoCategory }) =>
      api.put<Photo>(`/photos/${photoId}/category`, { category }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['album-photos', id] })
      setEditingPhotoId(null)
    },
  })

  const photos = photoPages?.data ?? []
  const hasMore = photoPages ? page < photoPages.last_page : false

  // Lazy load next page via intersection observer
  const loadMore = useCallback(() => {
    if (hasMore) setPage((p) => p + 1)
  }, [hasMore])

  useEffect(() => {
    if (!sentinelRef.current) return
    observerRef.current = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore() },
      { threshold: 0.1 },
    )
    observerRef.current.observe(sentinelRef.current)
    return () => observerRef.current?.disconnect()
  }, [loadMore])

  const lightboxSlides = photos.map((p) => ({
    src: `/storage/${p.path}`,
    alt: p.caption ?? '',
  }))

  function handleUploaded() {
    queryClient.invalidateQueries({ queryKey: ['album-photos', id] })
    setShowUploader(false)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 font-sans text-sm text-creme-papel/40">
        <Link to="/area-pessoal/albuns" className="hover:text-creme-papel/70 transition-colors">
          Álbuns
        </Link>
        <span>/</span>
        <span className="text-creme-papel/70">{album?.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl text-dourado-vintage">{album?.name}</h1>
          <p className="font-sans text-creme-papel/50 text-base">
            {photoPages?.total ?? 0} fotos
          </p>
        </div>
        <Button onClick={() => setShowUploader((v) => !v)}>
          {showUploader ? 'Cancelar' : '+ Adicionar Fotos'}
        </Button>
      </div>

      {/* Uploader */}
      {showUploader && id && (
        <motion.div
          className="card-vintage mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <PhotoUploader albumId={Number(id)} onUploaded={handleUploaded} />
        </motion.div>
      )}

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => {
            setFilterCategory(null)
            setPage(1)
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-sans border transition-all ${
            filterCategory === null
              ? 'bg-dourado-vintage/20 text-dourado-vintage border-dourado-vintage/40'
              : 'bg-verde-musgo/30 text-creme-papel/60 border-madeira-clara/20 hover:border-madeira-clara/40'
          }`}
        >
          Todas
        </button>
        {PHOTO_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => {
              setFilterCategory(cat.value)
              setPage(1)
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-sans border transition-all ${
              filterCategory === cat.value
                ? 'bg-dourado-vintage/20 text-dourado-vintage border-dourado-vintage/40'
                : 'bg-verde-musgo/30 text-creme-papel/60 border-madeira-clara/20 hover:border-madeira-clara/40'
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {photos.map((photo, i) => {
          const cat = PHOTO_CATEGORIES.find((c) => c.value === photo.category)
          return (
            <motion.div
              key={photo.id}
              className="relative aspect-square overflow-hidden rounded-xl group"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (i % 12) * 0.03 }}
            >
              <button
                className="absolute inset-0 w-full h-full"
                onClick={() => setLightboxIndex(i)}
                aria-label="Abrir foto"
              >
                <img
                  src={photo.thumbnail_path ? `/storage/${photo.thumbnail_path}` : `/storage/${photo.path}`}
                  alt={photo.caption ?? ''}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </button>

              {/* Category badge — clica e abre dropdown */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingPhotoId(editingPhotoId === photo.id ? null : photo.id)
                }}
                className={`absolute top-1.5 left-1.5 z-10 px-2 py-0.5 rounded-full text-[10px] font-sans backdrop-blur-sm transition-all ${
                  cat
                    ? 'bg-verde-floresta/80 text-dourado-vintage border border-dourado-vintage/40'
                    : 'bg-black/40 text-creme-papel/60 border border-madeira-clara/30'
                }`}
                title="Clique para mudar a categoria"
              >
                {cat ? `${cat.emoji} ${cat.label}` : '? sem categoria'}
              </button>

              {editingPhotoId === photo.id && (
                <div
                  className="absolute top-7 left-1.5 z-20 bg-verde-floresta/95 backdrop-blur-md border border-madeira-clara/30 rounded-lg p-1.5 shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="grid grid-cols-2 gap-1">
                    {PHOTO_CATEGORIES.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => categoryMutation.mutate({ photoId: photo.id, category: c.value })}
                        className={`px-2 py-1 rounded text-[10px] font-sans text-left hover:bg-dourado-vintage/20 ${
                          photo.category === c.value
                            ? 'text-dourado-vintage bg-dourado-vintage/10'
                            : 'text-creme-papel/80'
                        }`}
                      >
                        {c.emoji} {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {photo.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform pointer-events-none">
                  <p className="font-script text-xs text-creme-papel">{photo.caption}</p>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Lazy load sentinel */}
      {hasMore && <div ref={sentinelRef} className="h-10" />}

      {photos.length === 0 && !showUploader && (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">📷</p>
          <p className="font-sans text-creme-papel/50 mb-4">Nenhuma foto ainda</p>
          <Button onClick={() => setShowUploader(true)}>Adicionar Fotos</Button>
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex}
        slides={lightboxSlides}
        on={{ view: ({ index }) => setLightboxIndex(index) }}
      />
    </div>
  )
}
