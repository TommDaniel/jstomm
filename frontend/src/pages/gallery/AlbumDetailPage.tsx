import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { api } from '@/lib/api'
import type { Album, PaginatedPhotos } from '@/types/gallery'
import PhotoUploader from '@/components/gallery/PhotoUploader'
import { Button } from '@/components/ui/button'

export default function AlbumDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [lightboxIndex, setLightboxIndex] = useState(-1)
  const [showUploader, setShowUploader] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const { data: album } = useQuery<Album>({
    queryKey: ['album', id],
    queryFn: () => api.get<Album>(`/albums/${id}`).then((r) => r.data),
  })

  const { data: photoPages } = useQuery<PaginatedPhotos>({
    queryKey: ['album-photos', id, page],
    queryFn: () =>
      api.get<PaginatedPhotos>(`/albums/${id}/photos?page=${page}`).then((r) => r.data),
    enabled: !!id,
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

      {/* Photo grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {photos.map((photo, i) => (
          <motion.button
            key={photo.id}
            className="relative aspect-square overflow-hidden rounded-xl group"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: (i % 12) * 0.03 }}
            onClick={() => setLightboxIndex(i)}
          >
            <img
              src={photo.thumbnail_path ? `/storage/${photo.thumbnail_path}` : `/storage/${photo.path}`}
              alt={photo.caption ?? ''}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {photo.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                <p className="font-script text-xs text-creme-papel">{photo.caption}</p>
              </div>
            )}
          </motion.button>
        ))}
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
